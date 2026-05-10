import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapContainer, TileLayer, Polygon, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Animal, SafeZone } from '../types';
import { getTempColor } from '../constants/Colors';

interface Props {
  animals: Animal[];
  safeZone: SafeZone;
  selectedAnimal: Animal | null;
  onMarkerPress: (animal: Animal) => void;
}

function useLeafletCSS() {
  useEffect(() => {
    const id = 'leaflet-css';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);
}

function buildIcon(animal: Animal, isSelected: boolean): L.DivIcon {
  const color = getTempColor(animal.temperature);
  const border = isSelected ? '#FFD700' : 'rgba(255,255,255,0.22)';
  const bw = isSelected ? 2 : 1;

  return L.divIcon({
    className: '',
    iconAnchor: [44, 54],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;width:88px">
        <div style="
          background:rgba(10,10,20,0.92);
          border-radius:10px;
          padding:5px 10px;
          border:${bw}px solid ${border};
          text-align:center;
          box-shadow:0 2px 10px rgba(0,0,0,0.7);
          white-space:nowrap;
          width:100%;
        ">
          <div style="color:#fff;font-size:11px;font-weight:700;font-family:sans-serif">${animal.name}</div>
          <div style="color:${color};font-size:13px;font-weight:700;font-family:sans-serif;margin-top:2px">${animal.temperature}°C</div>
        </div>
        <div style="
          width:22px;height:22px;border-radius:50%;
          background:${color};border:2px solid #fff;
          display:flex;align-items:center;justify-content:center;
          margin-top:-2px;box-shadow:0 2px 6px rgba(0,0,0,0.6);
          font-size:11px;line-height:22px;text-align:center;
        ">🐾</div>
      </div>
    `,
  });
}

function MapContent({ animals, safeZone, selectedAnimal, onMarkerPress }: Props) {
  const map = useMap();

  useEffect(() => {
    if (selectedAnimal) {
      map.flyTo([selectedAnimal.latitude, selectedAnimal.longitude], map.getZoom(), { duration: 0.6 });
    }
  }, [selectedAnimal, map]);

  const safeZonePositions = safeZone.coordinates.map(
    (c) => [c.latitude, c.longitude] as [number, number],
  );

  return (
    <>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`}
        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
        maxZoom={19}
      />
      <Polygon
        positions={safeZonePositions}
        pathOptions={{ color: '#FFD700', weight: 2, fillColor: '#FFD700', fillOpacity: 0.12, dashArray: '8 6' }}
      />
      {animals.map((animal) => (
        <Marker
          key={animal.id}
          position={[animal.latitude, animal.longitude]}
          icon={buildIcon(animal, selectedAnimal?.id === animal.id)}
          eventHandlers={{ click: () => onMarkerPress(animal) }}
        />
      ))}
    </>
  );
}

export default function InnerMap(props: Props) {
  useLeafletCSS();

  return (
    <View style={styles.container}>
      <MapContainer center={[-21.416589, 28.064443]} zoom={13} style={{ width: '100%', height: '100%' }} zoomControl={false}>
        <MapContent {...props} />
      </MapContainer>
      <View style={styles.badge}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>Safe Zone Active</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  badge: {
    position: 'absolute', top: 12, left: 12, zIndex: 1000,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,10,20,0.82)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#FFD700', gap: 6,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700' },
  badgeText: { color: '#FFD700', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});
