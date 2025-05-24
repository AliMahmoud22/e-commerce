import CartItemModel from '../Model/cartitemModel.js';
import User from '../Model/userModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAll = catchAsync(async (req, res, next) => {
  const cart = await CartItemModel.find({ user: req.user.id }).populate(
    'product',
    'name price imageCover',
  );
  res
    .status(200)
    .json({ status: 'success', length: cart.length, cartItems: cart });
});
export const clear = catchAsync(async (req, res, next) => {
  await CartItemModel.deleteMany({ user: req.user.id });
  res.status(204).json({ status: 'success', message: 'cleared.' });
});
export const addItem = catchAsync(async (req, res, next) => {
  const { quantity = 1, product } = req.body;
  const cartItem = await CartItemModel.findOneAndUpdate(
    {
      user: req.user.id,
      product: product,
    },
    { $set: { quantity } },
    { new: true, runValidators: true, upsert: true },
  );
  
  // Add the cart item to the user's cart array
  await User.findByIdAndUpdate(
    req.user.id,
    { $addToSet: { cart: cartItem._id } }, // $addToSet ensures no duplicates
    { new: true },
  );
  res.status(200).json({ status: 'success', data: cartItem });
});
export const updateItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const updatedItem = await CartItemModel.findByIdAndUpdate(
    req.params.id,
    { $set: { quantity } },
    { new: true, runValidators: true },
  );
  if (!updatedItem) return next(new AppError('no cartItem found.', 404));
  res.status(200).json({ data: updatedItem });
});
export const deleteItem = catchAsync(async (req, res, next) => {
  await CartItemModel.findByIdAndDelete(req.params.id);

  res.status(204).json({ data: null });
});
