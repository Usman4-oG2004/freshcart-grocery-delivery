/**
 * FreshCart Live Tracking - Socket.io Handler
 *
 * Events:
 *  Driver  -> Server: 'driver:join'          - Driver identifies with driverId
 *  Driver  -> Server: 'driver:update-location' - Driver sends new GPS coords
 *  Driver  -> Server: 'driver:order-status'    - Driver updates order status
 *
 *  Customer -> Server: 'customer:track-order'  - Customer subscribes to order
 *
 *  Server -> Customer: 'driver:location-update' - Broadcast driver location
 *  Server -> Customer: 'order:status-changed'   - Broadcast status changes
 *  Server -> Customer: 'order:eta-updated'      - ETA updates
 */

const Driver = require('../models/Driver');
const Order = require('../models/Order');

// In-memory map: driverId -> socketId (for fast lookup)
const driverSockets = new Map();
// In-memory map: orderId -> customerSocketId
const orderCustomers = new Map();

const initTrackingSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`📡 Socket connected: ${socket.id}`);

    // ---- DRIVER EVENTS ---------------------------------------------------

    /**
     * Driver joins - authenticates and registers their socket
     * Payload: { driverId, orderId }
     */
    socket.on('driver:join', async ({ driverId, orderId }) => {
      try {
        driverSockets.set(driverId, socket.id);
        socket.data.driverId = driverId;
        socket.data.orderId = orderId;
        socket.join(`driver-${driverId}`);
        socket.join(`order-${orderId}`);

        console.log(`🚗 Driver ${driverId} joined for order ${orderId}`);
        socket.emit('driver:joined', { message: 'Tracking session started.' });
      } catch (err) {
        socket.emit('error', { message: 'Failed to join tracking session.' });
      }
    });

    /**
     * Driver broadcasts their GPS location
     * Payload: { driverId, orderId, lat, lng, heading, speed }
     */
    socket.on('driver:update-location', async ({ driverId, orderId, lat, lng, heading, speed }) => {
      try {
        // Persist to DB
        await Driver.findByIdAndUpdate(driverId, {
          'currentLocation.lat': lat,
          'currentLocation.lng': lng,
          'currentLocation.updatedAt': new Date(),
        });

        const eta = estimateETA(speed);

        // Broadcast to customer tracking this order
        io.to(`order-${orderId}`).emit('driver:location-update', {
          lat,
          lng,
          heading,
          speed,
          eta,
          timestamp: new Date().toISOString(),
        });

        // Broadcast to any admins monitoring
        io.to('admins').emit('driver:location-update', { driverId, orderId, lat, lng });
      } catch (err) {
        console.error('Location update error:', err.message);
      }
    });

    /**
     * Driver updates order status
     * Payload: { orderId, status, message }
     */
    socket.on('driver:order-status', async ({ orderId, status, message }) => {
      try {
        const order = await Order.findById(orderId);
        if (!order) return;

        order.status = status;
        if (status === 'delivered') {
          order.actualDeliveryTime = new Date();
        }
        await order.save();

        // Notify customer
        io.to(`order-${orderId}`).emit('order:status-changed', {
          orderId,
          status,
          message: message || getStatusMessage(status),
          timestamp: new Date().toISOString(),
        });

        console.log(`📦 Order ${orderId} status -> ${status}`);
      } catch (err) {
        console.error('Status update error:', err.message);
      }
    });

    // ---- CUSTOMER EVENTS -------------------------------------------------

    /**
     * Customer subscribes to order tracking
     * Payload: { orderId, customerId }
     */
    socket.on('customer:track-order', ({ orderId, customerId }) => {
      socket.join(`order-${orderId}`);
      orderCustomers.set(orderId, socket.id);
      socket.data.customerId = customerId;
      socket.data.orderId = orderId;

      console.log(`👤 Customer ${customerId} tracking order ${orderId}`);
      socket.emit('tracking:started', {
        message: 'You are now tracking your order.',
        orderId,
      });
    });

    // ---- DISCONNECT ------------------------------------------------------

    socket.on('disconnect', async () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);

      if (socket.data.driverId) {
        driverSockets.delete(socket.data.driverId);
        // Mark driver offline
        await Driver.findByIdAndUpdate(socket.data.driverId, { isOnline: false }).catch(() => {});
      }

      if (socket.data.orderId && socket.data.customerId) {
        orderCustomers.delete(socket.data.orderId);
      }
    });
  });
};

// ---- Helpers ---------------------------------------------------------------

function estimateETA(speedKmh = 30) {
  // Rough ETA estimation (assumes 5km average remaining distance)
  const distanceKm = 5;
  const timeHours = distanceKm / Math.max(speedKmh, 5);
  const timeMinutes = Math.round(timeHours * 60);
  return timeMinutes;
}

function getStatusMessage(status) {
  const messages = {
    pending: 'Order received! We are processing it.',
    confirmed: 'Your order has been confirmed!',
    preparing: 'Store is packing your items.',
    ready: 'Order is ready! Waiting for driver pickup.',
    picked_up: 'Driver has picked up your order.',
    on_the_way: '🚗 Driver is on the way to you!',
    delivered: '✅ Your order has been delivered! Enjoy!',
    cancelled: 'Your order has been cancelled.',
  };
  return messages[status] || 'Order status updated.';
}

module.exports = { initTrackingSocket, driverSockets, orderCustomers };
