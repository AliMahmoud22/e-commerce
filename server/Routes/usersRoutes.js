import express from 'express';
import * as authController from '../controller/authController.js';
import * as userController from '../controller/userController.js';
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.route('/resetPassword/:resetToken').patch(authController.resetPassword);

router.use(authController.protect);

router.patch(
  '/upload-photo/:id',
  userController.uploadUserPhoto,
  userController.uploadUserPhotoToCloudinary,
);
router
  .route('/me')
  .get(userController.getMe, userController.getUser)
  .patch(userController.updateMe)
  .delete(userController.deleteMe);
router.patch('/updatePassword', authController.updatePassword);

//admin
router.use(authController.restrict('admin'));
router.route('/').get(userController.getAllUsers).post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
