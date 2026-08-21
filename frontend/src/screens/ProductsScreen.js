import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator, Image,
} from 'react-native';
import { CartContext } from '../context/CartContext';
import api from '../services/api';
import { COLORS } from '../utils/constants';
import { formatPrice, getEffectivePrice } from '../utils/helpers';

const ProductsScreen = ({ navigation, route }) => {
  const { categoryId, categoryName, search: initSearch, isFeatured } = route.params || {};
  const { addToCart } = useContext(CartContext);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initSearch || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => { fetchProducts(1, true); }, [search, categoryId]);

  const fetchProducts = async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
        ...(search && { search }),
        ...(categoryId && { category: categoryId }),
        ...(isFeatured && { isFeatured: 'true' }),
      });

      const { data } = await api.get(`/products?${params}`);
      const newProducts = data.data;

      setProducts(reset ? newProducts : (prev) => [...prev, ...newProducts]);
      setHasMore(data.pagination.page < data.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
      activeOpacity={0.85}
    >
      {item.images?.[0] ? (
        <Image source={{ uri: item.images[0] }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={{ fontSize: 36 }}>🥦</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.unit}>{item.unit}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>{formatPrice(getEffectivePrice(item))}</Text>
          {item.discountPrice && (
            <Text style={styles.original}>{formatPrice(item.price)}</Text>
          )}
        </View>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item)}>
        <Text style={styles.addBtnText}>+</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{categoryName || 'All Products'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={search}
          onChangeText={(v) => { setSearch(v); }}
          onSubmitEditing={() => fetchProducts(1, true)}
          returnKeyType="search"
        />
      </View>

      {loading && page === 1 ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={() => hasMore && fetchProducts(page + 1)}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 48 }}>🔍</Text>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backText: { fontSize: 22, color: COLORS.text },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.text },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  image: { width: '100%', height: 120, resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f4f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { padding: 10 },
  name: { fontSize: 13, fontWeight: '700', color: COLORS.text, lineHeight: 18 },
  unit: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  original: { fontSize: 11, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  addBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 28 },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 16, color: COLORS.textSecondary },
});

export default ProductsScreen;
