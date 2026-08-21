import { io } from 'socket.io-client';

const SOCKET_URL = __DEV__
  ? 'http://10.0.2.2:5000'
  : 'https://your-production-api.com';

let socket = null;

const connectDriverSocket = (driverId, orderId) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('[Driver Socket] Connected:', socket.id);
    // Join the order room as driver
    socket.emit('driver:join', { driverId, orderId });
  });

  socket.on('connect_error', (err) => {
    console.error('[Driver Socket] Connection error:', err.message);
  });

  return socket;
};

/**
 * Broadcast driver GPS location to server
 */
const broadcastLocation = ({ driverId, orderId, lat, lng, heading, speed }) => {
  if (!socket) {
    connectDriverSocket(driverId, orderId);
    return;
  }

  socket.emit('driver:update-location', {
    driverId,
    orderId,
    lat,
    lng,
    heading,
    speed,
  });
};

/**
 * Update order status from driver side
 */
const updateOrderStatus = (orderId, status, message) => {
  socket?.emit('driver:order-status', { orderId, status, message });
};

const disconnectDriverSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const getSocket = () => socket;

module.exports = {
  connectDriverSocket,
  broadcastLocation,
  updateOrderStatus,
  disconnectDriverSocket,
  getSocket,
};
