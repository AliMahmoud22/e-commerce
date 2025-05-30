import reviewModel from '../Model/reviewModel.js';
import * as factoryHandler from './factoryHandler.js';
import catchAsync from '../utils/catchAsync.js';
export const setProductIdAndUserId = (req, res, next) => {
    if (!req.body.product) req.body.product = req.params.productId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
  };
export const getAll = factoryHandler.getAll(reviewModel);
export const getOne = factoryHandler.getOne(reviewModel);
export const createOne = factoryHandler.createOne(reviewModel);
export const updateOne = factoryHandler.updateOne(reviewModel);
export const deleteOne = factoryHandler.deleteOne(reviewModel);
