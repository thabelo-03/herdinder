import L from 'leaflet';
import React, { useEffect } from 'react';
import { MapContainer, Marker, Polygon, TileLayer, useMapEvents } from 'react-leaflet';
import { StyleSheet, View } from 'react-native';
import Colors from '../constants/Colors';

interface Props {
    initialCenter: { latitude: number; longitude: number };
    points: { latitude: number; longitude: number }[];
    onMapPress: (coordinate: { latitude: number; longitude: number }) => void;
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

function MapEvents({ onMapPress }: { onMapPress: Props['onMapPress'] }) {
    useMapEvents({
        click(e) {
            onMapPress({ latitude: e.latlng.lat, longitude: e.latlng.lng });
        },
    });
    return null;
}

function MapContent({ points, onMapPress }: Omit<Props, 'initialCenter'>) {
    const positions = points.map(p => [p.latitude, p.longitude] as [number, number]);

    const vertexIcon = L.divIcon({
        className: '',
        iconAnchor: [6, 6],
        html: `<div style="width:12px;height:12px;border-radius:6px;background:#FFF;border:3px solid ${Colors.safeZoneBorder};"></div>`,
    });

    return (
        <>
            <TileLayer
                url={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`}
                attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
                maxZoom={19}
            />
            <MapEvents onMapPress={onMapPress} />

            {points.length > 0 && (
                <Polygon
                    positions={positions}
                    pathOptions={{
                        color: Colors.safeZoneBorder,
                        weight: 2,
                        fillColor: points.length > 2 ? Colors.safeZoneBorder : 'transparent',
                        fillOpacity: points.length > 2 ? 0.12 : 0,
                        dashArray: '8 6'
                    }}
                />
            )}

            {points.map((pt, i) => (
                <Marker
                    key={`pt-${i}`}
                    position={[pt.latitude, pt.longitude]}
                    icon={vertexIcon}
                />
            ))}
        </>
    );
}

export default function InnerSafeZoneEditorMap({ initialCenter, points, onMapPress }: Props) {
    useLeafletCSS();

    return (
        <View style={styles.container}>
            <MapContainer
                center={[initialCenter.latitude, initialCenter.longitude]}
                zoom={13}
                style={{ width: '100%', height: '100%' }}
                zoomControl={false}
            >
                <MapContent points={points} onMapPress={onMapPress} />
            </MapContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
