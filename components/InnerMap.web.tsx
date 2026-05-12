import L from 'leaflet';
import React, { useEffect } from 'react';
import { MapContainer, Marker, Polygon, TileLayer, useMap } from 'react-leaflet';
import { StyleSheet, Text, View } from 'react-native';
import { getCategoryColor, getTempColor } from '../constants/Colors';
import { Animal, SafeZone } from '../types';

interface Props {
  animals: Animal[];
  safeZone: SafeZone;
  selectedAnimal: Animal | null;
  onMarkerPress: (animal: Animal) => void;
  isPreview?: boolean;
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

      const style = document.createElement('style');
      style.innerHTML = `
        .leaflet-container { background: #0a0a14 !important; }
        @keyframes hf-breathe {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .hf-breathing-dot {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          top: -4px;
          left: calc(50% - 15px);
          animation: hf-breathe 1.5s infinite;
          pointer-events: none;
          z-index: 1;
        }
        .leaflet-div-icon { background: transparent !important; border: none !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);
}

function buildIcon(animal: Animal, isSelected: boolean): L.DivIcon {
  const isCattle = animal.category === 'cattle';
  const color = isCattle ? getTempColor(animal.temperature) : getCategoryColor(animal.category);
  const border = isSelected ? '#FFD700' : 'rgba(255,255,255,0.22)';
  const bw = isSelected ? 2 : 1;

  const iconChar = isCattle ? '🐾' : animal.category === 'motorbike' ? '🏍️' : '🚙';
  const statusLabel = isCattle ? `${animal.temperature}°C` : (animal.speed && animal.speed > 0 ? `${animal.speed} km/h` : animal.status);

  const breathingHtml = animal.status === 'Moving'
    ? `<div class="hf-breathing-dot" style="background-color: ${color}"></div>`
    : '';

  return L.divIcon({
    className: '',
    iconAnchor: [44, 54],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;width:88px;position:relative;">
        <div style="
          background:rgba(10,10,20,0.92);
          border-radius:10px;
          padding:5px 10px;
          border:${bw}px solid ${border};
          text-align:center;
          box-shadow:0 2px 10px rgba(0,0,0,0.7);
          white-space:nowrap;
          width:100%;
          position:relative;
          z-index:2;
        ">
          <div style="color:#fff;font-size:13px;font-weight:800;font-family:sans-serif">${animal.name}</div>
          <div style="color:${color};font-size:13px;font-weight:700;font-family:sans-serif;margin-top:2px">${statusLabel}</div>
        </div>
        <div style="position:relative;display:flex;align-items:center;justify-content:center;margin-top:-2px;">
          ${breathingHtml}
          <div style="
            width:22px;height:22px;border-radius:50%;
            background:${color};border:2px solid #fff;
            display:flex;align-items:center;justify-content:center;
            box-shadow:0 2px 6px rgba(0,0,0,0.6);
            font-size:11px;line-height:22px;text-align:center;
            position:relative;
            z-index:2;
          ">${iconChar}</div>
        </div>
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
        url={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`}
        attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
        maxZoom={20}
        tileSize={512}
        zoomOffset={-1}
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

  const center = props.safeZone.coordinates.length > 0 
    ? [props.safeZone.coordinates[0].latitude, props.safeZone.coordinates[0].longitude] as [number, number]
    : [-21.416589, 28.064443] as [number, number];

  return (
    <View style={styles.container}>
      <MapContainer center={center} zoom={15} style={{ width: '100%', height: '100%' }} zoomControl={false}>
        <MapContent {...props} />
      </MapContainer>
      {!props.isPreview && (
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Safe Zone Active</Text>
        </View>
      )}
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
