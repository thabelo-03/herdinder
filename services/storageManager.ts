import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Alert, DeviceEventEmitter } from 'react-native';

function lon2tile(lon: number, zoom: number) {
    return Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
}

function lat2tile(lat: number, zoom: number) {
    return Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
}

function tile2lon(x: number, z: number) {
    return (x / Math.pow(2, z) * 360 - 180);
}

function tile2lat(y: number, z: number) {
    const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

/**
 * Ensure the directory ends with a slash for consistent path concatenation.
 */
const docDir = FileSystem.documentDirectory ?? '';
export const TILE_CACHE_DIR = docDir.endsWith('/') ? `${docDir}map_tiles/` : `${docDir}/map_tiles/`;

const CACHE_LIMIT_MB = 500; // Trigger pruning if over 500MB
const PRUNE_TARGET_RATIO = 0.8; // Reduce to 80% of limit when pruning (400MB)
export const MAX_OFFLINE_TILES = 1000;

// Database singleton
let _dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (_dbPromise) return _dbPromise;

    _dbPromise = (async () => {
        const db = await SQLite.openDatabaseAsync('map_cache.db');

        // Initialize schema
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS tiles (
            uri TEXT PRIMARY KEY,
            z INTEGER,
            x INTEGER,
            y INTEGER,
            size INTEGER,
            last_accessed INTEGER
          );
          CREATE INDEX IF NOT EXISTS idx_last_accessed ON tiles(last_accessed);
        `);

        // Migration helper to check and add columns if they are missing.
        const tableInfo = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tiles)');
        const columns = tableInfo.map(c => c.name);

        if (!columns.includes('z')) await db.execAsync('ALTER TABLE tiles ADD COLUMN z INTEGER');
        if (!columns.includes('x')) await db.execAsync('ALTER TABLE tiles ADD COLUMN x INTEGER');
        if (!columns.includes('y')) await db.execAsync('ALTER TABLE tiles ADD COLUMN y INTEGER');

        return db;
    })();

    return _dbPromise;
}

export const StorageManager = {
    /**
     * Records or updates a tile in the tracking database.
     * Call this whenever a tile is downloaded or displayed.
     */
    async trackTile(uri: string, size: number, z?: number, x?: number, y?: number) {
        const db = await getDb();
        await db.runAsync(
            'INSERT OR REPLACE INTO tiles (uri, z, x, y, size, last_accessed) VALUES (?, ?, ?, ?, ?, ?)',
            [uri, z ?? null, x ?? null, y ?? null, size, Date.now()]
        );
    },

    /**
     * Fast calculation of the map tiles directory using SQLite.
     */
    async getMapCacheSize(): Promise<number> {
        try {
            const db = await getDb();
            const result = await db.getFirstAsync<{ total: number }>('SELECT SUM(size) as total FROM tiles');
            return result?.total || 0;
        } catch (e) {
            console.error('Error getting map cache size:', e);
            return 0;
        }
    },

    /**
     * Synchronizes the database index with the actual filesystem.
     * Useful for initial migration or periodic health checks.
     */
    async syncFileSystemToIndex(): Promise<void> {
        const diskTiles = await this.getAllTilesFromFS();
        const db = await getDb();

        await db.withTransactionAsync(async () => {
            await db.runAsync('DELETE FROM tiles');
            for (const tile of diskTiles) {
                const parts = tile.uri.split('/');
                const y = parseInt(parts.pop()?.split('.')[0] || '0');
                const x = parseInt(parts.pop() || '0');
                const z = parseInt(parts.pop() || '0');

                await db.runAsync(
                    'INSERT INTO tiles (uri, z, x, y, size, last_accessed) VALUES (?, ?, ?, ?, ?, ?)',
                    [tile.uri, z, x, y, tile.size, tile.mtime]
                );
            }
        });
    },

    /**
     * Internal helper to walk the FS (used only during sync).
     */
    async getAllTilesFromFS(dir: string = TILE_CACHE_DIR): Promise<{ uri: string; size: number; mtime: number }[]> {
        const info = await FileSystem.getInfoAsync(dir);
        if (!info.exists || !info.isDirectory) return [];

        const files = await FileSystem.readDirectoryAsync(dir);
        let results: { uri: string; size: number; mtime: number }[] = [];

        for (const file of files) {
            const uri = `${dir}${file}`;
            const fileInfo = await FileSystem.getInfoAsync(uri);

            if (fileInfo.isDirectory) {
                const subFiles = await this.getAllTilesFromFS(`${uri}/`);
                results = results.concat(subFiles);
            } else {
                if (fileInfo.exists) {
                    results.push({
                        uri,
                        size: fileInfo.size,
                        mtime: fileInfo.modificationTime || 0,
                    });
                }
            }
        }
        return results;
    },

    /**
     * Automatically prunes the oldest tiles if the cache exceeds the limit.
     */
    async pruneCache(): Promise<void> {
        try {
            let currentSize = await this.getMapCacheSize();
            const limitBytes = CACHE_LIMIT_MB * 1024 * 1024;

            if (currentSize <= limitBytes) return;

            const db = await getDb();
            // Query oldest tiles first using our high-performance index
            const oldestTiles = await db.getAllAsync<{ uri: string; size: number }>(
                'SELECT uri, size FROM tiles ORDER BY last_accessed ASC'
            );

            const targetSizeBytes = limitBytes * PRUNE_TARGET_RATIO;
            for (const tile of oldestTiles) {
                if (currentSize <= targetSizeBytes) break;
                await FileSystem.deleteAsync(tile.uri, { idempotent: true });
                await db.runAsync('DELETE FROM tiles WHERE uri = ?', [tile.uri]);
                currentSize -= tile.size;
            }
            console.log(`LRU Pruning complete. New size: ${(currentSize / (1024 * 1024)).toFixed(2)} MB`);
        } catch (e) {
            console.error('LRU Pruning failed:', e);
        }
    },

    /**
     * Downloads all tiles for a given bounding box and zoom levels.
     */
    async downloadRegion(
        bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number },
        minZ: number,
        maxZ: number,
        onProgress?: (downloaded: number, total: number) => void
    ) {
        const tiles: { z: number; x: number; y: number }[] = [];
        for (let z = minZ; z <= maxZ; z++) {
            const xMin = lon2tile(bbox.minLng, z);
            const xMax = lon2tile(bbox.maxLng, z);
            const yMin = lat2tile(bbox.maxLat, z);
            const yMax = lat2tile(bbox.minLat, z);

            for (let x = Math.min(xMin, xMax); x <= Math.max(xMin, xMax); x++) {
                for (let y = Math.min(yMin, yMax); y <= Math.max(yMin, yMax); y++) {
                    tiles.push({ z, x, y });
                }
            }
        }

        const total = tiles.length;
        if (total === 0) return;

        const batchSize = 5;
        for (let i = 0; i < total; i += batchSize) {
            const batch = tiles.slice(i, i + batchSize);
            await Promise.all(batch.map(async (tile) => {
                const dir = `${TILE_CACHE_DIR}${tile.z}/${tile.x}/`;
                const fileUri = `${dir}${tile.y}.png`;
                const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/${tile.z}/${tile.x}/${tile.y}?access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`;

                try {
                    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
                    const result = await FileSystem.downloadAsync(url, fileUri);
                    if (result.status === 200) {
                        const fileInfo = await FileSystem.getInfoAsync(fileUri);
                        const size = fileInfo.exists ? fileInfo.size : 0;
                        await this.trackTile(fileUri, size, tile.z, tile.x, tile.y);
                    }
                } catch (err) {
                    console.error(`Download failed for ${tile.z}/${tile.x}/${tile.y}:`, err);
                }
            }));
            onProgress?.(Math.min(i + batchSize, total), total);
        }
    },

    /**
     * Calculates the list of tiles for a region without downloading.
     * Used for estimating download size and validating limits.
     */
    getTileList(
        bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number },
        minZ: number,
        maxZ: number
    ) {
        const tiles: { z: number; x: number; y: number }[] = [];
        for (let z = minZ; z <= maxZ; z++) {
            const xMin = lon2tile(bbox.minLng, z);
            const xMax = lon2tile(bbox.maxLng, z);
            const yMin = lat2tile(bbox.maxLat, z);
            const yMax = lat2tile(bbox.minLat, z);

            for (let x = Math.min(xMin, xMax); x <= Math.max(xMin, xMax); x++) {
                for (let y = Math.min(yMin, yMax); y <= Math.max(yMin, yMax); y++) {
                    tiles.push({ z, x, y });
                }
            }
        }
        return tiles;
    },

    /**
     * Returns bounding boxes for cached tiles, aggregated at a mid-range zoom level
     * to show general areas of coverage.
     */
    async getCacheCoverage(): Promise<{ minLat: number; maxLat: number; minLng: number; maxLng: number }[]> {
        try {
            const db = await getDb();
            const rows = await db.getAllAsync<{ z: number, x: number, y: number }>(
                'SELECT DISTINCT z, x, y FROM tiles WHERE z IS NOT NULL'
            );

            const coverageZoom = 14;
            const regions = new Set<string>();

            rows.forEach((row: any) => {
                if (row.z < coverageZoom) return;
                // Find the parent tile coordinates at the coverage zoom level (Z=14)
                const factor = Math.pow(2, row.z - coverageZoom);
                const cx = Math.floor(row.x / factor);
                const cy = Math.floor(row.y / factor);
                regions.add(`${cx},${cy}`);
            });

            return Array.from(regions).map(key => {
                const [x, y] = key.split(',').map(Number);
                return {
                    minLat: tile2lat(y + 1, coverageZoom),
                    maxLat: tile2lat(y, coverageZoom),
                    minLng: tile2lon(x, coverageZoom),
                    maxLng: tile2lon(x + 1, coverageZoom),
                };
            });
        } catch (e) {
            console.error('Failed to get cache coverage:', e);
            return [];
        }
    },

    /**
     * Clears all downloaded map tiles.
     */
    async clearMapCache(): Promise<void> {
        try {
            const db = await getDb();
            await FileSystem.deleteAsync(TILE_CACHE_DIR, { idempotent: true });
            await FileSystem.makeDirectoryAsync(TILE_CACHE_DIR, { intermediates: true });
            await db.runAsync('DELETE FROM tiles');
        } catch (e) {
            console.error('Failed to clear map cache:', e);
        }
    },

    /**
     * Checks available device storage and warns the user if cache is large.
     */
    async checkStorageHealth(): Promise<void> {
        try {
            const freeSpace = await FileSystem.getFreeDiskStorageAsync();
            const cacheSize = await this.getMapCacheSize();
            const cacheMB = cacheSize / (1024 * 1024);

            if (cacheMB > CACHE_LIMIT_MB) {
                // Automatically prune to free up space without bothering the user
                await this.pruneCache();
            } else if (freeSpace < 500 * 1024 * 1024) {
                Alert.alert(
                    'Low Storage',
                    `Device storage is low (${(freeSpace / (1024 * 1024)).toFixed(0)}MB left). Would you like to clear the map cache?`,
                    [{ text: 'Cancel' }, { text: 'Clear Cache', onPress: () => this.clearMapCache() }]
                );
            }
        } catch (e) {
            console.error('Storage health check failed:', e);
        }
    }
};

// Listen for native tile access events to update LRU timestamps
if (DeviceEventEmitter) {
    DeviceEventEmitter.removeAllListeners('onTileAccess');
    DeviceEventEmitter.addListener('onTileAccess', async (event: { uri: string; size: number }) => {
        // Parse uri to extract z/x/y. format: .../map_tiles/z/x/y.png
        const parts = event.uri.split('/');
        const yWithExt = parts.pop(); // y.png
        const xStr = parts.pop();
        const zStr = parts.pop();

        if (zStr && xStr && yWithExt) {
            const yStr = yWithExt.split('.')[0];
            await StorageManager.trackTile(event.uri, event.size, parseInt(zStr), parseInt(xStr), parseInt(yStr));
        } else {
            await StorageManager.trackTile(event.uri, event.size);
        }
    });
}