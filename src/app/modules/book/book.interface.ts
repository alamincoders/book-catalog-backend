import { Document, Model, Types } from 'mongoose';
import { IUser } from '../auth/auth.interface';
import { IReview } from '../reviews/reviews.interface';

export enum Genres {
  Fantasy = 'Fantasy',
  ScienceFiction = 'Science Fiction',
  Horror = 'Horror',
  Romance = 'Romance',
  Thriller = 'Thriller',
  Mystery = 'Mystery',
  Detective = 'Detective',
  Dystopian = 'Dystopian',
  Memoir = 'Memoir',
  HistoricalFiction = 'Historical Fiction',
  CookBook = 'Cook Book',
  Autobiography = 'Autobiography',
  Biography = 'Biography',
  SelfHelp = 'Self Help',
}

export interface IBook extends Document {
  title: string;
  author?: string;
  authorID?: Types.ObjectId | IUser;
  genre: Genres;
  publicationDate: Date;
  reviews?: Array<{
    reviewID: Types.ObjectId | IReview | null;
    comment: string | null;
  }>;
}

export type IBookFilters = {
  searchTerm?: string;
  genre?: string;
  fromDate?: Date;
  toDate?: Date;
};

export type BookModel = Model<IBook, Record<string, unknown>>;
