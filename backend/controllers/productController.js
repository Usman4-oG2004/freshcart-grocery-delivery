const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products with search, filter & pagination
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      isFeatured,
      isOrganic,
      sort = '-createdAt',
      page = 1,
      limit = 20,
    } = req.query;

    const query = { isActive: true };

    // Full-text search
    if (search) {
      query.$text = { $search: search };
    }

    // Filters
    if (category) query.category = category;
    if (isFeatured === 'true') query.isFeatured = true;
    if (isOrganic === 'true') query.isOrganic = true;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug icon color')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug icon color');
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @route   POST /api/products
// @desc    Create product (Admin only)
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    await product.populate('category', 'name slug icon color');
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name slug icon color');
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: 'Product not found.' });
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
