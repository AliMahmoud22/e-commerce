import AppError from './../utils/AppError.js';
import catchAsync from './../utils/catchAsync.js';
import apiFeatures from './../utils/apiFeatures.js';
import Review from '../Model/reviewModel.js';
import User from '../Model/userModel.js';
import Product from '../Model/productModel.js';

export const getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.productId) filter = { product: req.params.productId };
    if(req.query.isFeatured )filter = { isFeatured: req.query.isFeatured };
    const totalDocuments = await Model.countDocuments(filter); // total count before pagination

    const apifeatures = new apiFeatures(Model.find(filter), req.query)
      .filter()
      .fields()
      .sort()
      .paginate();
    const documents = await apifeatures.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const totalPages = Math.ceil(totalDocuments / limit);

    if (documents.length === 0 && totalDocuments > 0) {
      return next(new AppError('Page does not exist', 404));
    }

    res.status(200).json({
      status: 'success',
      currentPage: page,
      totalPages,
      totalResults: totalDocuments,
      results: documents.length,
      Data: documents,
    });
  });
export const getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query;

    if (req.params.id) query = await Model.findById(req.params.id);
    else {
      //searching about product by slug
      if (req.params.slug) query = Model.findOne({ slug: req.params.slug });
      //if searching with user email
      else if (req.params.email)
        query = Model.findOne({ email: req.params.email });
      else if (Model === Review) {
        const product = await Product.findOne({ name: req.params.productName });
        const user = await User.findOne({ name: req.params.userName });
        if (!product || !user)
          return next(
            new AppError(
              `No ${Model.modelName} found with that username and product name !`,
              404,
            ),
          );
        query = Model.find({
          user: user._id,
          product: product._id,
        })
          .populate({ path: 'product', select: 'name' })
          .populate({ path: 'user', select: 'name' });
      }
    }
    if (populateOptions) query = query.populate(populateOptions);
    const document = await query;
    if (!document)
      return next(new AppError(`No ${Model.modelName} with this name.❌`, 404));
    res.status(200).json({
      status: `success`,
      message: `${Model.modelName} found.`,
      document,
    });
  });
export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let doc;

    if (req.params.id) {
      doc = await Model.findByIdAndDelete(req.params.id);
    } else if (Model === Review) {
      const product = await Product.findOne({ name: req.params.productName });
      const user = await User.findOne({ name: req.params.userName });
      if (!product || !user)
        return next(
          new AppError(
            `No ${Model.modelName} found with that username and product name !`,
            404,
          ),
        );
      doc = await Model.findOneAndDelete({
        user: user._id,
        product: product._id,
      })
        .populate({
          path: 'user',
          select: 'name',
        })
        .populate({
          path: 'product',
          select: 'name',
        });
    }
    //searching about product by slug
    else doc = await Model.findOneAndDelete({ slug: req.params.slug });

    if (!doc) {
      return next(
        new AppError(`No ${Model.modelName} found with that id!`, 404),
      );
    }
    res.status(204).json({
      status: 'success',
      message: `${Model.modelName} is deleted successfully.✅`,
    });
  });
export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    let document;
    if (Model === Review) {
      const product = await Product.findOne({ name: req.params.productName });
      const user = await User.findOne({ name: req.params.userName });
      document = await Review.findOneAndUpdate(
        {
          product: product._id,
          user: user._id,
        },
        req.body,
        {
          runValidators: true,
          new: true,
        },
      );
    }
    //searching about user
    else if (req.params.id) {
      const { name, email } = req.body;
      document = await Model.findByIdAndUpdate(
        req.params.id,
        { name, email },
        {
          runValidators: true,
          new: true,
        },
      );
    }
    //searching about product by slug
    else
      document = await Model.findOneAndUpdate(
        { slug: req.params.slug },
        req.body,
        {
          runValidators: true,
          new: true,
        },
      );

    if (!document)
      return next(new AppError(`No ${Model.modelName} found.`, 404));

    res.status(200).json({
      status: 'success',
      message: `${Model.modelName} found.`,
      updatedData: document,
    });
  });
export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      message: `${Model.modelName} created successfuly.`,
      document,
    });
  });
