import mongoose from 'mongoose';
const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true },
);

cartItemSchema.index({ product: 1, user: 1 }, { unique: true });

const CartItemModel = mongoose.model('CartItem', cartItemSchema);
export default CartItemModel;
