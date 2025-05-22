import Order from '../Model/orderModel.js';
import Cart from '../Model/cartitemModel.js';
import product from '../Model/productModel.js';
import User from '../Model/userModel.js';
import Review from '../Model/reviewModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res) => {
  const products = await product.find();
  res.status(200).render('overview', {
    title: 'Home',
    products,
  });
});

// export const getTour = catchAsync(async (req, res, next) => {
//   const tour = await product.findOne({ slug: req.params.tourSlug }).populate({
//     path: 'reviews',
//     select: 'review rating user',
//   });
//   if (!tour) return next(new AppError('there is no Tour with that name.', 404));

//   res.status(200).render('tour', {
//     title: tour.name,
//     tour,
//   });
// });
// export const getMyTours = catchAsync(async (req, res, next) => {
//   const myBookings = await Booking.find({ user: req.user.id });
//   const toursId = myBookings.map((el) => el.tour);
//   const tours = await Tour.find({ _id: { $in: toursId } });
//   res.status(200).render('overview', {
//     title: 'my Bookings',
//     tours,
//   });
// });
// export const getMyReviews = catchAsync(async (req, res, next) => {
//   const reviews = await Review.find({ user: req.user.id });
//   res.status(200).render('myReviews', { title: 'my reviews', reviews });
// });
export const login = (req, res) => {
  res.status(200).render('login', { title: 'Log in into your account' });
};
export const signup = (req, res) => {
  res.status(200).render('signUp', { title: 'Create your account' });
};
export const account = async (req, res, next) => {
  res.status(200).render('account', {
    title: 'Account',
  });
};
// export const updateUserData = catchAsync(async (req, res, next) => {
//   const updatedUser = await User.findByIdAndUpdate(
//     req.user.id,
//     {
//       name: req.body.name,
//       email: req.body.email,
//     },
//     {
//       new: true,
//       runValidators: true,
//     },
//   );
//   res.status(200).render('account', {
//     title: 'Account',
//     user: updatedUser,
//   });
// });
export const alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking')
    res.locals.alert =
      'Your booking is successfuly completed. \n might take some time to show up in your bookings.';
  next();
};

export const manageTours = (req, res, next) => {
  res.status(200).render('manageTours', { title: 'manage Tour' });
};
export const manageUsers = (req, res, next) => {
  res.status(200).render('manageUsers', { title: 'manage User' });
};
export const manageReviews = (req, res, next) => {
  res.status(200).render('manageReviews', { title: 'manage Review' });
};
export const manageBookings = (req, res, next) => {
  res.status(200).render('manageBookings', { title: 'manage Booking' });
};
