import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Switch, ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = __DEV__ ? 'http://10.0.2.2:5000/api' : 'https://your-api.com/api';

const DriverDashboard = ({ navigation, route }) => {
  const [driver, setDriver] = useState(route.params?.driver || {});
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isAvailable, setIsAvailable] = useState(driver.isAvailable ?? true);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPendingOrders(); }, []);

  const fetchPendingOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('driver_token');
      const { data } = await axios.get(`${API_URL}/drivers/pending-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingOrders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async () => {
    const newVal = !isAvailable;
    setIsAvailable(newVal);
    try {
      const token = await AsyncStorage.getItem('driver_token');
      await axios.put(`${API_URL}/drivers/${driver._id}/availability`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      setIsAvailable(!newVal); // revert
    }
  };

  const acceptOrder = (order) => {
    navigation.navigate('ActiveDelivery', { order, driver });
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNum}>#{item.orderNumber}</Text>
        <Text style={styles.orderTotal}>${item.pricing?.total?.toFixed(2)}</Text>
      </View>
      <Text style={styles.address}>
        📍 {item.deliveryAddress?.street}, {item.deliveryAddress?.city}
      </Text>
      <Text style={styles.itemCount}>{item.items?.length} items • {item.paymentMethod}</Text>
      <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptOrder(item)}>
        <Text style={styles.acceptBtnText}>✅ Accept Delivery</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {driver.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>Ready to deliver?</Text>
        </View>
        <View style={styles.availRow}>
          <Text style={styles.availLabel}>{isAvailable ? '🟢 Online' : '🔴 Offline'}</Text>
          <Switch
            value={isAvailable}
            onValueChange={toggleAvailability}
            trackColor={{ false: '#e74c3c', true: '#2ecc71' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total Deliveries', value: driver.stats?.totalDeliveries || 0 },
          { label: 'Rating', value: `${driver.stats?.rating || 5.0}★` },
          { label: 'Earnings', value: `$${driver.stats?.totalEarnings?.toFixed(0) || 0}` },
        ].map(({ label, value }) => (
          <View key={label} style={styles.stat}>
            <Text style={styles.statVal}>{value}</Text>
            <Text style={styles.statLbl}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>📦 Available Orders ({pendingOrders.length})</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={pendingOrders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchPendingOrders}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>😴</Text>
              <Text style={styles.emptyText}>No orders available right now</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f23' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: '#1a1a2e',
  },
  greeting: { fontSize: 22, fontWeight: '800', color: '#fff' },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  availRow: { alignItems: 'center', gap: 4 },
  availLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 0,
  },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '800', color: '#2ecc71' },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2, textAlign: 'center' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  list: { paddingHorizontal: 16, gap: 12, paddingBottom: 24 },
  orderCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontSize: 16, fontWeight: '800', color: '#fff' },
  orderTotal: { fontSize: 18, fontWeight: '800', color: '#2ecc71' },
  address: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 20 },
  itemCount: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  acceptBtn: {
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  acceptBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
});

export default DriverDashboard;
