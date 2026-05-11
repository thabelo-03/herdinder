/**
 * Asset Detail Screen - Full vitals, history, device info
 * Supports cattle (temperature focus) and vehicles (speed/GPS focus)
 * TODO: HARDWARE INTEGRATION - Show real DevEUI, AppEUI, firmware version
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Linking,
  Share,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors, { getTempColor, getTempStatus, getCategoryColor, getCategoryIcon, getCategoryLabel } from '../../constants/Colors';
import { useAnimalStore } from '../../store/animalStore';
import TempChart from '../../components/TempChart';

function formatLastSeen(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
}

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const animals = useAnimalStore((s) => s.animals);
  const selectAnimal = useAnimalStore((s) => s.selectAnimal);
  const animal = animals.find((a) => a.id === id);

  if (!animal) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.errorState}>
          <FontAwesome name="exclamation-circle" size={48} color={Colors.textMuted} />
          <Text style={styles.errorText}>Asset not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isCattle = animal.category === 'cattle';
  const tempStatus = getTempStatus(animal.temperature);
  const tempColor = getTempColor(animal.temperature);
  const categoryColor = getCategoryColor(animal.category);
  const categoryIcon = getCategoryIcon(animal.category) as any;

  return (
    <SafeAreaView style={styles.screen}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <FontAwesome name="arrow-left" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{animal.name}</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <FontAwesome name="pencil" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <View style={[styles.heroIcon, { borderColor: isCattle ? tempColor : categoryColor }]}>
                <FontAwesome name={categoryIcon} size={28} color={isCattle ? tempColor : categoryColor} />
              </View>
              <View>
                <Text style={styles.heroName}>{animal.name}</Text>
                <Text style={styles.heroSub}>{animal.location} · {animal.herdName}</Text>
                {!isCattle && animal.plateNumber && (
                   <Text style={styles.heroSub}>{animal.plateNumber}</Text>
                )}
              </View>
            </View>
            <View style={styles.heroRight}>
              {isCattle ? (
                <>
                  <Text style={[styles.heroTemp, { color: tempColor }]}>
                    {animal.temperature}°C
                  </Text>
                  <View style={[styles.heroBadge, { backgroundColor: tempStatus.color }]}>
                    <Text style={styles.heroBadgeText}>{tempStatus.label}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.heroTemp, { color: categoryColor, fontSize: 24 }]}>
                    {animal.speed != null && animal.speed > 0 ? `${animal.speed} km/h` : animal.status}
                  </Text>
                  <View style={[styles.heroBadge, { backgroundColor: animal.status === 'Moving' ? Colors.success : categoryColor }]}>
                    <Text style={styles.heroBadgeText}>{getCategoryLabel(animal.category).toUpperCase()}</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Vitals Grid */}
        <View style={styles.vitalsGrid}>
          <VitalCard icon="arrows" label="Status" value={animal.status} color={
            animal.status === 'Moving' ? Colors.success : Colors.textSecondary
          } />
          <VitalCard icon="clock-o" label="Last Seen" value={formatLastSeen(animal.lastSeen)} color={Colors.info} />
          <VitalCard icon="battery-three-quarters" label="Battery" value={`${animal.battery}%`} color={
            animal.battery > 50 ? Colors.success : animal.battery > 20 ? Colors.warning : Colors.danger
          } />
          <VitalCard icon="home" label="Distance" value={`${animal.distanceFromHome} km`} color={Colors.primary} />
        </View>

        {/* Temperature History */}
        {isCattle && (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Temperature History</Text>
              <View style={styles.chartPills}>
                <View style={[styles.chartPill, styles.chartPillActive]}>
                  <Text style={styles.chartPillTextActive}>24h</Text>
                </View>
                <View style={styles.chartPill}>
                  <Text style={styles.chartPillText}>7d</Text>
                </View>
                <View style={styles.chartPill}>
                  <Text style={styles.chartPillText}>30d</Text>
                </View>
              </View>
            </View>
            <TempChart data={animal.temperatureHistory} height={160} />
          </View>
        )}

        {/* Device Information */}
        <View style={styles.tagCard}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          {/* TODO: HARDWARE INTEGRATION - Show real LoRaWAN credentials */}
          <InfoRow label="Device ID" value={animal.tagId} />
          <InfoRow label="DevEUI" value="00:1A:2B:3C:4D:5E:6F:70" />
          <InfoRow label="Type" value={isCattle ? "LoRaWAN Ear Tag (EU868)" : "Dragino TrackerD (EU868)"} />
          <InfoRow label="Firmware" value="v1.2.3" />
          <InfoRow label="Last Uplink" value={formatLastSeen(animal.lastSeen)} />
          <InfoRow label="RSSI" value="-87 dBm" />
          <InfoRow label="SNR" value="8.5 dB" />
          {!isCattle && animal.buzzerEnabled !== undefined && (
            <InfoRow label="Buzzer Alarm" value={animal.buzzerEnabled ? "Armed" : "Disabled"} />
          )}
          {!isCattle && animal.tamperDetected !== undefined && (
             <InfoRow label="Tamper Status" value={animal.tamperDetected ? "DETECTED" : "Normal"} />
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <ActionButton
            icon="map-marker"
            label="Show on Map"
            color={Colors.primary}
            onPress={() => {
              if (animal) {
                selectAnimal(animal);
                router.push('/(tabs)');
              }
            }}
          />
          {!isCattle && <ActionButton icon="volume-up" label="Sound Alarm" color={Colors.motorbike} onPress={() => { }} />}
          <ActionButton icon="bell" label="Alert Settings" color={Colors.warning} onPress={() => { }} />
          <ActionButton
            icon="share-alt"
            label="Share"
            color={Colors.info}
            onPress={() => {
              if (animal) {
                const message = `Check out ${animal.name}'s location: https://www.google.com/maps/search/?api=1&query=${animal.latitude},${animal.longitude}`;
                Share.share({
                  message,
                  title: `${animal.name}'s Location`,
                });
              }
            }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function VitalCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.vitalCard}>
      <FontAwesome name={icon as any} size={18} color={color} />
      <Text style={[styles.vitalValue, { color }]}>{value}</Text>
      <Text style={styles.vitalLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
        <FontAwesome name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: { padding: 6 },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  content: { paddingHorizontal: 20 },
  // Hero
  heroCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  heroName: { color: Colors.textPrimary, fontSize: 20, fontWeight: 'bold' },
  heroSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  heroRight: { alignItems: 'flex-end' },
  heroTemp: { fontSize: 32, fontWeight: 'bold' },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  heroBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5 },
  // Vitals
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  vitalCard: {
    width: (Dimensions.get('window').width - 50) / 2 - 5,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vitalValue: { fontSize: 18, fontWeight: 'bold' },
  vitalLabel: { color: Colors.textSecondary, fontSize: 11 },
  // Chart
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' },
  chartPills: { flexDirection: 'row', gap: 6 },
  chartPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  chartPillActive: {
    backgroundColor: Colors.primary,
  },
  chartPillText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  chartPillTextActive: { color: Colors.textOnPrimary, fontSize: 11, fontWeight: '600' },
  // Tag info
  tagCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  infoLabel: { color: Colors.textSecondary, fontSize: 13 },
  infoValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '500' },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: { color: Colors.textSecondary, fontSize: 11 },
  // Error
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  errorText: { color: Colors.textMuted, fontSize: 16 },
  backBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: Colors.textOnPrimary, fontWeight: 'bold' },
});
