import React, { useContext, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { COLORS } from '../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: '📍', label: 'My Addresses', onPress: () => {} },
    { icon: '📦', label: 'Order History', onPress: () => navigation.navigate('Orders') },
    { icon: '🔔', label: 'Notifications', onPress: () => {} },
    { icon: '🔒', label: 'Privacy & Security', onPress: () => {} },
    { icon: '❓', label: 'Help & Support', onPress: () => {} },
    { icon: '⭐', label: 'Rate the App', onPress: () => {} },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Orders', value: '0' },
          { label: 'Saved', value: '$0' },
          { label: 'Points', value: '0' },
        ].map(({ label, value }) => (
          <View key={label} style={styles.statItem}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuItems.map(({ icon, label, onPress }) => (
          <TouchableOpacity key={label} style={styles.menuItem} onPress={onPress}>
            <Text style={styles.menuIcon}>{icon}</Text>
            <Text style={styles.menuLabel}>{label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪  Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>FreshCart v1.0.0</Text>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    gap: 6,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
  name: { fontSize: 22, fontWeight: '800', color: '#fff' },
  email: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  phone: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  menu: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 14,
  },
  menuIcon: { fontSize: 22 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: COLORS.text },
  menuArrow: { fontSize: 20, color: COLORS.textSecondary },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#fdeaea',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  logoutText: { color: COLORS.error, fontSize: 16, fontWeight: '700' },
  version: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

export default ProfileScreen;
