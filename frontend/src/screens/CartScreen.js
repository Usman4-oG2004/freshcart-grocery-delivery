import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { CartContext } from '../context/CartContext';
import { COLORS } from '../utils/constants';
import { formatPrice, getEffectivePrice } from '../utils/helpers';

const CartScreen = ({ navigation }) => {
  const { items, itemCount, subtotal, deliveryFee, tax, total, removeFromCart, updateQuantity } =
    useContext(CartContext);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some fresh groceries!</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.shopBtnText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.cartItem}>
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.imagePlaceholder]}>
          <Text style={{ fontSize: 28 }}>🥦</Text>
        </View>
      )}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>{formatPrice(getEffectivePrice(item))}</Text>
      </View>
      <View style={styles.qtyControls}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => updateQuantity(item._id, item.quantity - 1)}
        >
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity
          style={[styles.qtyBtn, styles.qtyBtnPlus]}
          onPress={() => updateQuantity(item._id, item.quantity + 1)}
        >
          <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeFromCart(item._id)}
      >
        <Text style={styles.removeBtnText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        <Text style={styles.itemCount}>{itemCount} items</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Order Summary</Text>
            {[
              { label: 'Subtotal', value: formatPrice(subtotal) },
              {
                label: 'Delivery Fee',
                value: deliveryFee === 0 ? '🎉 Free' : formatPrice(deliveryFee),
                green: deliveryFee === 0,
              },
              { label: 'Tax (8%)', value: formatPrice(tax) },
            ].map(({ label, value, green }) => (
              <View key={label} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{label}</Text>
                <Text style={[styles.summaryValue, green && { color: COLORS.primary, fontWeight: '700' }]}>
                  {value}
                </Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
            {deliveryFee > 0 && (
              <Text style={styles.freeDeliveryHint}>
                💡 Add {formatPrice(35 - subtotal)} more for free delivery!
              </Text>
            )}
          </View>
        }
      />

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalSmall}>Total</Text>
          <Text style={styles.totalBig}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyEmoji: { fontSize: 80 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  emptySubtitle: { fontSize: 15, color: COLORS.textSecondary },
  shopBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  shopBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text },
  itemCount: { fontSize: 15, color: COLORS.textSecondary, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: { width: 70, height: 70, borderRadius: 12, resizeMode: 'cover' },
  imagePlaceholder: { backgroundColor: '#f0f4f0', alignItems: 'center', justifyContent: 'center' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 19 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary, marginTop: 4 },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPlus: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  qtyText: { fontSize: 15, fontWeight: '700', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 18 },
  summary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    gap: 12,
  },
  summaryTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  freeDeliveryHint: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 4 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalSmall: { fontSize: 12, color: COLORS.textSecondary },
  totalBig: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  checkoutBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

export default CartScreen;
