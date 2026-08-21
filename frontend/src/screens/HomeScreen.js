import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Image, RefreshControl, ActivityIndicator,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import { formatPrice, getEffectivePrice } from '../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { itemCount } = useContext(CartContext);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [catRes, featRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?isFeatured=true&limit=10'),
      ]);
      setCategories(catRes.data.data);
      setFeatured(featRes.data.data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    if (search.trim()) {
      navigation.navigate('Products', { search: search.trim() });
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={COLORS.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>What are you looking for today?</Text>
        </View>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.cartIcon}>🛒</Text>
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search groceries..."
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Promo Banner */}
      <TouchableOpacity style={styles.banner} activeOpacity={0.9}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>🎉 Free Delivery</Text>
          <Text style={styles.bannerSubtitle}>On orders over $35!</Text>
          <View style={styles.bannerBadge}>
            <Text style={styles.bannerBadgeText}>Shop Now →</Text>
          </View>
        </View>
        <Text style={styles.bannerEmoji}>🚚</Text>
      </TouchableOpacity>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingRight: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: item.color + '18' }]}
              onPress={() => navigation.navigate('Products', { categoryId: item._id, categoryName: item.name })}
            >
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Featured Products */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⭐ Featured</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Products', { isFeatured: true })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={featured}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingRight: 24 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              {item.images?.[0] ? (
                <Image source={{ uri: item.images[0] }} style={styles.productImage} />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Text style={{ fontSize: 40 }}>🥦</Text>
                </View>
              )}
              {item.discountPrice && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% OFF
                  </Text>
                </View>
              )}
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productUnit}>{item.unit}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.productPrice}>{formatPrice(getEffectivePrice(item))}</Text>
                  {item.discountPrice && (
                    <Text style={styles.originalPrice}>{formatPrice(item.price)}</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  greeting: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subGreeting: { fontSize: 14, color: COLORS.textSecondary, marginTop: 2 },
  cartBtn: { position: 'relative', padding: 8 },
  cartIcon: { fontSize: 28 },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 14,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 10,
  },
  searchIcon: { fontSize: 18 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  clearIcon: { fontSize: 16, color: COLORS.textSecondary },
  banner: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bannerContent: { flex: 1 },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  bannerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
  bannerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  bannerBadgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  bannerEmoji: { fontSize: 52 },
  section: { marginTop: 24, paddingLeft: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  seeAll: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
  categoryCard: {
    width: 88,
    height: 88,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  categoryIcon: { fontSize: 30 },
  categoryName: { fontSize: 12, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  productCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productImage: { width: '100%', height: 130, resizeMode: 'cover' },
  productImagePlaceholder: {
    width: '100%',
    height: 130,
    backgroundColor: '#f0f4f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontWeight: '700', color: COLORS.text, lineHeight: 18 },
  productUnit: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  productPrice: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  originalPrice: { fontSize: 12, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
});

export default HomeScreen;
