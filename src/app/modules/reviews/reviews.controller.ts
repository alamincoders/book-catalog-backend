import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { IReview } from './reviews.interface';
import { ReviewService } from './reviews.service';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as { _id: string };
  const { bookId, comment } = req.body;
  const result = await ReviewService.createReview(userId, bookId, comment);

  sendResponse<IReview>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getReviews(req.params.id);
  sendResponse<IReview[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book Fetched successfully',
    data: result,
  });
});

export const ReviewController = { createReview, getReviews };
