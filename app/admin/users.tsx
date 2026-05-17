import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, FlatList, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { adminAPI } from '../../services/api';

export default function UserManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await adminAPI.getUsers();
      if (res.data) {
        setUsers(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch live user accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome name="arrow-left" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <TouchableOpacity style={styles.addBtn}>
          <FontAwesome name="user-plus" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, phone or email..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching live users...</Text>
        </View>
      ) : error ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.userCard}>
              <View style={styles.userHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {item.name ? item.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name || 'Anonymous User'}</Text>
                  <Text style={styles.userContact}>{item.phone || 'No phone'} • {item.email}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.subscription?.status || 'trial') + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.subscription?.status || 'trial') }]}>
                    {(item.subscription?.status || 'trial').toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.subscriptionInfo}>
                <View style={styles.subDetail}>
                  <Text style={styles.subLabel}>Plan</Text>
                  <Text style={styles.subValue}>{(item.subscription?.plan || 'trial').toUpperCase()}</Text>
                </View>
                <View style={styles.subDetail}>
                  <Text style={styles.subLabel}>Tags</Text>
                  <Text style={styles.subValue}>{item.subscription?.tagCount || 0}</Text>
                </View>
                <View style={styles.subDetail}>
                  <Text style={styles.subLabel}>Expires</Text>
                  <Text style={styles.subValue}>
                    {item.subscription?.endDate ? new Date(item.subscription.endDate).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome name="users" size={48} color={Colors.border} />
              <Text style={styles.emptyText}>No users found matching "{searchQuery}"</Text>
            </View>
          }
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 8 },
  addBtn: { padding: 8 },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.textPrimary, fontSize: 16 },
  listContent: { padding: 16 },
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: Colors.primary, fontSize: 16, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  userContact: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  subscriptionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  subDetail: { alignItems: 'flex-start' },
  subLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  subValue: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: { color: Colors.textMuted, marginTop: 16, fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.danger, fontSize: 13, textAlign: 'center', marginVertical: 8 },
});
