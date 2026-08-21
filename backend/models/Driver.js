const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    phone: { type: String, required: true },
    avatar: { type: String },
    vehicle: {
      type: { type: String, enum: ['bike', 'car', 'scooter'], default: 'bike' },
      plate: { type: String },
      model: { type: String },
    },
    isOnline: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: Date },
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    stats: {
      totalDeliveries: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      rating: { type: Number, default: 5.0, min: 1, max: 5 },
    },
    fcmToken: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

driverSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

driverSchema.methods.toJSON = function () {
  const driver = this.toObject();
  delete driver.password;
  delete driver.fcmToken;
  return driver;
};

module.exports = mongoose.model('Driver', driverSchema);
