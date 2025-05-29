import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

import Product from '../Model/productModel.js';
import * as factoryHandler from './factoryHandler.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';

export const getAll = factoryHandler.getAll(Product, 'reviews');
export const getProduct = factoryHandler.getOne(Product, 'reviews');
export const createProduct = factoryHandler.createOne(Product);
export const updateProduct = factoryHandler.updateOne(Product);
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  function extractPublicId(cloudinaryUrl) {
    const urlParts = cloudinaryUrl.split('/');
    const fileNameWithExtension = urlParts.pop(); // get the file name
    const folderPath = urlParts.slice(7).join('/'); // from after 'upload'
    const publicId = fileNameWithExtension.replace(/\.[^/.]+$/, ''); // remove extension
    return `${folderPath}/${publicId}`;
  }

  // Delete image from Cloudinary
  if (product.imageCover) {
    await cloudinary.uploader.destroy(
      extractPublicId(product.imageCover),
      (err, result) => {
        if (err) {
          console.error('Error deleting image from Cloudinary:', err);
        }
      },
    );
  }

  if (product.images) {
    product.images.forEach(async (image) => {
      await cloudinary.uploader.destroy(
        extractPublicId(image),
        (err, result) => {
          if (err) {
            console.error('Error deleting image from Cloudinary:', err);
          }
        },
      );
    });
  }
  await Product.findOneAndDelete({ slug: req.params.slug });
  res.status(204).json({
    status: 'success',
    message: 'Product deleted successfully',
  });
});
const multerStorage = multer.memoryStorage();
const multerFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else cb(new AppError('please upload image only', 400), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFileFilter });
export const uploadProductPhotos = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

export const uploadProductPhotosToCloudinary = catchAsync(
  async (req, res, next) => {
    if (req.files) {
      if (req.files.imageCover) {
        const imageCoverName = `product-${req.params.id}-${Date.now()}-cover.jpeg`;
        const buffer = await sharp(req.files.imageCover[0].buffer)
          // .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toBuffer();
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'e-commerce/products',
              public_id: imageCoverName,
              resource_type: 'image',
            },
            (err, result) => {
              if (err) {
                console.error('Cloudinary Upload Error:', err);
                reject(
                  new AppError(
                    'Error happened while uploading product image cover to cloudinary',
                    500,
                  ),
                );
              } else resolve(result);
            },
          );
          uploadStream.end(buffer);
        });
        req.body.imageCover = result.secure_url;
      }

      if (req.files.images) {
        //store images url
        req.body.images = [];
        await Promise.all(
          req.files.images.map(async (img, i) => {
            const imgName = `product-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
            const buffer = await sharp(img.buffer)
              // .resize(800, 800)
              .toFormat('jpeg')
              .jpeg({ quality: 80 })
              .toBuffer();
            const result = await new Promise((resolve, reject) => {
              const upload_stream = cloudinary.uploader.upload_stream(
                {
                  folder: 'e-commerce/products',
                  resource_type: 'image',
                  public_id: imgName,
                },
                (err, result) => {
                  if (err) {
                    console.error(err);
                    reject(
                      new AppError(
                        'Error happened while uploading product image to cloudinary',
                        500,
                      ),
                    );
                  } else resolve(result);
                },
              );
              upload_stream.end(buffer);
            });

            req.body.images.push(result.secure_url);
          }),
        );
      }
      const prod = await Product.findByIdAndUpdate(
        req.params.id,
        {
          imageCover: req.body.imageCover,
          images: req.body.images,
        },
        { new: true },
      );
      if (!prod)
        return next(
          new AppError('Error happened while uploading images to DB.', 500),
        );
      res.status(200).json({
        status: 'success',
        message: 'images uploaded.',
        product: prod,
      });
    } else return next(new AppError('no photos uploaded !', 404));
  },
);
