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
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
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
        <TouchableOpacity 
          style={styles.headerBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Edit Asset', 'Name and Herd editing coming soon!');
          }}
        >
          <FontAwesome name="pencil" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <View style={[styles.heroIcon, { borderColor: isCattle ? tempColor : categoryColor, backgroundColor: `${isCattle ? tempColor : categoryColor}10` }]}>
                <FontAwesome name={categoryIcon} size={32} color={isCattle ? tempColor : categoryColor} />
              </View>
              <View>
                <Text style={styles.heroName}>{animal.name}</Text>
                <View style={styles.heroSubRow}>
                  <FontAwesome name="map-marker" size={12} color={Colors.textMuted} />
                  <Text style={styles.heroSub}> {animal.location} · {animal.herdName}</Text>
                </View>
                {!isCattle && animal.plateNumber && (
                   <View style={[styles.heroSubRow, { marginTop: 4 }]}>
                     <FontAwesome name="id-card-o" size={10} color={Colors.textMuted} />
                     <Text style={styles.heroSub}> {animal.plateNumber}</Text>
                   </View>
                )}
              </View>
            </View>
            <View style={styles.heroRight}>
              {isCattle ? (
                <>
                  <Text style={[styles.heroTemp, { color: tempColor }]}>
                    {animal.temperature.toFixed(1)}°C
                  </Text>
                  <View style={[styles.heroBadge, { backgroundColor: tempStatus.color }]}>
                    <Text style={styles.heroBadgeText}>{tempStatus.label.toUpperCase()}</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.heroTemp, { color: categoryColor, fontSize: 26 }]}>
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
          <View style={styles.sectionHeader}>
            <FontAwesome name="microchip" size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Device Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoRow label="Device ID" value={animal.tagId} icon="tag" />
            <InfoRow label="DevEUI" value={animal.devEUI || "Not Set"} icon="fingerprint" />
            {animal.appKey && <InfoRow label="AppKey" value={animal.appKey.substring(0, 8) + "..."} icon="key" />}
            <InfoRow label="Type" value={isCattle ? "LoRa Ear Tag" : "GPS Tracker"} icon="info-circle" />
            <InfoRow label="Firmware" value="v2.1.0" icon="code-fork" />
            <InfoRow label="RSSI" value="-87 dBm" icon="signal" />
            <InfoRow label="SNR" value="8.5 dB" icon="bar-chart" />
            {!isCattle && animal.buzzerEnabled !== undefined && (
              <InfoRow label="Buzzer" value={animal.buzzerEnabled ? "Armed" : "Off"} icon="volume-up" />
            )}
            {!isCattle && animal.tamperDetected !== undefined && (
               <InfoRow label="Tamper" value={animal.tamperDetected ? "⚠ ALERT" : "OK"} icon="warning" 
                 valueColor={animal.tamperDetected ? Colors.danger : Colors.success} />
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <ActionButton
            icon="map-marker"
            label="Show on Map"
            color={Colors.primary}
            onPress={() => {
              if (animal) {
                Haptics.selectionAsync();
                selectAnimal(animal);
                router.push('/(tabs)');
              }
            }}
          />
          {!isCattle && (
            <ActionButton 
              icon="volume-up" 
              label={animal.buzzerEnabled ? "Stop Alarm" : "Sound Alarm"} 
              color={Colors.motorbike} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                useAnimalStore.getState().triggerBuzzer(animal.id);
              }} 
            />
          )}
          <ActionButton 
            icon="bell" 
            label="Settings" 
            color={Colors.warning} 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Settings', 'Notification thresholds coming soon!');
            }} 
          />
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

function InfoRow({ label, value, icon, valueColor }: { label: string; value: string; icon?: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLabelGroup}>
        {icon && <FontAwesome name={icon as any} size={12} color={Colors.textMuted} style={{ width: 16 }} />}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function ActionButton({ icon, label, color, onPress }: { icon: string; label: string; color: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.6}>
      <View style={[styles.actionIcon, { backgroundColor: `${color}15`, borderColor: `${color}30` }]}>
        <FontAwesome name={icon as any} size={20} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
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
  heroSub: { color: Colors.textSecondary, fontSize: 13 },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  heroRight: { alignItems: 'flex-end' },
  heroTemp: { fontSize: 36, fontWeight: 'bold' },
  heroBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  heroBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  // Vitals
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 20,
  },
  vitalCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  vitalValue: { fontSize: 20, fontWeight: 'bold' },
  vitalLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  // Chart
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' },
  chartPills: { flexDirection: 'row', gap: 8 },
  chartPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chartPillText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  chartPillTextActive: { color: Colors.textOnPrimary, fontSize: 11, fontWeight: '700' },
  // Tag info
  tagCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  infoGrid: { gap: 2 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  infoLabelGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '500' },
  infoValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 10,
  },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  actionLabel: { fontSize: 11, fontWeight: '700' },
  // Error
  errorState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  errorText: { color: Colors.textMuted, fontSize: 16 },
  backBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: Colors.textOnPrimary, fontWeight: 'bold' },
});
