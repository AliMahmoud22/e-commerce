import express from 'express';

import * as authController from '../controller/authController.js';
import * as orderController from '../controller/orderController.js';

const router = express.Router();
router.use(authController.protect);

router.get('/my-orders', orderController.getAll);
router.post('/checkout', orderController.createCheckoutSession); //test with internet
router.patch('/cancel/:id', orderController.cancelOrder);
router.post('/makeorder', orderController.createtempOrder);

router.use(authController.restrict('admin'));
router.route('/').get(orderController.getAll).post(orderController.createOrder);
router
  .route('/:id')
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

export default router;
