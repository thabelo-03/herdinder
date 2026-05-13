/**
 * Web stub for StorageManager.
 * The real storageManager.ts uses expo-sqlite and expo-file-system which are
 * native-only and crash the Metro web bundler. This file is automatically
 * picked by Metro on the web platform instead.
 */

export const TILE_CACHE_DIR = '';
export const MAX_OFFLINE_TILES = 0;

export const StorageManager = {
  async trackTile(_uri: string, _size: number) {},
  async getMapCacheSize(): Promise<number> { return 0; },
  async syncFileSystemToIndex(): Promise<void> {},
  async getAllTilesFromFS(): Promise<[]> { return []; },
  async pruneCache(): Promise<void> {},
  async downloadRegion(): Promise<void> {},
  async syncHerdArea(_animals: any[], _onProgress?: (d: number, t: number) => void): Promise<void> {},
  getTileList(): [] { return []; },
  async getCacheCoverage(): Promise<[]> { return []; },
  async clearMapCache(): Promise<void> {},
  async checkStorageHealth(): Promise<void> {},
};
