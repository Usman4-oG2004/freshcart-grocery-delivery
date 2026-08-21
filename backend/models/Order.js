const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      // Auto-generated before save
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
    },
    items: [orderItemSchema],
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    pricing: {
      subtotal: { type: Number, required: true },
      deliveryFee: { type: Number, default: 2.99 },
      tax: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: [
        'pending',       // Order placed, waiting for confirmation
        'confirmed',     // Store confirmed the order
        'preparing',     // Store is packing the items
        'ready',         // Ready for pickup by driver
        'picked_up',     // Driver picked up from store
        'on_the_way',    // Driver on the way to customer
        'delivered',     // Successfully delivered
        'cancelled',     // Cancelled
      ],
      default: 'pending',
    },
    statusHistory: [statusHistorySchema],
    paymentMethod: {
      type: String,
      enum: ['cash_on_delivery', 'card', 'wallet'],
      default: 'cash_on_delivery',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    notes: { type: String, maxlength: 200 },
    rating: {
      score: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `FC-${timestamp}-${random}`;
  }
  // Add to status history when status changes
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ driver: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
