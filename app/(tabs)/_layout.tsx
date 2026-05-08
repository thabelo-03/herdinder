import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';
import { useAlertStore } from '../../store/alertStore';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={22} style={{ marginBottom: -2 }} {...props} />;
}

function AlertBadge() {
  const unreadCount = useAlertStore((s) => s.unreadCount);
  if (unreadCount === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
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
          tabBarIcon: ({ color }) => <TabBarIcon name="map-marker" color={color} />,
        }}
      />
      <Tabs.Screen
        name="animals"
        options={{
          title: 'Animals',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="paw" color={color} />,
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
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -8,
    top: -4,
    backgroundColor: Colors.badgeRed,
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
