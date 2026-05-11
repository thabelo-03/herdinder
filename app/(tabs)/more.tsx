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
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { useAuthStore } from '../../store/authStore';
import { useAnimalStore } from '../../store/animalStore';

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
      <View style={[styles.menuIcon, { backgroundColor: `${color}15` }]}>
        <FontAwesome name={icon as any} size={16} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle && <Text style={styles.menuSub}>{subtitle}</Text>}
      </View>
      {badge && (
        <View style={styles.menuBadge}>
          <Text style={styles.menuBadgeText}>{badge}</Text>
        </View>
      )}
      <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const gateway = useAnimalStore((s) => s.gateway);
  const animals = useAnimalStore((s) => s.animals);

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/263777926123');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <FontAwesome name="user" size={28} color={Colors.primary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Farmer'}</Text>
            <Text style={styles.profilePhone}>{user?.phone}</Text>
          </View>
          <View style={[styles.planBadge, { backgroundColor: Colors.success + '20' }]}>
            <Text style={[styles.planBadgeText, { color: Colors.success }]}>
              {user?.subscription?.status === 'active' ? 'Active' : 'Trial'}
            </Text>
          </View>
        </View>

        {/* Subscription Summary */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>Connected Devices</Text>
            <Text style={styles.subValue}>{animals.length} Active</Text>
          </View>
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>Monthly Connectivity</Text>
            <Text style={[styles.subValue, { color: Colors.primary }]}>
              R{(animals.length * 100).toFixed(2)}/mo
            </Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/more/subscription')}>
            <Text style={styles.upgradeBtnText}>Buy More Devices</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <Text style={styles.sectionTitle}>ASSETS & TRACKING</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="map" label="Safe Zone Editor" subtitle="Draw boundaries for alerts" color={Colors.primary} onPress={() => router.push('/more/safe-zone')} />
          <MenuItem icon="plus-circle" label="Register Device" subtitle="Add ear tag or GPS tracker" color={Colors.success} onPress={() => router.push('/more/register-device')} />
          <MenuItem icon="history" label="Movement History" subtitle="Track asset trails" color={Colors.info} onPress={() => router.push('/more/movement-history')} />
        </View>

        <Text style={styles.sectionTitle}>GATEWAY & NETWORK</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="signal"
            label="Gateway Status"
            subtitle={`${gateway.name} — ${gateway.status}`}
            color={gateway.status === 'online' ? Colors.success : Colors.danger}
            badge={gateway.status === 'online' ? '●' : '○'}
            onPress={() => router.push('/more/gateway-status')}
          />
          {/* TODO: HARDWARE INTEGRATION - MikroTik gateway configuration */}
          <MenuItem icon="cogs" label="Gateway Config" subtitle="MikroTik wAP LR8 settings" color={Colors.textSecondary} onPress={() => router.push('/more/gateway-config')} />
          {/* TODO: HARDWARE INTEGRATION - TTN console link */}
          <MenuItem icon="cloud" label="TTN Console" subtitle="The Things Network dashboard" color={Colors.info} onPress={() => Linking.openURL('https://console.thethingsnetwork.org/')} />
        </View>

        <Text style={styles.sectionTitle}>APP SETTINGS</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="bell" label="Notifications" subtitle="Push, SMS, alert rules" color={Colors.warning} onPress={() => router.push('/more/notifications')} />
          <MenuItem icon="language" label="Language" subtitle="English · Ndebele" color={Colors.textPrimary} onPress={() => router.push('/more/language')} />
          <MenuItem icon="refresh" label="Offline Data" subtitle="Sync & cache settings" color={Colors.info} onPress={() => router.push('/more/offline-data')} />
          <MenuItem icon="shield" label="Privacy & Security" color={Colors.textSecondary} onPress={() => router.push('/more/privacy')} />
          <MenuItem icon="server" label="Admin Dashboard" subtitle="Manage system infrastructure" color={Colors.danger} onPress={() => router.push('/admin')} />
        </View>

        <Text style={styles.sectionTitle}>SUPPORT</Text>
        <View style={styles.menuGroup}>
          <MenuItem icon="whatsapp" label="WhatsApp Support" subtitle="077 792 6123" color="#25D366" onPress={handleWhatsApp} />
          <MenuItem icon="question-circle" label="Help & FAQ" color={Colors.textSecondary} onPress={() => router.push('/more/help')} />
          <MenuItem icon="info-circle" label="About HerdFinder" subtitle="v1.0.0" color={Colors.primary} onPress={() => router.push('/more/about')} />
          <MenuItem icon="sign-out" label="Log Out (Test UI)" color={Colors.danger} onPress={() => router.replace('/auth/login')} />
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <FontAwesome name="gift" size={20} color={Colors.textOnPrimary} />
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Bulk Hardware Discount</Text>
            <Text style={styles.promoSub}>Buy 4 or more trackers for only R800 each!</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: 'bold' },
  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  profileInfo: { flex: 1 },
  profileName: { color: Colors.textPrimary, fontSize: 17, fontWeight: 'bold' },
  profilePhone: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  planBadgeText: { fontSize: 11, fontWeight: 'bold' },
  // Subscription
  subscriptionCard: {
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  subLabel: { color: Colors.textSecondary, fontSize: 13 },
  subValue: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  upgradeBtnText: { color: Colors.textOnPrimary, fontSize: 14, fontWeight: 'bold' },
  // Sections
  sectionTitle: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  menuGroup: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
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
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  menuSub: { color: Colors.textSecondary, fontSize: 11, marginTop: 1 },
  menuBadge: {
    marginRight: 8,
  },
  menuBadgeText: { color: Colors.success, fontSize: 16 },
  // Promo
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  promoContent: { flex: 1 },
  promoTitle: { color: Colors.textOnPrimary, fontSize: 14, fontWeight: 'bold' },
  promoSub: { color: Colors.textOnPrimary, fontSize: 11, opacity: 0.8, marginTop: 2 },
});
