const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      min: [0, 'Discount price cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    images: [{ type: String }],
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      enum: ['kg', 'g', 'lb', 'oz', 'piece', 'pack', 'bottle', 'can', 'dozen', 'bunch'],
      default: 'piece',
    },
    brand: { type: String, trim: true },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    tags: [{ type: String, lowercase: true }],
    isFeatured: { type: Boolean, default: false },
    isOrganic: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    nutritionInfo: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
      fiber: Number,
    },
  },
  { timestamps: true }
);

// Virtual: effective price (discount or regular)
productSchema.virtual('effectivePrice').get(function () {
  return this.discountPrice && this.discountPrice < this.price
    ? this.discountPrice
    : this.price;
});

// Indexes for search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ 'rating.average': -1 });

module.exports = mongoose.model('Product', productSchema);
