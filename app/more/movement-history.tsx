import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors, { getCategoryColor, getCategoryIcon } from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';

export default function MovementHistoryScreen() {
  const animals = useAnimalStore((s) => s.animals);
  
  // Mock history data based on current animals
  const [history] = useState(() => {
    const logs = [];
    animals.forEach(a => {
      // Mock some recent events
      logs.push({
        id: Math.random().toString(),
        animal: a,
        type: 'movement',
        time: new Date(Date.now() - Math.random() * 10000000),
        desc: `Spotted at ${a.latitude.toFixed(4)}, ${a.longitude.toFixed(4)}`
      });
      if (a.temperature > 39) {
        logs.push({
          id: Math.random().toString(),
          animal: a,
          type: 'alert',
          time: new Date(Date.now() - Math.random() * 5000000),
          desc: `High temperature alert (${a.temperature}°C)`
        });
      }
    });
    return logs.sort((a, b) => b.time.getTime() - a.time.getTime());
  });

  const renderItem = ({ item }: { item: any }) => {
    const isAlert = item.type === 'alert';
    const catColor = getCategoryColor(item.animal.category);
    const catIcon = getCategoryIcon(item.animal.category) as any;

    return (
      <View style={styles.historyItem}>
        <View style={styles.timelineColumn}>
          <View style={[styles.dot, isAlert ? { backgroundColor: Colors.danger } : { backgroundColor: catColor }]} />
          <View style={styles.line} />
        </View>
        <View style={styles.contentColumn}>
          <View style={styles.headerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <FontAwesome name={catIcon} size={12} color={catColor} />
              <Text style={styles.animalName}>{item.animal.name}</Text>
            </View>
            <Text style={styles.timeText}>
              {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={[styles.descCard, isAlert && styles.descCardAlert]}>
            <Text style={[styles.descText, isAlert && styles.descTextAlert]}>{item.desc}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.title}>Movement Log</Text>
            <Text style={styles.subtitle}>Recent tracking events from your devices.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  listContent: { padding: 20, paddingBottom: 40 },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: Colors.textSecondary, fontSize: 14 },
  historyItem: { flexDirection: 'row' },
  timelineColumn: { width: 30, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, zIndex: 2, marginTop: 4 },
  line: { width: 2, flex: 1, backgroundColor: Colors.border, position: 'absolute', top: 16, bottom: -16, zIndex: 1 },
  contentColumn: { flex: 1, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  animalName: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold' },
  timeText: { color: Colors.textMuted, fontSize: 12 },
  descCard: { backgroundColor: Colors.cardElevated, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.border },
  descCardAlert: { backgroundColor: Colors.danger + '10', borderColor: Colors.danger + '40' },
  descText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  descTextAlert: { color: Colors.danger },
});
