const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('sortOrder');
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
});

// POST /api/categories (admin)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (err) { next(err); }
});

module.exports = router;
