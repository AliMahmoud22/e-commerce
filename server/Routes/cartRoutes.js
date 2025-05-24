import express from 'express';
import * as authController from '../controller/authController.js';
import * as cartController from '../controller/cartController.js';
const router = express.Router();

router.use(authController.protect);
router
  .route('/')
  .get(cartController.getAll)
  .post(cartController.addItem)
  .delete(cartController.clear);
router
  .route('/:id')
  .patch(cartController.updateItem)
  .delete(cartController.deleteItem);

export default router;
