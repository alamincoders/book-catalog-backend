import { Schema, model } from 'mongoose';
import { IReview, ReviewModel } from './reviews.interface';

const reviewSchema = new Schema<IReview, ReviewModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Review = model<IReview, ReviewModel>('Review', reviewSchema);