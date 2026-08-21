const Driver = require('../models/Driver');
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id, role: 'driver' }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// @route   POST /api/drivers/login
// @desc    Driver login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const driver = await Driver.findOne({ email }).select('+password');
    if (!driver || !(await driver.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    driver.isOnline = true;
    await driver.save({ validateBeforeSave: false });
    const token = generateToken(driver._id);
    res.json({ success: true, token, driver: driver.toJSON() });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/drivers/availability
// @desc    Toggle driver availability
// @access  Private/Driver
exports.toggleAvailability = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);
    driver.isAvailable = !driver.isAvailable;
    await driver.save();
    res.json({ success: true, isAvailable: driver.isAvailable });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/drivers/pending-orders
// @desc    Get orders pending pickup in driver's area
// @access  Private/Driver
exports.getPendingOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ status: 'ready', driver: null })
      .populate('customer', 'name phone')
      .sort('createdAt');
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/drivers/accept-order/:orderId
// @desc    Driver accepts an order
// @access  Private/Driver
exports.acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { driver: req.params.driverId, status: 'picked_up' },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    await Driver.findByIdAndUpdate(req.params.driverId, { currentOrder: order._id, isAvailable: false });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
