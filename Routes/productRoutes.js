import express from 'express';
import * as productController from '../controller/productController.js';
import * as authController from '../controller/authController.js';

const router = express.Router();

router
  .route('/')
  .get(productController.getAll)
  .post(
    authController.protect,
    authController.restrict('admin'),
    productController.createProduct,
  );

router.patch(
  '/upload-product-photos/:id',
  productController.uploadProductPhotos,
  productController.uploadProductPhotosToCloudinary,
);
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrict('admin'),
    productController.updateProduct,
  )
  .delete(
    authController.protect,
    authController.restrict('admin'),
    productController.deleteProduct,
  );

export default router;
