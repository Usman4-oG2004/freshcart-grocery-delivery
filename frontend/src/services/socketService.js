import { io } from 'socket.io-client';

const SOCKET_URL = __DEV__
  ? 'http://10.0.2.2:5000'  // Android emulator
  : 'https://your-production-api.com';

let socket = null;

/**
 * Connect to the Socket.io server
 */
export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

/**
 * Subscribe to live order tracking
 * @param {string} orderId
 * @param {string} customerId
 * @param {function} onLocationUpdate - called with {lat, lng, heading, eta}
 * @param {function} onStatusChange - called with {status, message}
 */
export const trackOrder = (orderId, customerId, onLocationUpdate, onStatusChange) => {
  const s = connectSocket();

  s.emit('customer:track-order', { orderId, customerId });

  s.on('driver:location-update', onLocationUpdate);
  s.on('order:status-changed', onStatusChange);

  // Return cleanup function
  return () => {
    s.off('driver:location-update', onLocationUpdate);
    s.off('order:status-changed', onStatusChange);
  };
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
