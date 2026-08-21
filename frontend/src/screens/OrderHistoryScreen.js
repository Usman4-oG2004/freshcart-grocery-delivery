import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { COLORS, ORDER_STATUSES } from '../utils/constants';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';

const OrderHistoryScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/my');
      setOrders(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = ({ item }) => {
    const statusInfo = ORDER_STATUSES[item.status] || {};
    const isActive = !['delivered', 'cancelled'].includes(item.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          isActive
            ? navigation.navigate('OrderTracking', { orderId: item._id, order: item })
            : null
        }
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.orderNum}>#{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {statusInfo.label || item.status}
            </Text>
          </View>
        </View>

        <View style={styles.itemsRow}>
          {item.items.slice(0, 3).map((i, idx) => (
            <Text key={idx} style={styles.itemChip} numberOfLines={1}>{i.name}</Text>
          ))}
          {item.items.length > 3 && (
            <Text style={styles.moreItems}>+{item.items.length - 3} more</Text>
          )}
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.itemCount}>{item.items.length} items</Text>
          <Text style={styles.total}>{formatPrice(item.pricing.total)}</Text>
        </View>

        {isActive && (
          <View style={styles.trackBanner}>
            <Text style={styles.trackText}>📍 Track Live</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 64 }}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptySubtext}>Your order history will appear here</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  list: { padding: 16, gap: 12, paddingBottom: 24 },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderNum: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  orderDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  itemChip: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 12,
    color: COLORS.textSecondary,
    maxWidth: 120,
  },
  moreItems: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemCount: { fontSize: 13, color: COLORS.textSecondary },
  total: { fontSize: 17, fontWeight: '800', color: COLORS.primary },
  trackBanner: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderTopLeftRadius: 12,
  },
  trackText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyText: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySubtext: { fontSize: 14, color: COLORS.textSecondary },
});

export default OrderHistoryScreen;
