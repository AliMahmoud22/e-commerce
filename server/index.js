import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';
import helmet from 'helmet';
import ratelimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import validator from 'validator';
import connectToDatabase from './utils/database.js';
import globalErrorHandle from './controller/globalErrorHandler.js';
import AppError from './utils/AppError.js';
import userRoute from './Routes/usersRoutes.js';
import productRoute from './Routes/productRoutes.js';
import cartRoute from './Routes/cartRoutes.js';
import orderRoute from './Routes/orderRoutes.js';
import reviewRoute from './Routes/reviewRoutes.js';
import * as orderController from './controller/orderController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const port = process.env.PORT || 4000;

//connecting to DB and initalize server
(async () => {
  try {
    await connectToDatabase();
    console.log('🌐 MongoDB connected.');

    const server = app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

    process.on('unhandledRejection', async (err) => {
      console.error('Unhandled Rejection! 💥');
      console.error(err);
      await mongoose.connection.close();
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();

const app = express();

//xss security
const { escape } = validator;
app.use((req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = escape(req.body[key]); // Escape special characters
      }
    }
  }
  next();
});

// Allow APIs from specific origins
app.use(
  cors({
    origin: [
      'https://e-commerce-rouge-tau-34.vercel.app/', // Added as a string
      'https://e-commerce-git-main-ali-mahmouds-projects-d99978cf.vercel.app/',
      'https://e-commerce-owkvpn5x1-ali-mahmouds-projects-d99978cf.vercel.app/',
      /^https:\/\/e-commerce-gamma-olive-66\.vercel\.app/,
      /^https:\/\/checkout\.stripe\.com$/, // stripe
      /^https:\/\/res\.cloudinary\.com$/, // cloudinary
    ],
    credentials: true, // needed for cookies
  }),
);

app.set('trust proxy', 1); // Trust only the first proxy (Vercel's)

// CSP config
const scriptSrcUrls = ['https://cdnjs.cloudflare.com', 'https://js.stripe.com'];
const styleSrcUrls = ['https://fonts.googleapis.com/'];
const connectSrcUrls = ['ws:', 'https://checkout.stripe.com'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", "'unsafe-eval'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https://res.cloudinary.com'],
      fontSrc: ["'self'", ...fontSrcUrls],
      frameSrc: ['https://js.stripe.com'],
    },
  }),
);

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiter
const limiter = ratelimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again later',
});
app.use('/api', limiter);

// Stripe webhook
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  orderController.webhookCheckout,
);

// Body parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization
app.use(mongoSanitize());
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'price'],
  }),
);

// compression
app.use(compression());

// // Routes

app.use('/api/users', userRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/products', productRoute);
app.use('/api/cart', cartRoute);
app.use('/api/orders', orderRoute);

// no route found handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on the server!`, 404));
});

// Global error handler
app.use(globalErrorHandle);

export default app;
