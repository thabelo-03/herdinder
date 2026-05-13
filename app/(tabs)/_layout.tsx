import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, SafeAreaView } from 'react-native';
import GlobalSearch from '../../components/GlobalSearch';
import Colors from '../../constants/Colors';
import { useAlertStore } from '../../store/alertStore';
import { useAnimalStore } from '../../store/animalStore';
import { AlertType } from '../../types';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

function AlertBadge({ types }: { types?: AlertType[] }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const alerts = useAlertStore((s) => s.alerts);

  const filteredAlerts = alerts.filter(a =>
    !a.read && (!types || types.includes(a.type))
  );

  const count = filteredAlerts.length;

  if (count === 0) return null;

  // Determine the badge color based on the highest severity present
  const hasCritical = filteredAlerts.some(a => a.severity === 'critical');
  const hasWarning = filteredAlerts.some(a => a.severity === 'warning');

  const badgeColor = hasCritical ? Colors.danger : hasWarning ? Colors.warning : Colors.info;

  useEffect(() => {
    if (hasCritical) {
      // Loop a scaling animation back and forth
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [hasCritical, pulseAnim]);

  return (
    <Animated.View style={[styles.badge, { backgroundColor: badgeColor, transform: [{ scale: pulseAnim }] }]}>
      <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </Animated.View>
  );
}


export default function TabLayout() {
  const connectMQTT = useAnimalStore((s) => s.connectMQTT);
  const disconnectMQTT = useAnimalStore((s) => s.disconnectMQTT);

  useEffect(() => {
    // Start MQTT connection for real-time hardware updates
    connectMQTT();
    return () => disconnectMQTT();
  }, [connectMQTT, disconnectMQTT]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
      <GlobalSearch />
      <Tabs
        screenOptions={{
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: Colors.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View>
              <TabBarIcon name="map-marker" color={color} />
              <AlertBadge types={['LEFT_SAFE_ZONE', 'MOVEMENT_ALERT', 'TAG_TAMPER', 'THEFT_ALERT']} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="animals"
        options={{
          title: 'Animals',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View>
              <TabBarIcon name="paw" color={color} />
              <AlertBadge types={['HIGH_TEMPERATURE', 'LOW_BATTERY', 'OFFLINE', 'SPEEDING', 'BUZZER_TRIGGERED']} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <View>
              <TabBarIcon name="bell" color={color} />
              <AlertBadge />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart" color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="ellipsis-h" color={color} />,
        }}
      />
    </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
