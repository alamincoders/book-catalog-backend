import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewController } from './reviews.controller';
import { ReviewValidator } from './reviews.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
  validateRequest(ReviewValidator.createReviewZodSchema),
  ReviewController.createReview,
);

router.get('/:id', ReviewController.getReviews);

export const ReviewRoute = router;
