import mongoose from 'mongoose';
import slugify from 'slugify';
import AppError from '../utils/AppError.js';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      maxlength: [100, 'product name must be lower than 100 characters.'],
      minlength: [5, 'product name must be more than 5 characters.'],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2500,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'quantity must be greater than 0.'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'price must be greater than 0.'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'other',
        'sports',
        'beauty',
        'home',
        'books',
        'fashion',
        'electronics',
      ],
    },
    brand: { type: String, required: true, default: 'Generic' },
    images: [String],
    imageCover: {
      type: String,
      default:
        'https://res.cloudinary.com/dytz39qgw/image/upload/v1747781286/product_default.jpg',
    },
    discount: Number,

    slug: {
      type: String,
      lowercase: true,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'ratingsAverage must be above 1'],
      max: [10, 'ratingsAverage must be below 10'],
      set: (val) => Math.round(val * 10) / 10,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    isFeatured: { type: Boolean, default: false },
    updatedAt: Date,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });

//virtual populate
productSchema.virtual('isInStock').get(function () {
  return this.stock > 0;
});
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

productSchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});
productSchema.pre('remove', function (next) {
  if (this.stock > 0) return next(new AppError('you cant remove this product'));
  next();
});
//to check the discount value before saving or updating
productSchema.pre('save', function (next) {
  if (this.discount && this.discount >= this.price) {
    return next(
      new AppError('Discount must be less than the actual price.', 400),
    );
  }
  next();
});

productSchema.pre('save', function (next) {
  const meetsRatingCriteria =
    this.ratingsAverage >= 9 && this.ratingsCount >= 10;
  const hasGreatDiscount =
    this.discount && (this.discount / this.price) * 100 > 30;

  if (meetsRatingCriteria && hasGreatDiscount) {
    this.isFeatured = true;
  } else {
    this.isFeatured = false;
  }

  next();
});

productSchema.pre(/^findOneAndUpdate|updateOne$/, async function (next) {
  const update = this.getUpdate();
  const { discount } = update;
  let { price } = update;

  if (discount !== undefined) {
    let actualPrice = price;
    // If price isn't included in the update, fetch it from the DB
    if (price === undefined) {
      const doc = await this.model.findOne(this.getQuery());
      if (!doc) return next(new AppError('Product not found.', 404));
      actualPrice = doc.price;
    }

    if (discount >= actualPrice) {
      return next(
        new AppError('Discount must be less than the actual price.', 400),
      );
    }
  }

  next();
});
productSchema.pre(/^findOneAndUpdate|updateOne$/, async function (next) {
  const update = this.getUpdate();
  const product = await this.model.findOne(this.getQuery());
  if (!product) return next(new AppError('Product not found', 404));

  // Use updated values if provided, else fallback to existing ones
  const ratingsAverage = update.ratingsAverage ?? product.ratingsAverage;
  const ratingsCount = update.ratingsCount ?? product.ratingsCount;
  const price = update.price ?? product.price;
  const discount = update.discount ?? product.discount;

  const meetsRatingCriteria = ratingsAverage >= 9 && ratingsCount >= 10;
  const hasGreatDiscount = discount && (discount / price) * 100 > 30;

  update.isFeatured = meetsRatingCriteria && hasGreatDiscount;

  next();
});

productSchema.methods.calStock = function (quantity) {
  this.stock = this.stock - quantity;
};
const Product = new mongoose.model('Product', productSchema);

export default Product;
