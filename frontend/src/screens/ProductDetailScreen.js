import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { CartContext } from '../context/CartContext';
import { COLORS } from '../utils/constants';
import { formatPrice, getEffectivePrice, getDiscountPercent } from '../utils/helpers';

const ProductDetailScreen = ({ navigation, route }) => {
  const product = route.params?.product;
  const { addToCart } = useContext(CartContext);

  if (!product) {
    return (
      <View style={styles.error}>
        <Text>Product not found</Text>
      </View>
    );
  }

  const effectivePrice = getEffectivePrice(product);
  const discountPct = getDiscountPercent(product);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          {product.images?.[0] ? (
            <Image source={{ uri: product.images[0] }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={{ fontSize: 80 }}>🥦</Text>
            </View>
          )}
          {discountPct > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discountPct}% OFF</Text>
            </View>
          )}
          {product.isOrganic && (
            <View style={styles.organicBadge}>
              <Text style={styles.organicText}>🌿 Organic</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{product.category?.icon} {product.category?.name}</Text>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}>{product.rating?.average?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.ratingCount}>({product.rating?.count || 0} reviews)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(effectivePrice)}</Text>
            <Text style={styles.unit}>/ {product.unit}</Text>
            {product.discountPrice && (
              <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
            )}
          </View>

          {/* Stock */}
          <View style={[styles.stockBadge, { backgroundColor: product.stock > 10 ? '#e8f8f0' : '#fef9e7' }]}>
            <Text style={[styles.stockText, { color: product.stock > 10 ? COLORS.primary : '#f39c12' }]}>
              {product.stock > 0
                ? product.stock > 10
                  ? '✅ In Stock'
                  : `⚠️ Only ${product.stock} left`
                : '❌ Out of Stock'}
            </Text>
          </View>

          {/* Description */}
          {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          ) : null}

          {/* Nutrition */}
          {product.nutritionInfo && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
              <View style={styles.nutritionGrid}>
                {Object.entries(product.nutritionInfo).map(([key, value]) =>
                  value ? (
                    <View key={key} style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>{value}</Text>
                      <Text style={styles.nutritionLabel}>{key}</Text>
                    </View>
                  ) : null
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add to Cart Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomLabel}>Price</Text>
          <Text style={styles.bottomPrice}>{formatPrice(effectivePrice)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, product.stock === 0 && styles.addBtnDisabled]}
          onPress={() => { addToCart(product); navigation.goBack(); }}
          disabled={product.stock === 0}
        >
          <Text style={styles.addBtnText}>🛒  Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageContainer: { height: 300, position: 'relative', backgroundColor: '#f0f4f0' },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backIcon: { fontSize: 20, color: COLORS.text },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  discountBadge: {
    position: 'absolute',
    top: 48,
    right: 20,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  discountText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  organicBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  organicText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  details: { padding: 20 },
  categoryTag: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  categoryText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  productName: { fontSize: 24, fontWeight: '800', color: COLORS.text, lineHeight: 30 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  star: { color: '#f39c12', fontSize: 16 },
  rating: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  ratingCount: { fontSize: 13, color: COLORS.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 12 },
  price: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
  unit: { fontSize: 16, color: COLORS.textSecondary },
  originalPrice: { fontSize: 16, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  stockBadge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 14,
    alignSelf: 'flex-start',
  },
  stockText: { fontSize: 14, fontWeight: '600' },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  nutritionItem: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 14,
    width: '30%',
    alignItems: 'center',
  },
  nutritionValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  nutritionLabel: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, textTransform: 'capitalize' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: '#fff',
  },
  bottomLabel: { fontSize: 13, color: COLORS.textSecondary },
  bottomPrice: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  addBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 15,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  addBtnDisabled: { backgroundColor: COLORS.textSecondary },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ProductDetailScreen;
