import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import { formatPrice } from '../utils/helpers';

const PAYMENT_METHODS = [
  { id: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵' },
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'wallet', label: 'Wallet', icon: '👜' },
];

const CheckoutScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { items, subtotal, deliveryFee, tax, total, clearCart } = useContext(CartContext);

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const [address, setAddress] = useState({
    street: defaultAddress?.street || '',
    city: defaultAddress?.city || '',
    state: defaultAddress?.state || '',
    zipCode: defaultAddress?.zipCode || '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      Alert.alert('Incomplete Address', 'Please fill in all address fields.');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
      }));

      const { data } = await api.post('/orders', {
        items: orderItems,
        deliveryAddress: address,
        paymentMethod,
        notes,
      });

      clearCart();
      navigation.replace('OrderTracking', { orderId: data.data._id, order: data.data });
    } catch (err) {
      Alert.alert('Order Failed', err.response?.data?.error || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📍 Delivery Address</Text>
          {[['Street Address', 'street', 'default'], ['City', 'city', 'default'], ['State', 'state', 'default'], ['ZIP Code', 'zipCode', 'numeric']].map(
            ([label, key, keyboardType]) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={address[key]}
                  onChangeText={(v) => setAddress((a) => ({ ...a, [key]: v }))}
                  placeholder={label}
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType={keyboardType}
                />
              </View>
            )
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentOption, paymentMethod === method.id && styles.paymentOptionActive]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <Text style={[styles.paymentLabel, paymentMethod === method.id && styles.paymentLabelActive]}>
                {method.label}
              </Text>
              <View style={[styles.radio, paymentMethod === method.id && styles.radioActive]}>
                {paymentMethod === method.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Special Instructions</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="E.g. Leave at the door, ring the bell..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
            maxLength={200}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Order Summary</Text>
          {items.map((item) => (
            <View key={item._id} style={styles.summaryRow}>
              <Text style={styles.summaryLabel} numberOfLines={1}>{item.name} x{item.quantity}</Text>
              <Text style={styles.summaryValue}>{formatPrice((item.discountPrice || item.price) * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery</Text>
            <Text style={[styles.summaryValue, deliveryFee === 0 && { color: COLORS.primary }]}>
              {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && styles.disabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>🛒  Place Order — {formatPrice(total)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  back: { fontSize: 22, color: COLORS.text, width: 24 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    margin: 14,
    marginBottom: 0,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  inputGroup: { gap: 5 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  notesInput: { height: 80, textAlignVertical: 'top' },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  paymentOptionActive: { borderColor: COLORS.primary, backgroundColor: '#f0fbf4' },
  paymentIcon: { fontSize: 22 },
  paymentLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  paymentLabelActive: { color: COLORS.primary },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary, flex: 1 },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  bottomBar: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border },
  placeOrderBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 17,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  disabled: { opacity: 0.7 },
  placeOrderText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default CheckoutScreen;
