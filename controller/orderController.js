import Stripe from 'stripe';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import OrderModel from '../Model/orderModel.js';
import CartItemModel from '../Model/cartitemModel.js';
import ProductModel from '../Model/productModel.js';
import * as factoryHandler from './factoryHandler.js';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(
  'sk_test_51RPNR3IyfmMT8Q7zoKQ6yi4rnncHT7Jozza8eje2Q8mC987r1aylvMlxnrkCd80dVwmeY4JSoKYuXmHlxZfF0H3n003y63BvKu',
);
export const createCheckoutSession = catchAsync(async (req, res, next) => {
  //get cart items
  const cartItems = await CartItemModel.find({ user: req.user.id }).populate(
    'product',
  );

  if (cartItems.length == 0) return next(new AppError('cart is empty!', 400));
  const lineItems = cartItems.map((item) => ({
    price_data: {
      currency: 'usd',
      unit_amount: item.product.price * 100, //in cents
      product_data: {
        name: item.product.name,
        images: [item.product.imageCover],
      },
    },

    quantity: item.quantity,
  }));
  //create stripe session
  const session = await stripe.checkout.sessions.create({
    customer_email: req.user.email,
    // cancel_url: `http://localhost:5173/`,
    // success_url: `http://localhost:5173/my-orders`,
    // cancel_url: `${req.protocol}://${req.get('host')}/`,
    success_url: `${req.protocol}://${req.get('host')}/my-orders`,
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    shipping_address_collection: { allowed_countries: ['EG'] },
    metadata: {
      userId: req.user.id.toString(),
    },
  });
  res.status(200).json({
    status: 'success',
    session,
  });
});
export const getAll = catchAsync(async (req, res, next) => {
  let orders;

  //show admin all orders
  if (req.user.role === 'admin')
    orders = await OrderModel.find()
      .populate('user', 'name email')
      .populate({ path: 'items.product', select: 'name price imageCover' });
  // show user all his orders
  else
    orders = await OrderModel.find({ user: req.user.id })
      .populate({ path: 'items.product', select: 'name price imageCover' })
      .select('-user -paymentIntentId');

  res.status(200).json({ status: 'success', length: orders.length, orders });
});
export const getOrder = catchAsync(async (req, res, next) => {
  const order = await OrderModel.findById({
    user: req.user.id,
    _id: req.params.id,
  }).populate('items.product');
  if (!order) return next(new AppError('no order found.', 404));
  res.status(200).json({ status: 'success', data: order });
});
const makeOrder = catchAsync(async (session) => {
  const { userId } = session.metadata;
  const cartItems = await CartItemModel.find({ user: userId }).populate(
    'product',
  );
  const items = cartItems.map((item) => ({
    product: item.product.id,
    price: item.product.price,
    quantity: item.quantity,
  }));
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = session.shipping?.address;
  //create order in DB
  await OrderModel.create({
    user: userId,
    totalPrice,
    items,
    paidAt: Date.now(),
    paymentIntentId: session.paymentIntentId,
    status: session.status,
    shippingAddress: {
      address: shipping.address,
      city: shipping.city,
      country: shipping.country,
      postalCode: shipping.postal_code,
    },
  });
  //empty cart
  await CartItemModel.deleteMany({ user: userId });
});
export const updateOrder = catchAsync(async (req, res, next) => {
  // if admin update order status to be cancelled
  if (req.body.status === 'cancelled') {
    const order = await OrderModel.findById(req.params.id);

    if (!order) return next(new AppError('no order found with this ID.', 404));

    if (order.status === 'cancelled')
      return next(new AppError('order is already cancelled!', 400));

    //restore products stock
    const updates = order.items.map(
      async (item) =>
        await ProductModel.findByIdAndUpdate(
          item.product,
          {
            $inc: { stock: item.quantity },
          },
          { new: true },
        ),
    );
    await Promise.all(updates);

    //cancel order
    order.status = 'cancelled';
    await order.save();
    res
      .status(200)
      .json({ status: 'success', message: 'order is updated.', data: order });
  } else {
    const order = await OrderModel.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      { new: true },
    );
    if (!order) return next(new AppError('no order found with this id.', 404));
    res
      .status(200)
      .json({ status: 'success', message: 'order is updated.', data: order });
  }
});
export const webhookCheckout = catchAsync(async (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return res.status(400).send(`webhook error ${error.message} `);
  }
  if (event.type === 'checkout.session.completed') makeOrder(event.data.object);
  res.status(200).json({ received: true });
});

export const cancelOrder = catchAsync(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) return next(new AppError('no order found with this ID.', 404));

  if (order.status === 'shipped' || order.status === 'delivered')
    return next(new AppError(`Can't cancel shipped or delivered order.`, 400));
  if (order.status === 'cancelled')
    return next(new AppError('order is already cancelled!', 400));
  //restore products stock
  const updates = order.items.map(
    async (item) =>
      await ProductModel.findByIdAndUpdate(
        item.product,
        {
          $inc: { stock: item.quantity },
        },
        { new: true },
      ),
  );
  await Promise.all(updates);

  //cancel order
  order.status = 'cancelled';
  await order.save();
  res.status(200).json({ status: 'success', message: 'order is cancelled.' });
});

//order made by admin without using stripe
export const createOrder = factoryHandler.createOne(OrderModel);

//delete this in production
export const createtempOrder = catchAsync(async (req, res, next) => {
  const cartItems = await CartItemModel.find({ user: req.user.id }).populate(
    'product',
  );
  if (cartItems.length == 0) return next(new AppError('cart is empty!', 400));
  const items = cartItems.map((item) => ({
    product: item.product.id,
    price: item.product.price,
    quantity: item.quantity,
  }));
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  //create order in DB
  const order = await OrderModel.create({
    user: req.user.id,
    totalPrice,
    items,
    paidAt: Date.now(),
    status: 'delivered',
  });
  //empty cart
  await CartItemModel.deleteMany({ user: req.user.id });
  res.status(200).json({ data: order });
});

export const deleteOrder = factoryHandler.deleteOne(OrderModel);
