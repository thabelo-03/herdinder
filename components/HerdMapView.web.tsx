/**
 * Web map using Google Maps JavaScript API (hybrid/satellite mode).
 * Supports cattle (paw icon), motorbikes (M icon), vehicles (V icon)
 */
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Animal, SafeZone } from '../types';
import { getTempColor, getCategoryColor } from '../constants/Colors';

// ← Paste your Google Maps API key here
const GOOGLE_MAPS_API_KEY = 'AIzaSyB38fZHOQbpLS1ArLMJGWZ8WTGqt8NULns';

interface Props {
  animals: Animal[];
  safeZone: SafeZone;
  selectedAnimal: Animal | null;
  onMarkerPress: (animal: Animal) => void;
}

function getCategorySvgIcon(category: string): string {
  switch (category) {
    case 'cattle': return '🐄';
    case 'motorbike': return '🏍';
    case 'vehicle': return '🚗';
    default: return '📍';
  }
}

export default function HerdMapView({ animals, safeZone, selectedAnimal, onMarkerPress }: Props) {
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'markerPress') {
        const animal = animals.find((a) => a.id === e.data.animalId);
        if (animal) onMarkerPress(animal);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [animals, onMarkerPress]);

  const safeZoneCoords = safeZone.coordinates
    .map((c) => `{ lat: ${c.latitude}, lng: ${c.longitude} }`)
    .join(', ');

  const markersJs = animals
    .map((a) => {
      const isCattle = a.category === 'cattle';
      const color = isCattle ? getTempColor(a.temperature) : getCategoryColor(a.category);
      const hexColor = color.replace('#', '');
      const isSelected = selectedAnimal?.id === a.id;
      const borderColor = isSelected ? 'FFD700' : 'ffffff';

      // Status label: temp for cattle, speed/status for vehicles
      const statusLabel = isCattle
        ? `${a.temperature}°C`
        : (a.speed && a.speed > 0 ? `${a.speed} km/h` : a.status || 'Parked');

      // Category icon letter for SVG
      const iconLetter = isCattle ? '♦' : (a.category === 'motorbike' ? 'M' : 'V');

      return `
        (function() {
          var pos = { lat: ${a.latitude}, lng: ${a.longitude} };
          var marker = new google.maps.Marker({
            position: pos,
            map: map,
            icon: {
              url: 'data:image/svg+xml;utf-8,' + encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="54">' +
                  '<rect x="1" y="1" width="62" height="34" rx="8" fill="rgba(10,10,20,0.92)" stroke="#${borderColor}" stroke-width="${isSelected ? 2 : 1}"/>' +
                  '<text x="32" y="15" text-anchor="middle" font-family="sans-serif" font-size="10" font-weight="700" fill="white">${a.name}</text>' +
                  '<text x="32" y="29" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="700" fill="#${hexColor}">${statusLabel}</text>' +
                  '<circle cx="32" cy="46" r="8" fill="#${hexColor}" stroke="white" stroke-width="2"/>' +
                  '<text x="32" y="50" text-anchor="middle" font-family="sans-serif" font-size="8" font-weight="700" fill="white">${iconLetter}</text>' +
                '</svg>'
              ),
              anchor: new google.maps.Point(32, 54),
            },
            title: '${a.name}',
          });
          marker.addListener('click', function() {
            window.parent.postMessage({ type: 'markerPress', animalId: '${a.id}' }, '*');
          });
        })();
      `;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body,#map{width:100%;height:100%}
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function initMap() {
      var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -20.85, lng: 29.05 },
        zoom: 13,
        mapTypeId: 'hybrid',
        disableDefaultUI: true,
        gestureHandling: 'greedy',
        styles: [],
      });

      // Safe Zone polygon
      var safeZone = new google.maps.Polygon({
        paths: [${safeZoneCoords}],
        strokeColor: '#FFD700',
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: '#FFD700',
        fillOpacity: 0.12,
      });
      safeZone.setMap(map);

      // Asset markers (cattle + motorbikes + vehicles)
      ${markersJs}
    }
  </script>
  <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap" async defer></script>
</body>
</html>`;

  return (
    <View style={styles.container}>
      {/* @ts-ignore */}
      <iframe
        srcDoc={html}
        style={{ flex: 1, border: 'none', width: '100%', height: '100%' } as any}
        sandbox="allow-scripts allow-same-origin"
      />
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
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(10,10,20,0.82)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#FFD700', gap: 6,
  },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFD700' },
  badgeText: { color: '#FFD700', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
});
