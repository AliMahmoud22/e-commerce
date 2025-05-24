import mongoose from 'mongoose';
import Product from './productModel.js';
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: { type: Number, min: 1, required: true },
      price: { type: Number, min: 0, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  shippingAddress: {
    address: String,
    city: String,
    country: String,
    postalCode: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: Date,
  paymentIntentId: String, // comes from Strip
});

//reduce product stock if order made
orderSchema.post('save', async function () {
  if (this.status !== 'cancelled') {
    const products = this.items.map(
      async (item) =>
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: { stock: -item.quantity },
          },
          { new: true },
        ),
    );
    await Promise.all(products);
  }
});

//restore stock if order deleted
orderSchema.pre('findOneAndDelete', async function (next) {
  this.order = await this.model.findOne(this.getQuery());
  next();
});
orderSchema.post('findOneAndDelete', async function () {
  if (!this.order) return;

  //If order status isn't cancelled then restore the stock.Restoring stock for cancelled orders impelemented in cancelOrder in orderController
  if (this.order.status !== 'cancelled') {
    const products = this.order.items.map(
      async (item) =>
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: { stock: item.quantity },
          },
          { new: true },
        ),
    );
    await Promise.all(products);
  }
});

const OrderModel = mongoose.model('Order', orderSchema);
export default OrderModel;
