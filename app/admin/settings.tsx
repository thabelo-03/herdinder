import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

export default function AdminSettings() {
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    debugLogs: true,
    autoBackup: true,
    slackAlerts: true,
    emailReports: false,
    highLatencyAlerts: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Settings</Text>
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>SYSTEM CONFIGURATION</Text>
        <View style={styles.settingCard}>
          <SettingRow 
            icon="wrench" 
            label="Maintenance Mode" 
            description="Disable user access for system upgrades" 
            value={settings.maintenanceMode}
            onToggle={() => toggleSetting('maintenanceMode')}
          />
          <SettingRow 
            icon="bug" 
            label="Enable Debug Logging" 
            description="Detailed application and API logs" 
            value={settings.debugLogs}
            onToggle={() => toggleSetting('debugLogs')}
          />
          <SettingRow 
            icon="cloud-upload" 
            label="Daily Auto-Backups" 
            description="Backup database to AWS S3 nightly" 
            value={settings.autoBackup}
            onToggle={() => toggleSetting('autoBackup')}
          />
        </View>

        <Text style={styles.sectionTitle}>INTEGRATIONS & NOTIFICATIONS</Text>
        <View style={styles.settingCard}>
          <SettingRow 
            icon="slack" 
            label="Slack Alerts" 
            description="Post critical alerts to #herdfinder-ops" 
            value={settings.slackAlerts}
            onToggle={() => toggleSetting('slackAlerts')}
          />
          <SettingRow 
            icon="envelope-o" 
            label="Weekly Email Reports" 
            description="Summary of platform growth and health" 
            value={settings.emailReports}
            onToggle={() => toggleSetting('emailReports')}
          />
          <SettingRow 
            icon="warning" 
            label="Latency Warnings" 
            description="Notify when API latency > 500ms" 
            value={settings.highLatencyAlerts}
            onToggle={() => toggleSetting('highLatencyAlerts')}
          />
        </View>

        <Text style={styles.sectionTitle}>API & SECURITY</Text>
        <View style={styles.settingCard}>
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionIconContainer}>
              <FontAwesome name="key" size={16} color={Colors.primary} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionLabel}>Manage API Keys</Text>
              <Text style={styles.actionDescription}>View and rotate production keys</Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionRow}>
            <View style={styles.actionIconContainer}>
              <FontAwesome name="shield" size={16} color={Colors.primary} />
            </View>
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionLabel}>Security Audit Logs</Text>
              <Text style={styles.actionDescription}>View all administrative actions</Text>
            </View>
            <FontAwesome name="chevron-right" size={12} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dangerZoneBtn}>
          <FontAwesome name="exclamation-circle" size={14} color={Colors.danger} />
          <Text style={styles.dangerZoneText}>DANGER ZONE</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ icon, label, description, value, onToggle }: { icon: string, label: string, description: string, value: boolean, onToggle: () => void }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingIconContainer}>
        <FontAwesome name={icon as any} size={16} color={Colors.textSecondary} />
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: Colors.border, true: Colors.primary + '80' }}
        thumbColor={value ? Colors.primary : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 8 },
  saveBtn: { padding: 8 },
  saveText: { color: Colors.primary, fontWeight: 'bold', fontSize: 16 },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  content: { padding: 16 },
  sectionTitle: { color: Colors.textMuted, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 12, marginTop: 12 },
  settingCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  settingIconContainer: { width: 32 },
  settingTextContainer: { flex: 1, marginRight: 12 },
  settingLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  settingDescription: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  actionIconContainer: { width: 32 },
  actionTextContainer: { flex: 1 },
  actionLabel: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  actionDescription: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  dangerZoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger + '30',
    marginTop: 12,
  },
  dangerZoneText: { color: Colors.danger, fontSize: 12, fontWeight: 'bold' },
});
