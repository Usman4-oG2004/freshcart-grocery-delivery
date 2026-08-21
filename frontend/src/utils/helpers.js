import { COLORS } from './constants';

/**
 * Format price as currency string
 */
export const formatPrice = (amount) => {
  return `$${Number(amount).toFixed(2)}`;
};

/**
 * Get effective price (discount or regular)
 */
export const getEffectivePrice = (product) => {
  return product.discountPrice && product.discountPrice < product.price
    ? product.discountPrice
    : product.price;
};

/**
 * Calculate discount percentage
 */
export const getDiscountPercent = (product) => {
  if (!product.discountPrice || product.discountPrice >= product.price) return 0;
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
};

/**
 * Format date to readable string
 */
export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get star rating display
 */
export const getStars = (rating) => {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
};

/**
 * Truncate text to given length
 */
export const truncate = (str, maxLength = 50) => {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: '#f39c12',
    confirmed: '#3498db',
    preparing: '#9b59b6',
    ready: '#e67e22',
    picked_up: '#1abc9c',
    on_the_way: '#3498db',
    delivered: COLORS.primary,
    cancelled: '#e74c3c',
  };
  return colors[status] || COLORS.text;
};
