import mongoose from 'mongoose';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import validator from 'validator';
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please provide Name.'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your Email.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid Email !'],
  },
  photo: {
    type: String,
    default:
      'https://res.cloudinary.com/dytz39qgw/image/upload/v1747912854/default-user-image.avif',
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  password: {
    type: String,
    minlength: [8, 'password must be at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'password and password Confirm must be the same!⛔',
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordResetToken: { type: String, select: false },
  passwordResetTokenExpire: Date,
  cart: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'CartItem',
    },
  ],
});

//if password changed then encrypt the password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 16);
  this.passwordConfirm = undefined;
  next();
});

//if password changed and not sign up then change password changeAt
userSchema.pre('save', function (next) {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 2000;
  }
  next();
});
//return active user only
userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
  next();
});
userSchema.pre(/^find/, function (next) {
  this.populate('cart');
  next();
});
//check the password given with the DB
userSchema.methods.checkPassword = async (candidatePassword, password) =>
  await bcrypt.compare(candidatePassword, password);

//create resetToken for forgotPassword
userSchema.methods.createForgotPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000; // vaild for 10 mins
  return resetToken;
};

//return if Password Changed after the time sent
userSchema.methods.isPasswordChanged = function (tokenIAT) {
  if (this.passwordChangedAt) {
    return this.passwordChangedAt.getTime() / 1000 > tokenIAT;
  }
  return false;
};
const User = mongoose.model('User', userSchema);
export default User;
