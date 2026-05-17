import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  TextInput, 
  FlatList, 
  ActivityIndicator, 
  Modal, 
  Alert, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import api, { adminAPI } from '../../services/api';

export default function UserManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal & Edit States
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<'starter' | 'standard' | 'community' | 'enterprise'>('starter');
  const [editTagCount, setEditTagCount] = useState<number>(10);
  const [editStatus, setEditStatus] = useState<'active' | 'trial' | 'expired' | 'cancelled'>('active');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setEditPlan(user.subscription?.plan || 'starter');
    setEditTagCount(user.subscription?.tagCount || 10);
    setEditStatus(user.subscription?.status || 'active');
    setIsModalOpen(true);
  };

  const handleUpdateSubscription = async () => {
    if (!selectedUser) return;
    try {
      setIsUpdating(true);
      const res = await api.put(`/admin/users/${selectedUser._id || selectedUser.id}/subscription`, {
        plan: editPlan,
        tagCount: editTagCount,
        status: editStatus,
      });

      if (res.data) {
        Alert.alert('Success', `Successfully activated/updated ${selectedUser.name}'s subscription!`);
        // Update local state instantly
        setUsers(prev => 
          prev.map(u => (u._id || u.id) === (selectedUser._id || selectedUser.id) ? res.data : u)
        );
        setIsModalOpen(false);
        setSelectedUser(null);
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to update user subscription status.');
    } finally {
      setIsUpdating(false);
    }
  };

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
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchUsers}>
          <FontAwesome name="refresh" size={18} color={Colors.primary} />
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
            <TouchableOpacity style={styles.userCard} onPress={() => openEditModal(item)} activeOpacity={0.8}>
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
                  <Text style={styles.subValue}>{(item.subscription?.plan || 'TRIAL').toUpperCase()}</Text>
                </View>
                <View style={styles.subDetail}>
                  <Text style={styles.subLabel}>Tags</Text>
                  <Text style={[styles.subValue, item.subscription?.status === 'expired' && { color: Colors.danger }]}>
                    {item.subscription?.status === 'expired' ? 'N/A' : (item.subscription?.tagCount || 0)}
                  </Text>
                </View>
                <View style={styles.subDetail}>
                  <Text style={styles.subLabel}>Expires</Text>
                  <Text style={styles.subValue}>
                    {item.subscription?.endDate ? new Date(item.subscription.endDate).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.editActionRow}>
                <Text style={styles.editActionText}>Tap card to Activate / Modify Subscription</Text>
                <FontAwesome name="pencil-square-o" size={14} color={Colors.primary} />
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

      {/* Subscription Editor Sheet Modal */}
      {selectedUser && (
        <Modal
          visible={isModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Subscriber Console</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeBtn}>
                  <FontAwesome name="times" size={20} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {/* User Details */}
                <View style={styles.modalUserCard}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {selectedUser.name ? selectedUser.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalUserName}>{selectedUser.name}</Text>
                    <Text style={styles.modalUserContact}>{selectedUser.phone} • {selectedUser.email}</Text>
                  </View>
                </View>

                {/* Sub Plan Selection */}
                <Text style={styles.inputGroupLabel}>SELECT SYSTEM PLAN</Text>
                <View style={styles.planSelectorGrid}>
                  {(['starter', 'standard', 'community', 'enterprise'] as const).map((p) => {
                    const isActivePlan = editPlan === p;
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.planSelectorItem, 
                          isActivePlan && { borderColor: Colors.primary, backgroundColor: Colors.primary + '15' }
                        ]}
                        onPress={() => setEditPlan(p)}
                      >
                        <FontAwesome 
                          name={p === 'enterprise' ? 'building' : p === 'standard' ? 'star' : p === 'community' ? 'group' : 'leaf'} 
                          size={16} 
                          color={isActivePlan ? Colors.primary : Colors.textMuted} 
                        />
                        <Text style={[styles.planLabelText, isActivePlan && { color: Colors.primary, fontWeight: '700' }]}>
                          {p.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Tag Allocation Stepper */}
                <Text style={styles.inputGroupLabel}>LORA TAG ALLOCATION</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity 
                    style={styles.stepperBtn} 
                    onPress={() => setEditTagCount(prev => Math.max(1, prev - 5))}
                  >
                    <FontAwesome name="minus" size={14} color={Colors.textPrimary} />
                  </TouchableOpacity>
                  
                  <View style={styles.stepperValBox}>
                    <TextInput 
                      style={styles.stepperInput}
                      keyboardType="numeric"
                      value={editTagCount.toString()}
                      onChangeText={(val) => setEditTagCount(parseInt(val) || 0)}
                    />
                    <Text style={styles.stepperSubtext}>Hardware Units</Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.stepperBtn} 
                    onPress={() => setEditTagCount(prev => prev + 5)}
                  >
                    <FontAwesome name="plus" size={14} color={Colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Status Toggle Grid */}
                <Text style={styles.inputGroupLabel}>SUBSCRIPTION STATE</Text>
                <View style={styles.statusToggleGrid}>
                  {(['active', 'trial', 'expired', 'cancelled'] as const).map((st) => {
                    const isSelected = editStatus === st;
                    const statusColor = getStatusColor(st);
                    return (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.statusToggleItem,
                          isSelected && { borderColor: statusColor, backgroundColor: statusColor + '15' }
                        ]}
                        onPress={() => setEditStatus(st)}
                      >
                        <View style={[styles.statusDotIcon, { backgroundColor: isSelected ? statusColor : Colors.textMuted }]} />
                        <Text style={[styles.statusToggleText, isSelected && { color: statusColor, fontWeight: '700' }]}>
                          {st.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Confirm Action Button */}
                <TouchableOpacity 
                  style={[styles.primaryActionBtn, isUpdating && { opacity: 0.7 }]}
                  onPress={handleUpdateSubscription}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <FontAwesome name="flash" size={16} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.primaryActionText}>
                        {editStatus === 'active' ? 'ACTIVATE / REACTIVATE PLAN' : 'SAVE STATE MODIFICATIONS'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                <View style={{ height: 30 }} />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
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
  refreshBtn: { padding: 8 },
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
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  editActionText: { color: Colors.primary, fontSize: 11, fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: { color: Colors.textMuted, marginTop: 16, fontSize: 14 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  errorText: { color: Colors.danger, fontSize: 13, textAlign: 'center', marginVertical: 8 },
  
  // Modal Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  closeBtn: { padding: 4 },
  modalScroll: { gap: 16 },
  modalUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalAvatarText: { color: Colors.primary, fontSize: 18, fontWeight: 'bold' },
  modalUserName: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  modalUserContact: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  
  inputGroupLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  planSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  planSelectorItem: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planLabelText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepperValBox: { alignItems: 'center' },
  stepperInput: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold', textAlign: 'center', minWidth: 60 },
  stepperSubtext: { color: Colors.textMuted, fontSize: 9, fontWeight: 'bold', marginTop: 2 },
  
  statusToggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusToggleItem: {
    width: '48%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusDotIcon: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusToggleText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  
  primaryActionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryActionText: { color: 'white', fontSize: 14, fontWeight: 'bold', letterSpacing: 0.5 },
});
