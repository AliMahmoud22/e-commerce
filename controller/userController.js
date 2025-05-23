import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import * as factoryHandler from './factoryHandler.js';
import User from '../Model/userModel.js';

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else cb(new AppError('please upload image only.', 400), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

export const uploadUserPhoto = upload.single('photo');
export const uploadUserPhotoToCloudinary = catchAsync(
  async (req, res, next) => {
    //check if there is image
    if (!req.file) return next(new AppError('No photo uploaded!', 404));

    //logged in user wants to change photo
    if (!req.user) {
      return next(new AppError('Please log in first. 🚥', 401));
    }

    //admin wants to change user's photo
    let adminUpdateUserPhoto = false;
    if (req.user.role == 'admin' && req.params.id !== req.user.id) {
      req.file.filename = `user-${req.params.id}-${Date.now()}.jpg`;
      adminUpdateUserPhoto = true;
    }
    //logged in user changing their photo
    else req.file.filename = `user-${req.user.id}-${Date.now()}.jpg`;

    // Upload the image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'e-commerce/users',
          public_id: req.file.filename,
          resource_type: 'image',
          transformation: [
            { quality: 80 },
            { width: 500, height: 500, gravity: 'face', crop: 'thumb' },
            {
              fetch_format: 'jpg',
            },
            { radius: 'max' },
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary Upload Error: ', error);
            reject(new AppError('Failed to upload image to Cloudinary.', 500));
          } else resolve(result);
        },
      );
      uploadStream.end(req.file.buffer);
    });

    let user;
    // Save the Cloudinary URL to logged in user
    if (!adminUpdateUserPhoto) {
      req.user.photo = result.secure_url;
      user = await User.findByIdAndUpdate(
        req.user.id,
        {
          photo: result.secure_url,
        },
        { new: true },
      );
    }
    // Save the Cloudinary URL to updated user by admin
    else {
      user = await User.findByIdAndUpdate(
        req.params.id,
        {
          photo: result.secure_url,
        },
        { new: true },
      );
    }
    if (!user)
      return next(new AppError('Error happened while updating the DB', 500));

    res
      .status(200)
      .json({ status: 'success', message: 'photo uploaded.', user });
  },
);

export const getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});
export const updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('you cant update password from here.', 400));

  const filter = ['name', 'photo', 'email'];
  let filteredBody = {};
  Object.keys(req.body).forEach((key) => {
    if (filter.includes(key)) filteredBody[key] = req.body[key];
  });
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  if (!user)
    return next(new AppError('Error happened while updating DB.', 500));
  res
    .status(200)
    .json({ status: 'success', message: 'user is updated.', user });
});
export const deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  if (!user) return next(new AppError('no user found!', 404));
  else
    res.status(204).json({
      status: 'success',
      message: 'user is deleted.',
    });
});

export const getUser = factoryHandler.getOne(User);
export const getAllUsers = factoryHandler.getAll(User);
export const createUser = factoryHandler.createOne(User);
export const updateUser = factoryHandler.updateOne(User);
export const deleteUser = factoryHandler.deleteOne(User);
