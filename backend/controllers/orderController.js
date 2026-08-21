const Order = require('../models/Order');
const Product = require('../models/Product');

// @route   POST /api/orders
// @desc    Place a new order
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item.' });
    }

    // Fetch products and validate stock
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ error: `Product ${item.productId} not found.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const price = product.discountPrice || product.price;
      subtotal += price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        image: product.images[0] || '',
      });

      // Deduct stock
      product.stock -= item.quantity;
      await product.save();
    }

    const deliveryFee = subtotal >= 35 ? 0 : 2.99; // Free delivery over $35
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const total = parseFloat((subtotal + deliveryFee + tax).toFixed(2));

    const order = await Order.create({
      customer: req.user._id,
      items: orderItems,
      deliveryAddress,
      pricing: { subtotal, deliveryFee, tax, total },
      paymentMethod: paymentMethod || 'cash_on_delivery',
      notes,
      statusHistory: [{ status: 'pending', message: 'Order placed successfully' }],
    });

    await order.populate('customer', 'name email phone');

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/my
// @desc    Get authenticated user's orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ customer: req.user._id })
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('driver', 'name phone vehicle currentLocation'),
      Order.countDocuments({ customer: req.user._id }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('driver', 'name phone vehicle currentLocation avatar stats')
      .populate('items.product', 'name images');

    if (!order) return res.status(404).json({ error: 'Order not found.' });

    // Only allow customer or admin
    if (
      req.user.role !== 'admin' &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status (driver/admin)
// @access  Private
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, message } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    order.status = status;
    if (status === 'delivered') order.actualDeliveryTime = new Date();
    if (message) order.statusHistory[order.statusHistory.length - 1].message = message;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/orders/:id/rate
// @desc    Rate an order (customer)
// @access  Private
exports.rateOrder = async (req, res, next) => {
  try {
    const { score, comment } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id, status: 'delivered' },
      { rating: { score, comment } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found or not eligible for rating.' });
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};
