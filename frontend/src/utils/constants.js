// API & socket URL constants
export const COLORS = {
  primary: '#2ecc71',
  primaryDark: '#27ae60',
  secondary: '#3498db',
  accent: '#e74c3c',
  warning: '#f39c12',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#ecf0f1',
  success: '#2ecc71',
  error: '#e74c3c',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

export const ORDER_STATUSES = {
  pending: { label: 'Order Placed', icon: 'time-outline', color: '#f39c12' },
  confirmed: { label: 'Confirmed', icon: 'checkmark-circle-outline', color: '#3498db' },
  preparing: { label: 'Preparing', icon: 'restaurant-outline', color: '#9b59b6' },
  ready: { label: 'Ready for Pickup', icon: 'bag-check-outline', color: '#e67e22' },
  picked_up: { label: 'Picked Up', icon: 'bicycle-outline', color: '#1abc9c' },
  on_the_way: { label: 'On the Way', icon: 'car-outline', color: '#3498db' },
  delivered: { label: 'Delivered', icon: 'checkmark-done-circle', color: '#2ecc71' },
  cancelled: { label: 'Cancelled', icon: 'close-circle-outline', color: '#e74c3c' },
};

export const DELIVERY_FEE = 2.99;
export const FREE_DELIVERY_THRESHOLD = 35;
export const TAX_RATE = 0.08;
