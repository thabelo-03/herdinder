/**
 * Assets Screen - List of all registered cattle, motorbikes, and vehicles
 * Filter by category (All / Cattle / Motorbikes / Vehicles)
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors, { getTempColor, getCategoryColor, getCategoryIcon, getCategoryLabel } from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';
import { Animal, AssetCategory } from '../../types';

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

type FilterCategory = AssetCategory | 'all';

const CATEGORY_FILTERS: { label: string; value: FilterCategory; icon: string; color: string }[] = [
  { label: 'All', value: 'all', icon: 'th-large', color: Colors.primary },
  { label: 'Cattle', value: 'cattle', icon: 'paw', color: Colors.cattle },
  { label: 'Bikes', value: 'motorbike', icon: 'motorcycle', color: Colors.motorbike },
  { label: 'Vehicles', value: 'vehicle', icon: 'car', color: Colors.vehicle },
];

export default function AnimalsScreen() {
  const router = useRouter();
  const animals = useAnimalStore((s) => s.animals);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterGroup, setFilterGroup] = useState<string | null>(null);

  const filteredByCategory = filterCategory === 'all'
    ? animals
    : animals.filter((a) => a.category === filterCategory);

  const groups = [...new Set(filteredByCategory.map((a) => a.herdName))];

  const filtered = filteredByCategory.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      (a.plateNumber?.toLowerCase().includes(search.toLowerCase()));
    const matchGroup = !filterGroup || a.herdName === filterGroup;
    return matchSearch && matchGroup;
  });

  const renderAnimal = ({ item }: { item: Animal }) => {
    const isCattle = item.category === 'cattle';
    const categoryColor = getCategoryColor(item.category);
    const categoryIcon = getCategoryIcon(item.category) as any;

    return (
      <TouchableOpacity
        style={styles.animalRow}
        onPress={() => router.push(`/animal/${item.id}`)}
        activeOpacity={0.7}
      >
        {/* Icon */}
        <View style={[styles.animalIcon, { borderColor: categoryColor }]}>
          <FontAwesome name={categoryIcon} size={16} color={categoryColor} />
        </View>

        {/* Info */}
        <View style={styles.animalInfo}>
          <Text style={styles.animalName}>{item.name}</Text>
          <Text style={styles.animalSub}>
            {item.herdName} · {formatLastSeen(item.lastSeen)}
            {item.plateNumber ? ` · ${item.plateNumber}` : ''}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, {
            backgroundColor: item.status === 'Offline' ? Colors.danger :
              item.status === 'Moving' ? Colors.success :
              item.status === 'Parked' ? categoryColor : Colors.textSecondary
          }]} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>

        {/* Value — temp for cattle, speed for vehicles */}
        <View style={styles.tempBlock}>
          {isCattle ? (
            <Text style={[styles.tempValue, { color: getTempColor(item.temperature) }]}>
              {item.temperature}°C
            </Text>
          ) : (
            <Text style={[styles.tempValue, { color: categoryColor }]}>
              {item.speed != null && item.speed > 0 ? `${item.speed}km/h` : item.status}
            </Text>
          )}
        </View>

        <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Assets</Text>
        <Text style={styles.headerCount}>{animals.length} tracked</Text>
      </View>

      {/* Category Filter Tabs */}
      <View style={styles.categoryRow}>
        {CATEGORY_FILTERS.map((cat) => {
          const isActive = filterCategory === cat.value;
          const count = cat.value === 'all'
            ? animals.length
            : animals.filter((a) => a.category === cat.value).length;
          return (
            <TouchableOpacity
              key={cat.value}
              style={[styles.categoryTab, isActive && { backgroundColor: cat.color, borderColor: cat.color }]}
              onPress={() => { setFilterCategory(cat.value); setFilterGroup(null); }}
            >
              <FontAwesome name={cat.icon as any} size={12} color={isActive ? Colors.textOnPrimary : cat.color} />
              <Text style={[styles.categoryTabText, isActive && { color: Colors.textOnPrimary }]}>
                {cat.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={14} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or plate..."
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

      {/* Group Filter Pills */}
      {groups.length > 1 && (
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterPill, !filterGroup && styles.filterPillActive]}
            onPress={() => setFilterGroup(null)}
          >
            <Text style={[styles.filterPillText, !filterGroup && styles.filterPillTextActive]}>All</Text>
          </TouchableOpacity>
          {groups.map((group) => (
            <TouchableOpacity
              key={group}
              style={[styles.filterPill, filterGroup === group && styles.filterPillActive]}
              onPress={() => setFilterGroup(filterGroup === group ? null : group)}
            >
              <Text style={[styles.filterPillText, filterGroup === group && styles.filterPillTextActive]}>
                {group}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Asset List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderAnimal}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <FontAwesome name="search" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No assets found</Text>
          </View>
        }
      />

      {/* FAB to add new asset */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <FontAwesome name="plus" size={22} color={Colors.textOnPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: 'bold' },
  headerCount: { color: Colors.textSecondary, fontSize: 14 },
  categoryRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexWrap: 'wrap',
  },
  categoryTab: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  categoryTabText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 14 },
  filterRow: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
    backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border,
  },
  filterPillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterPillText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  filterPillTextActive: { color: Colors.textOnPrimary },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  animalRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  animalIcon: {
    width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.08)', borderWidth: 2, marginRight: 12,
  },
  animalInfo: { flex: 1 },
  animalName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  animalSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { color: Colors.textSecondary, fontSize: 10 },
  tempBlock: { marginRight: 8 },
  tempValue: { fontSize: 14, fontWeight: 'bold' },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
});
