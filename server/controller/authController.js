import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import User from '../Model/userModel.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import Email from '../utils/email.js';
const getToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};
const getRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  });
};
const refreshAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new AppError('Refresh token is required!', 400));
  }
  // check if refresh token is expired or not before renew Token
  try {
    const decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );
    const user = User.findById(decoded.id);
    if (!user) return next(new AppError('user is no longer exit', 404));

    // is password changed after refreshtoken created ?
    if (user.isPasswordChanged(decoded.iat))
      return next(new AppError('this token is expired, please log in.'));
    const newAccessToken = getToken(user._id);
    res.cookie('jwt', newAccessToken, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });

    res.locals.user = user; // for pug variables
    req.user = user;
    return next();
  } catch (error) {
    return next(new AppError('refreshToken expired or invalid!', 401));
  }
});
const createSendToken = (user, statusCode, message, req, res) => {
  const token = getToken(user._id);
  const refreshToken = getRefreshToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  res.cookie('refreshToken', refreshToken, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    message,
    user,
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, 'signed up successfully 🎉', req, res);
});
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('please enter Email and Password.', 400));
  const user = await User.findOne({ email }).select('+password');
  if (!user)
    return next(
      new AppError('No user registered with that email. please sign up.', 404),
    );

  //bcrypt password and compare it with pass in DB
  if (!(await user.checkPassword(password, user.password)))
    return next(new AppError('wrong Password!', 401));

  createSendToken(user, 200, 'logged in ✅', req, res);
});
export const logout = (req, res, next) => {
  res.cookie('jwt', ' logged out ', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'logged out', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};
export const protect = catchAsync(async (req, res, next) => {
  let token;
  //for postman testing
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  //token stored in cookies
  else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  //check if token provided
  if (!token) {
    return next(new AppError('Please log in first. 🚥', 401));
  }

  //verify token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (e) {
    if (e.name === 'JsonWebTokenError')
      return next(new AppError('you must log in first'));
    else return refreshAccessToken(req, res, next);
  }
  //check if user still exits
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('user is no longer exit.', 404));
  //check if password changed after token created

  if (user.isPasswordChanged(decoded.iat))
    return next(new AppError('token expired, please login.', 401));

  //check if refresh token expired while token not
  try {
    await promisify(jwt.verify)(
      req.cookies.refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );
  } catch (error) {
    const refreshToken = getRefreshToken(decoded.id);
    res.cookie('refreshToken', refreshToken, {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      ),
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });
  }
  res.locals.user = user;
  req.user = user;
  next();
});

export const restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('you dont have premission to do this action!🚫', 403),
      );
    return next();
  };
};
export const forgotPassword = catchAsync(async (req, res, next) => {
  // 1 - check if email is sent in body
  const { email } = req.body;
  if (!email) return next(new AppError('please enter your Email.', 404));

  //2- check if there is user with this email
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError(`this is no user registered with this Email`, 404),
    );

  const resetToken = user.createForgotPasswordToken();
  await user.save({ validateBeforeSave: false });

  //3- send resetToken  to user's Email
  try {
    //
    // const resetURL = `http://localhost:5173/resetPassword/${resetToken}`;
    // const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;
    const resetURL = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'email sent!',
    });
  } catch (error) {
    user.passwordResetToken = user.passwordResetTokenExpire = undefined;
    await user.save({ validateBeforeSave: true });
    return next(
      new AppError(
        'An Error happened while sending the Email. please try again later! 🙏',
        500,
      ),
    );
  }
});
export const resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken } = req.params;
  const hashedResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedResetToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('invaild or expired Reset Token', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;
  await user.save();
  createSendToken(user, 200, 'password is changed successfully', req, res);
});

//logged in user wants to change password
export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!user) return next(new AppError('no user is found! please login.', 404));

  if (!req.body.password)
    return next(new AppError('please enter your current password', 400));

  if (!(await user.checkPassword(req.body.password, user.password)))
    return next(new AppError('wrong Password!', 401));
  if (!req.body.newPassword || !req.body.newPasswordConfirm)
    return next(
      new AppError('please enter new password and new password confirm', 400),
    );
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  createSendToken(user, 200, 'password changed successfully', req, res);
});
