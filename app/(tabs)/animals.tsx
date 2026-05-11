/**
 * Assets Screen - List of all registered cattle, motorbikes, and vehicles
 * Filter by category (All / Cattle / Motorbikes / Vehicles)
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BreathingDot from '../../components/BreathingDot';
import Colors, { getCategoryColor, getCategoryIcon, getTempColor } from '../../constants/Colors';
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
  const onlineCount = animals.filter((a) => a.status !== 'Offline').length;
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
        {/* Icon & Category Indicator */}
        <View style={[styles.animalIcon, { backgroundColor: `${categoryColor}15`, borderColor: `${categoryColor}40` }]}>
          <FontAwesome name={categoryIcon} size={18} color={categoryColor} />
        </View>
        <View style={[styles.categoryLine, { backgroundColor: categoryColor }]} />

        {/* Info */}
        <View style={styles.animalInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.animalName} numberOfLines={1}>{item.name}</Text>
            {item.battery < 20 && (
              <FontAwesome name="battery-1" size={10} color={Colors.danger} style={{ marginLeft: 6 }} />
            )}
          </View>
          <Text style={styles.animalSub} numberOfLines={1}>
            {item.herdName} · {formatLastSeen(item.lastSeen)}
          </Text>
        </View>

        {/* Metrics (Battery/Signal) */}
        <View style={styles.metricsColumn}>
          <View style={styles.metricItem}>
            <FontAwesome name="signal" size={8} color={Colors.textMuted} />
            <Text style={styles.metricText}>Excellent</Text>
          </View>
          <View style={styles.metricItem}>
            <FontAwesome name="bolt" size={8} color={item.battery < 20 ? Colors.danger : Colors.success} />
            <Text style={[styles.metricText, item.battery < 20 && { color: Colors.danger }]}>{item.battery}%</Text>
          </View>
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

        <FontAwesome name="chevron-right" size={10} color={Colors.textMuted} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Assets</Text>
          <Text style={styles.headerCount}>{onlineCount} online · {animals.length} total</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <FontAwesome name="sliders" size={18} color={Colors.primary} />
        </TouchableOpacity>
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
    borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  animalIcon: {
    width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5,
  },
  categoryLine: {
    width: 3, height: 24, borderRadius: 1.5, marginLeft: 12, marginRight: 0,
  },
  animalInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  animalName: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  animalSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 1 },
  metricsColumn: { alignItems: 'flex-end', marginRight: 16, gap: 4 },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metricText: { color: Colors.textSecondary, fontSize: 9, fontWeight: '600' },
  tempBlock: { marginRight: 10, alignItems: 'flex-end' },
  tempValue: { fontSize: 15, fontWeight: 'bold' },
  headerAction: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.card,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
    elevation: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 8,
  },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
});
