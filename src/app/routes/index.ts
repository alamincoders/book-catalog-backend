import express from 'express';
import { AuthRoute } from '../modules/auth/auth.route';
import { BookRoute } from '../modules/book/book.route';
import { ReviewRoute } from '../modules/reviews/reviews.route';

const router = express.Router();
const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoute,
  },
  {
    path: '/book',
    route: BookRoute,
  },
  {
    path: '/reviews',
    route: ReviewRoute,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));
export default router;
