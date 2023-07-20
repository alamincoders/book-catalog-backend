import { Document, Model, Types } from 'mongoose';
import { IUser } from '../auth/auth.interface';
import { IBook } from '../book/book.interface';


export interface IReview extends Document {
  user: Types.ObjectId | IUser;
  book: Types.ObjectId | IBook;
  comment: string;
}
export type ReviewModel = Model<IReview, Record<string, unknown>>;