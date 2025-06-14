import dotenv from 'dotenv';
dotenv.config({ path: './config.env' });

import express from 'express';
import morgan from 'morgan';

import helmet from 'helmet';
import ratelimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import validator from 'validator';

import globalErrorHandle from './controller/globalErrorHandler.js';
import AppError from './utils/AppError.js';
import userRoute from './Routes/usersRoutes.js';
import productRoute from './Routes/productRoutes.js';
import cartRoute from './Routes/cartRoutes.js';
import orderRoute from './Routes/orderRoutes.js';
import reviewRoute from './Routes/reviewRoutes.js';
import * as orderController from './controller/orderController.js';


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
      /^https:\/\/e-commerce-rouge-tau-34\.vercel\.app$/,
      /^https:\/\/e-commerce-git-main-ali-mahmouds-projects-d99978cf\.vercel\.app$/,
      /^https:\/\/e-commerce-owkvpn5x1-ali-mahmouds-projects-d99978cf\.vercel\.app$/,
      /^https:\/\/e-commerce-e15c\.vercel\.app$/,
      /^https:\/\/e-commerce-gamma-olive-66\.vercel\.app$/,
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
