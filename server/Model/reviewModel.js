import mongoose from 'mongoose';
import Product from './productModel.js';

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must have owner'],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: [true, 'review must belong to a product'],
    },
    comment: String,
    rate: {
      type: Number,
      min: 0,
      max: 10,
      required: [true, 'review must have Rate'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calcAvgRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        numRatings: { $sum: 1 },
        avgRatings: { $avg: '$rate' },
      },
    },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsCount: stats[0].numRatings,
      ratingsAverage: stats[0].avgRatings,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsCount: 0,
      ratingsAverage: 0,
    });
  }
};

ReviewSchema.post('save', function () {
  this.constructor.calcAvgRatings(this.product);
});

ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.model.findOne(this.getQuery());
  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  await this.review.constructor.calcAvgRatings(this.review.product);
});

ReviewSchema.pre(/^find/, function (next) {
  this.populate({ path: 'product', select: 'name stock' })
    .populate({ path: 'user', select: 'name photo' })
    .select('-__v');
  next();
});

const Review = mongoose.model('Review', ReviewSchema);
export default Review;
