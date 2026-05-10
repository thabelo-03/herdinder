import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polygon, UrlTile } from 'react-native-maps';
import Colors from '../constants/Colors';

interface Props {
  initialCenter: { latitude: number; longitude: number };
  points: { latitude: number; longitude: number }[];
  onMapPress: (coordinate: { latitude: number; longitude: number }) => void;
}

export default function SafeZoneEditorMapNative({ initialCenter, points, onMapPress }: Props) {
  const mapRef = useRef<MapView>(null);

  const handlePress = (e: any) => {
    onMapPress(e.nativeEvent.coordinate);
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        mapType="none"
        initialRegion={{
          ...initialCenter,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        showsUserLocation={false}
        showsCompass={false}
        toolbarEnabled={false}
        onPress={handlePress}
      >
        <UrlTile 
          urlTemplate={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`} 
          maximumZ={19} 
          zIndex={-1} 
        />

        {points.length > 2 && (
          <Polygon 
            coordinates={points} 
            strokeColor={Colors.safeZoneBorder} 
            strokeWidth={2} 
            fillColor={Colors.safeZoneFill} 
            lineDashPattern={[8, 6]} 
          />
        )}

        {points.length === 2 && (
          <Polygon 
            coordinates={points} 
            strokeColor={Colors.safeZoneBorder} 
            strokeWidth={2} 
            fillColor="transparent"
            lineDashPattern={[8, 6]} 
          />
        )}

        {points.map((pt, index) => (
          <Marker 
            key={`pt-${index}`} 
            coordinate={pt} 
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.vertex} />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  vertex: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFF',
    borderWidth: 3,
    borderColor: Colors.safeZoneBorder,
  }
});
