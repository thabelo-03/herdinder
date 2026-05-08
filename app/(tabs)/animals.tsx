/**
 * Animals Screen - List of all registered cattle
 * Shows each animal with name, last seen time, and temperature
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors, { getTempColor, getTempStatus } from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';
import { Animal } from '../../types';

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function AnimalsScreen() {
  const router = useRouter();
  const animals = useAnimalStore((s) => s.animals);
  const [search, setSearch] = useState('');
  const [filterHerd, setFilterHerd] = useState<string | null>(null);

  const herds = [...new Set(animals.map((a) => a.herdName))];

  const filtered = animals.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchHerd = !filterHerd || a.herdName === filterHerd;
    return matchSearch && matchHerd;
  });

  const renderAnimal = ({ item }: { item: Animal }) => {
    const tempColor = getTempColor(item.temperature);
    const status = getTempStatus(item.temperature);

    return (
      <TouchableOpacity
        style={styles.animalRow}
        onPress={() => router.push(`/animal/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View style={[styles.animalIcon, { borderColor: tempColor }]}>
          <FontAwesome name="paw" size={18} color={tempColor} />
        </View>

        {/* Info */}
        <View style={styles.animalInfo}>
          <Text style={styles.animalName}>{item.name}</Text>
          <Text style={styles.animalSub}>
            {item.herdName} · {formatLastSeen(item.lastSeen)}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'Offline' ? Colors.danger : Colors.success }]} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>

        {/* Temperature */}
        <View style={styles.tempBlock}>
          <Text style={[styles.tempValue, { color: tempColor }]}>
            {item.temperature}°C
          </Text>
        </View>

        <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Animals</Text>
        <Text style={styles.headerCount}>{animals.length} total</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={14} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <FontAwesome name="times-circle" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Herd Filter Pills */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterPill, !filterHerd && styles.filterPillActive]}
          onPress={() => setFilterHerd(null)}
        >
          <Text style={[styles.filterPillText, !filterHerd && styles.filterPillTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        {herds.map((herd) => (
          <TouchableOpacity
            key={herd}
            style={[styles.filterPill, filterHerd === herd && styles.filterPillActive]}
            onPress={() => setFilterHerd(filterHerd === herd ? null : herd)}
          >
            <Text style={[styles.filterPillText, filterHerd === herd && styles.filterPillTextActive]}>
              {herd}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Animal List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderAnimal}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="paw" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No animals found</Text>
          </View>
        }
      />

      {/* FAB to add new animal */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <FontAwesome name="plus" size={22} color={Colors.textOnPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerCount: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: Colors.textOnPrimary,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  animalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  animalIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.08)',
    borderWidth: 2,
    marginRight: 12,
  },
  animalInfo: {
    flex: 1,
  },
  animalName: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  animalSub: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  tempBlock: {
    marginRight: 8,
  },
  tempValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
});
