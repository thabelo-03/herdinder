/**
 * More Screen - Settings, Subscription, Gateway, Help
 * TODO: HARDWARE INTEGRATION - Gateway config, TTN settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Dimensions,
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useAnimalStore } from '../../store/animalStore';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface MenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  color?: string;
  onPress: () => void;
  badge?: string;
}

function MenuItem({ icon, label, subtitle, color = Colors.textPrimary, onPress, badge }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: `${color}12` }]}>
        <FontAwesome name={icon as any} size={16} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      {badge && (
        <View style={[styles.menuBadge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.menuBadgeText, { color: color }]}>{badge}</Text>
        </View>
      )}
      <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const user = useAuthStore((s) => s.user);
  const gateway = useAnimalStore((s) => s.gateway);
  const animals = useAnimalStore((s) => s.animals);

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/263777926123');
  };

  const showAccount = !filter || filter === 'account';
  const showSettings = !filter || filter === 'settings';

  // Calculate pricing based on dynamic seed settings
  const pricePerTag = user?.subscription?.pricePerTag || 15.00;
  const tagQuota = user?.subscription?.tagCount || 10;
  const totalMonthlyCost = animals.length * pricePerTag;
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'F';
  const planName = user?.subscription?.plan || 'trial';
  const subStatus = user?.subscription?.status || 'trial';

  // Progress calculations for tag utilization
  const progressRatio = Math.min(1, animals.length / Math.max(1, tagQuota));

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {filter === 'account' ? 'Account Details' : filter === 'settings' ? 'Settings Console' : 'Control Center'}
          </Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>ONLINE</Text>
          </View>
        </View>

        {showAccount && (
          <>
            {/* Elegant Glassmorphism Profile Suite */}
            <View style={styles.profileCard}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{initials.toUpperCase()}</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user?.name || 'Farmer'}</Text>
                <Text style={styles.profilePhone}>
                  <FontAwesome name="phone" size={11} color={Colors.textSecondary} /> {user?.phone || 'No phone number'}
                </Text>
                <Text style={styles.profileEmail}>
                  <FontAwesome name="envelope-o" size={11} color={Colors.textMuted} /> {user?.email}
                </Text>
              </View>
              <View style={[styles.planBadge, { backgroundColor: getStatusColor(subStatus) + '15', borderColor: getStatusColor(subStatus) + '30' }]}>
                <Text style={[styles.planBadgeText, { color: getStatusColor(subStatus) }]}>
                  {planName.toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Smart Hardware & Subscription Analytics Card */}
            <View style={styles.subscriptionCard}>
              <View style={styles.subHeader}>
                <FontAwesome name="credit-card" size={16} color={Colors.primary} />
                <Text style={styles.subHeaderTitle}>HARDWARE & CONNECTIVITY PLAN</Text>
              </View>

              <View style={styles.subRow}>
                <View style={styles.subMeta}>
                  <Text style={styles.subMetaVal}>{animals.length} / {tagQuota}</Text>
                  <Text style={styles.subMetaLabel}>Active Tags Used</Text>
                </View>
                <View style={[styles.subDivider, { height: '100%' }]} />
                <View style={styles.subMeta}>
                  <Text style={styles.subMetaVal}>R{pricePerTag.toFixed(2)}</Text>
                  <Text style={styles.subMetaLabel}>Rate per Tag</Text>
                </View>
                <View style={[styles.subDivider, { height: '100%' }]} />
                <View style={styles.subMeta}>
                  <Text style={[styles.subMetaVal, { color: Colors.success }]}>R{totalMonthlyCost.toFixed(2)}</Text>
                  <Text style={styles.subMetaLabel}>Current MRR</Text>
                </View>
              </View>

              {/* Tag Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
                </View>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabelText}>Utilization Metrics</Text>
                  <Text style={styles.progressPercentText}>{Math.round(progressRatio * 100)}% Capacity</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/more/subscription')}>
                <FontAwesome name="rocket" size={14} color="white" style={{ marginRight: 6 }} />
                <Text style={styles.upgradeBtnText}>Upgrade Plan or Add Tags</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {showSettings && (
          <>
            {/* Menu Sections */}
            <Text style={styles.sectionTitle}>ASSETS & GEOLOCATION</Text>
            <View style={styles.menuGroup}>
              <MenuItem icon="map" label="Safe Zone Boundary Editor" subtitle="Draw virtual boundaries for safety alerts" color={Colors.primary} onPress={() => router.push('/more/safe-zone')} />
              <MenuItem icon="plus-circle" label="Register Tag Device" subtitle="Link LoRaWAN ear tags or Dragino trackers" color={Colors.success} onPress={() => router.push('/more/register-device')} />
              <MenuItem icon="history" label="Movement History Logging" subtitle="Track regional routes and proximity points" color={Colors.info} onPress={() => router.push('/more/movement-history')} />
            </View>

            <Text style={styles.sectionTitle}>GATEWAY & TTN NETWORK</Text>
            <View style={styles.menuGroup}>
              <MenuItem
                icon="signal"
                label="Gateway Node Status"
                subtitle={`${gateway.name} — Status: ${gateway.status.toUpperCase()}`}
                color={gateway.status === 'online' ? Colors.success : Colors.danger}
                badge={gateway.status === 'online' ? 'ACTIVE' : 'OFFLINE'}
                onPress={() => router.push('/more/gateway-status')}
              />
              <MenuItem icon="cogs" label="MikroTik Router Config" subtitle="Access wAP LR8 gateway hardware panel" color={Colors.textSecondary} onPress={() => router.push('/more/gateway-config')} />
              <MenuItem icon="cloud" label="The Things Network Console" subtitle="Open TTN stack to manage routers payload" color={Colors.info} onPress={() => Linking.openURL('https://console.thethingsnetwork.org/')} />
            </View>

            <Text style={styles.sectionTitle}>APP PLATFORM RULES</Text>
            <View style={styles.menuGroup}>
              <MenuItem icon="bell" label="Alert Notification rules" subtitle="Configure SMS, Push triggers, and severity levels" color={Colors.warning} onPress={() => router.push('/more/notifications')} />
              <MenuItem icon="language" label="Language & Translations" subtitle="Change language (English · Ndebele)" color={Colors.textPrimary} onPress={() => router.push('/more/language')} />
              <MenuItem icon="refresh" label="Offline Map Sync Cache" subtitle="Index SQLite records and download offline areas" color={Colors.info} onPress={() => router.push('/more/offline-data')} />
              <MenuItem icon="shield" label="Security & GDPR Privacy" subtitle="Manage keys and authenticated devices" color={Colors.textSecondary} onPress={() => router.push('/more/privacy')} />
              
              {/* Premium Conditioned Admin Entry Card */}
              {user?.role === 'admin' && (
                <MenuItem 
                  icon="server" 
                  label="System Admin Console" 
                  subtitle="Enterprise database stats, ZAR revenue and audits" 
                  color={Colors.danger} 
                  badge="ENTERPRISE"
                  onPress={() => router.push('/admin')} 
                />
              )}
            </View>

            <Text style={styles.sectionTitle}>SUPPORT & VERSION</Text>
            <View style={styles.menuGroup}>
              <MenuItem icon="whatsapp" label="Live WhatsApp Helpdesk" subtitle="Chat directly with tech support (077 792 6123)" color="#25D366" onPress={handleWhatsApp} />
              <MenuItem icon="question-circle" label="Platform Knowledge Base" subtitle="Faqs, user manuals, and hardware documentation" color={Colors.textSecondary} onPress={() => router.push('/more/help')} />
              <MenuItem icon="info-circle" label="About HerdFinder" subtitle="App Version 1.0.0 (Production Build)" color={Colors.primary} onPress={() => router.push('/more/about')} />
              <MenuItem icon="sign-out" label="Sign Out from Device" subtitle="Terminate session on this hardware node" color={Colors.danger} onPress={() => router.replace('/auth/login')} />
            </View>

            {/* Redesigned Premium Promotion Card */}
            <View style={styles.promoBanner}>
              <View style={styles.promoIconContainer}>
                <FontAwesome name="gift" size={22} color="white" />
              </View>
              <View style={styles.promoContent}>
                <Text style={styles.promoTitle}>Bulk Hardware Discount Pricing</Text>
                <Text style={styles.promoSub}>Purchase 4 or more GPS trackers for just R800.00 each!</Text>
              </View>
              <FontAwesome name="chevron-right" size={14} color="white" style={{ opacity: 0.8 }} />
            </View>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function getStatusColor(status?: string) {
  switch (status) {
    case 'active': return Colors.success;
    case 'trial': return Colors.info;
    case 'expired': return Colors.danger;
    case 'cancelled': return Colors.textMuted;
    default: return Colors.textMuted;
  }
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold' },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: Colors.success + '30',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  liveBadgeText: {
    color: Colors.success,
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  profileAvatarText: { color: Colors.primary, fontSize: 20, fontWeight: 'bold' },
  profileInfo: { flex: 1 },
  profileName: { color: Colors.textPrimary, fontSize: 17, fontWeight: 'bold' },
  profilePhone: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  profileEmail: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  planBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  planBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  // Subscription Card
  subscriptionCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  subHeaderTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subMeta: {
    alignItems: 'center',
    flex: 1,
  },
  subMetaVal: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  subMetaLabel: {
    color: Colors.textSecondary,
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  subDivider: {
    width: 0.5,
    backgroundColor: Colors.border,
    height: 24,
  },
  progressContainer: {
    marginBottom: 16,
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabelText: { color: Colors.textMuted, fontSize: 9, fontWeight: 'bold' },
  progressPercentText: { color: Colors.primary, fontSize: 9, fontWeight: 'bold' },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  upgradeBtnText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  // Sections
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 8,
  },
  menuGroup: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: { flex: 1 },
  menuLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  menuSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  menuBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  menuBadgeText: { fontSize: 8, fontWeight: 'bold', letterSpacing: 0.5 },
  // Promo Banner
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  promoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoContent: { flex: 1 },
  promoTitle: { color: Colors.textOnPrimary, fontSize: 14, fontWeight: 'bold' },
  promoSub: { color: Colors.textOnPrimary, fontSize: 11, opacity: 0.9, marginTop: 2 },
});
