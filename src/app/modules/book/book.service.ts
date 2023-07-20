import httpStatus from 'http-status';
import { SortOrder } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { User } from '../auth/auth.model';
import { Review } from '../reviews/reviews.model';
import { bookSearchableFields } from './book.constants';
import { IBook, IBookFilters } from './book.interface';
import { Book } from './book.model';
import { Types } from 'mongoose';

const getAllBooks = async (
  filters: IBookFilters,
  paginationOptions: IPaginationOptions,
): Promise<IGenericResponse<IBook[]>> => {
  const { searchTerm, fromDate, toDate, ...otherFilters } = filters;
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = [];

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm, 'i');
    andConditions.push({
      $or: bookSearchableFields.map(field => ({
        [field]: searchRegex,
      })),
    });
  }

  if (fromDate && toDate) {
    andConditions.push({ publicationDate: { $gte: fromDate, $lte: toDate } });
  }
  if (Object.keys(otherFilters).length) {
    andConditions.push({
      $and: Object.entries(otherFilters).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }
  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Book.find(whereConditions)
    .select('_id title author genre publicationDate')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);
  const total = await Book.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const createBook = async (
  id: string,
  payload: IBook,
): Promise<IBook | null> => {
  const isExist = await User.findOne({ _id: id });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }
  const { author, authorID, ...bookData } = payload;
  const result = await Book.create({
    author: isExist?.name,
    authorID: isExist?._id,
    ...bookData,
  });
  return {
    ...result.toJSON(),
    author: isExist?.name,
  } as IBook;
};

const getSingleBook = async (id: string): Promise<IBook | null> => {
  const result = await Book.findById({ _id: id })
    .populate({
      path: 'authorID',
      select: 'readingList wishlist email _id',
    })
    .populate({
      path: 'reviews',
    });
  return result;
};

const updateBook = async (
  id: string,
  userID: string,
  payload: IBook,
): Promise<IBook | null> => {
  const isExist = await Book.findOne({ _id: id, authorID: userID });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found !');
  }
  const { ...bookData } = payload;
  const updateBookData: Partial<IBook> = { ...bookData };
  const result = await Book.findOneAndUpdate({ _id: id }, updateBookData, {
    new: true,
    validateBeforeSave: true,
  });
  return result;
};

const deleteBook = async (
  userID: string,
  id: string,
): Promise<IBook | null> => {
  const session = await Book.startSession();

  try {
    session.startTransaction();
    const isExist = await Book.findOne({
      _id: id,
      authorID: new Types.ObjectId(userID),
    });
    if (!isExist) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Book not found!');
    }
    const result = await Book.findByIdAndDelete(id).session(session);
    await Review.deleteMany({ book: id }).session(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const BookService = {
  getAllBooks,
  createBook,
  getSingleBook,
  updateBook,
  deleteBook,
};
