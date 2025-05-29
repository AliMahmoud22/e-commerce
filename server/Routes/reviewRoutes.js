import express from 'express';
import * as reviewController from '../controller/reviewController.js';
import * as authController from '../controller/authController.js';
const router = express.Router();
router.use(authController.protect);
router
  .route('/:productId?')
  .get(reviewController.getAll)
  .post(reviewController.setProductIdAndUserId, reviewController.createOne);

router
  .route('/:productName/:userName')
  .get(reviewController.getOne)
  .patch(reviewController.updateOne)
  .delete(reviewController.deleteOne);
export default router;
