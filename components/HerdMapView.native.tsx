import { FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { LatLng, Marker, Polygon, Region } from 'react-native-maps';
import Colors, { getCategoryColor, getCategoryIcon, getTempColor } from '../constants/Colors';
import { MAX_OFFLINE_TILES, StorageManager, TILE_CACHE_DIR } from '../services/storageManager';
import { Animal, SafeZone } from '../types';
import BreathingDot from './BreathingDot';
import OfflineTileOverlay from './OfflineTileOverlay';

interface Props {
  animals: Animal[];
  safeZone: SafeZone;
  selectedAnimal: Animal | null;
  onMarkerPress: (animal: Animal) => void;
}

interface OfflineTileOverlayProps {
  cachePath: string;
  urlTemplate?: string;
  maximumZ?: number;
  zIndex?: number;
  opacity?: number;
  fade?: boolean;
  visible?: boolean;
  tileSize?: number;
}

const BASE_LAT = -21.416589;
const BASE_LNG = 28.064443;
const INITIAL_REGION = { latitude: BASE_LAT, longitude: BASE_LNG, latitudeDelta: 0.06, longitudeDelta: 0.06 };
export default function HerdMapView({ animals, safeZone, selectedAnimal, onMarkerPress }: Props) {
  const mapRef = useRef<MapView>(null);
  const [delta, setDelta] = useState(0.06);
  const [currentRegion, setCurrentRegion] = useState<Region>(INITIAL_REGION);
  const [downloadProgress, setDownloadProgress] = useState<{ d: number, t: number } | null>(null);

  // New state for the interactive download rectangle
  const [showDownloadArea, setShowDownloadArea] = useState(false);
  const [downloadRegion, setDownloadRegion] = useState<Region>({
    ...INITIAL_REGION, latitudeDelta: 0.02, longitudeDelta: 0.02, // Initial fixed small size for the download area
  });
  const [estimatedDownloadSizeMB, setEstimatedDownloadSizeMB] = useState<string | null>(null);

  // New state for visualizing cached areas
  const [showCoverage, setShowCoverage] = useState(false);
  const [cacheCoverage, setCacheCoverage] = useState<{ minLat: number; maxLat: number; minLng: number; maxLng: number }[]>([]);

  const zoom = useCallback((factor: number) => {
    const next = Math.min(Math.max(delta * factor, 0.002), 1);
    setDelta(next);
    mapRef.current?.animateToRegion({ latitude: BASE_LAT, longitude: BASE_LNG, latitudeDelta: next, longitudeDelta: next }, 300);
  }, [delta]);

  const recenter = useCallback(() => {
    mapRef.current?.animateToRegion(INITIAL_REGION, 400);
    setDelta(0.06);
  }, []);

  const handlePress = useCallback((animal: Animal) => {
    onMarkerPress(animal);
    mapRef.current?.animateToRegion({ latitude: animal.latitude, longitude: animal.longitude, latitudeDelta: delta, longitudeDelta: delta }, 400);
  }, [onMarkerPress, delta]);

  const toggleDownloadArea = () => {
    if (!showDownloadArea) {
      // When turning on, center it on the current map view
      setDownloadRegion({
        latitude: currentRegion.latitude,
        longitude: currentRegion.longitude,
        latitudeDelta: 0.02, // Keep a fixed small size for now
        longitudeDelta: 0.02,
      });
      setEstimatedDownloadSizeMB(null); // Clear estimate when toggling on
    }
    setShowDownloadArea(!showDownloadArea);
  };

  const handleCornerDrag = (corner: 'nw' | 'ne' | 'sw' | 'se', coord: LatLng) => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = downloadRegion;

    // Calculate current bounds
    let n = latitude + latitudeDelta / 2;
    let s = latitude - latitudeDelta / 2;
    let e = longitude + longitudeDelta / 2;
    let w = longitude - longitudeDelta / 2;

    // Update based on which corner is being dragged
    if (corner.startsWith('n')) n = coord.latitude;
    if (corner.startsWith('s')) s = coord.latitude;
    if (corner.endsWith('w')) w = coord.longitude;
    if (corner.endsWith('e')) e = coord.longitude;

    setDownloadRegion({
      latitude: (n + s) / 2,
      longitude: (e + w) / 2,
      latitudeDelta: Math.max(0.0005, Math.abs(n - s)),
      longitudeDelta: Math.max(0.0005, Math.abs(e - w)),
    });
  };

  const handleDownload = async () => {
    const targetRegion = showDownloadArea ? downloadRegion : currentRegion;

    const bbox = {
      minLat: targetRegion.latitude - targetRegion.latitudeDelta / 2,
      maxLat: targetRegion.latitude + targetRegion.latitudeDelta / 2,
      minLng: targetRegion.longitude - targetRegion.longitudeDelta / 2,
      maxLng: targetRegion.longitude + targetRegion.longitudeDelta / 2,
    };

    // Calculate actual tile count for precise validation before starting the download
    const tiles = StorageManager.getTileList(bbox, 14, 17);
    const tileCount = tiles.length;

    if (tileCount > MAX_OFFLINE_TILES) {
      Alert.alert('Area Too Large', `The selected region requires ${tileCount} tiles. Please zoom in or reduce the selection area (limit is ${MAX_OFFLINE_TILES} tiles).`);
      return;
    }

    setDownloadProgress({ d: 0, t: 1 });
    try {
      // Download zoom levels 14 to 17 for detailed satellite view
      await StorageManager.downloadRegion(bbox, 14, 17, (d: number, t: number) => {
        setDownloadProgress({ d, t }); // Update progress
      });
      Alert.alert('Download Complete', 'The current map area is now available offline.');
    } catch (e) {
      Alert.alert('Download Failed', 'Could not save map tiles for offline use.');
    } finally {
      setDownloadProgress(null);
    }
  };

  // Helper to convert a Region to Polygon coordinates
  const regionToPolygon = (region: Region): LatLng[] => {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = region;
    const north = latitude + latitudeDelta / 2;
    const south = latitude - latitudeDelta / 2;
    const east = longitude + longitudeDelta / 2;
    const west = longitude - longitudeDelta / 2;
    return [
      { latitude: north, longitude: west }, { latitude: north, longitude: east },
      { latitude: south, longitude: east }, { latitude: south, longitude: west },
      { latitude: north, longitude: west }, // Close the polygon
    ];
  };

  const toggleCoverage = async () => {
    if (!showCoverage) {
      const data = await StorageManager.getCacheCoverage();
      setCacheCoverage(data);
    }
    setShowCoverage(!showCoverage);
  };

  const bboxToPolygon = (bbox: { minLat: number; maxLat: number; minLng: number; maxLng: number }): LatLng[] => [
    { latitude: bbox.maxLat, longitude: bbox.minLng },
    { latitude: bbox.maxLat, longitude: bbox.maxLng },
    { latitude: bbox.minLat, longitude: bbox.maxLng },
    { latitude: bbox.minLat, longitude: bbox.minLng },
    { latitude: bbox.maxLat, longitude: bbox.minLng },
  ];

  // Corner coordinates for the handles
  const bounds = {
    n: downloadRegion.latitude + downloadRegion.latitudeDelta / 2,
    s: downloadRegion.latitude - downloadRegion.latitudeDelta / 2,
    e: downloadRegion.longitude + downloadRegion.longitudeDelta / 2,
    w: downloadRegion.longitude - downloadRegion.longitudeDelta / 2,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="none"
        initialRegion={INITIAL_REGION}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        onRegionChangeComplete={(r) => {
          setCurrentRegion(r);
          setDelta((r.latitudeDelta + r.longitudeDelta) / 2);
          console.log('[JS] Passing cachePath to native:', TILE_CACHE_DIR);
        }}
      >
        {/* Import the custom OfflineTileOverlay component */}
        <OfflineTileOverlay
          cachePath={TILE_CACHE_DIR}
          urlTemplate={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}?access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`}
          maximumZ={19}
          zIndex={-1}
          tileSize={512}
        />

        {/* Download Area Rectangle */}
        {showDownloadArea && (
          <>
            <Polygon
              coordinates={regionToPolygon(downloadRegion)}
              strokeColor={Colors.primary}
              strokeWidth={3}
              fillColor={Colors.primary + '30'} // Semi-transparent fill
              lineDashPattern={[10, 5]}
            />
            {/* Draggable center marker for the download area */}
            <Marker
              coordinate={{ latitude: downloadRegion.latitude, longitude: downloadRegion.longitude }}
              draggable
              onDragEnd={(e) => {
                setDownloadRegion((prev) => ({
                  ...prev, latitude: e.nativeEvent.coordinate.latitude, longitude: e.nativeEvent.coordinate.longitude,
                }));
              }}
              anchor={{ x: 0.5, y: 0.5 }} // Center the icon on the coordinate
              zIndex={10}
            >
              <View style={styles.downloadAreaHandle}>
                <FontAwesome name="arrows-alt" size={16} color="#FFF" />
              </View>
            </Marker>

            {estimatedDownloadSizeMB && (
              <View style={styles.estimatedSizeLabel}>
                <Text style={styles.estimatedSizeText}>{estimatedDownloadSizeMB} MB</Text>
              </View>
            )}
            {/* Corner Resizing Handles */}
            {[
              { id: 'nw', lat: bounds.n, lng: bounds.w },
              { id: 'ne', lat: bounds.n, lng: bounds.e },
              { id: 'sw', lat: bounds.s, lng: bounds.w },
              { id: 'se', lat: bounds.s, lng: bounds.e },
            ].map((corner) => (
              <Marker
                key={corner.id}
                coordinate={{ latitude: corner.lat, longitude: corner.lng }}
                draggable
                onDrag={(e) => handleCornerDrag(corner.id as any, e.nativeEvent.coordinate)}
                onDragEnd={(e) => handleCornerDrag(corner.id as any, e.nativeEvent.coordinate)}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
              >
                <View style={styles.cornerHandle} />
              </Marker>
            ))}
          </>
        )}

        {/* Offline Cache Coverage visualization */}
        {showCoverage && cacheCoverage.map((bbox, index) => (
          <Polygon
            key={`coverage-${index}`}
            coordinates={bboxToPolygon(bbox)}
            strokeColor={Colors.info}
            strokeWidth={1}
            fillColor={Colors.info + '20'}
            zIndex={-1}
          />
        ))}

        <Polygon coordinates={safeZone.coordinates} strokeColor={Colors.safeZoneBorder} strokeWidth={2} fillColor={Colors.safeZoneFill} lineDashPattern={[8, 6]} />

        {animals.map((animal: Animal) => {
          const isCattle = animal.category === 'cattle';
          const categoryColor = getCategoryColor(animal.category);
          const iconName = getCategoryIcon(animal.category) as any;
          // Cattle markers show temperature color, vehicles show category color
          const pinColor = isCattle ? getTempColor(animal.temperature) : categoryColor;
          const isSelected = selectedAnimal?.id === animal.id;

          // Status text for vehicles
          const statusLabel = !isCattle
            ? (animal.speed && animal.speed > 0 ? `${animal.speed} km/h` : animal.status)
            : `${animal.temperature}°C`;

          return (
            <Marker key={animal.id} coordinate={{ latitude: animal.latitude, longitude: animal.longitude }} onPress={() => handlePress(animal)} anchor={{ x: 0.5, y: 1 }} tracksViewChanges={false}>
              <View style={styles.markerWrapper}>
                <View style={[
                  styles.markerBubble,
                  isSelected && { borderColor: Colors.primary, borderWidth: 2 },
                  !isCattle && { borderColor: categoryColor + '60' },
                ]}>
                  <Text style={styles.markerName}>{animal.name}</Text>
                  <Text style={[styles.markerTemp, { color: isCattle ? getTempColor(animal.temperature) : categoryColor }]}>
                    {statusLabel}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {animal.status === 'Moving' && (
                    <BreathingDot color={pinColor} size={30} style={{ position: 'absolute', top: -6 }} />
                  )}
                  <View style={[styles.markerPin, { backgroundColor: pinColor }]}>
                    <FontAwesome name={iconName} size={10} color="#FFF" />
                  </View>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlBtn} onPress={recenter}>
          <FontAwesome name="crosshairs" size={17} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => zoom(0.5)}>
          <FontAwesome name="plus" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} onPress={() => zoom(2)}>
          <FontAwesome name="minus" size={16} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.controlBtn, { backgroundColor: Colors.primary }]} onPress={handleDownload} disabled={!!downloadProgress}>
          <FontAwesome name="download" size={16} color="#FFF" />
        </TouchableOpacity>
        {/* New button to toggle download area */}
        <TouchableOpacity
          style={[styles.controlBtn, showDownloadArea && { backgroundColor: Colors.info }]}
          onPress={toggleDownloadArea}
        >
          <FontAwesome name="square-o" size={16} color={showDownloadArea ? '#FFF' : Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlBtn, showCoverage && { backgroundColor: Colors.success }]}
          onPress={toggleCoverage}
        >
          <FontAwesome name="database" size={15} color={showCoverage ? '#FFF' : Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Safe Zone badge */}
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Safe Zone Active</Text>
      </View>

      {/* Download Progress Overlay */}
      {downloadProgress && (
        <View style={styles.downloadOverlay}>
          <View style={styles.downloadCard}>
            <Text style={styles.downloadTitle}>Downloading Area...</Text>
            <Text style={styles.downloadStatus}>
              {downloadProgress.d} of {downloadProgress.t} tiles
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${(downloadProgress.d / downloadProgress.t) * 100}%` }]}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerWrapper: { alignItems: 'center' },
  markerBubble: {
    backgroundColor: 'rgba(10,10,20,0.90)', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 5, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 6,
  },
  markerName: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  markerTemp: { fontSize: 13, fontWeight: 'bold', marginTop: 1 },
  markerPin: {
    width: 22, height: 22, borderRadius: 11,
    justifyContent: 'center', alignItems: 'center',
    marginTop: -2, borderWidth: 2, borderColor: '#FFF', elevation: 6,
  },
  controls: { position: 'absolute', right: 12, top: '28%', gap: 10 },
  controlBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(10,10,20,0.88)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', elevation: 6,
  },
  badge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,10,20,0.82)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.safeZoneBorder, gap: 6,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.safeZoneBorder },
  badgeText: { color: Colors.safeZoneBorder, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  estimatedSizeLabel: {
    position: 'absolute',
    bottom: 10, // Adjust position as needed
    alignSelf: 'center',
    backgroundColor: 'rgba(10,10,20,0.88)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 10,
  },
  estimatedSizeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  downloadAreaHandle: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF',
  },
  cornerHandle: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF',
    borderWidth: 2, borderColor: Colors.primary,
  },
  downloadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
  },
  downloadCard: {
    width: '80%', backgroundColor: Colors.cardElevated, borderRadius: 16,
    padding: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  downloadTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  downloadStatus: { color: Colors.textSecondary, fontSize: 14, marginBottom: 16 },
  progressBar: { width: '100%', height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Colors.primary },
});
