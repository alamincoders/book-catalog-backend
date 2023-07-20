import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import { Types } from 'mongoose';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { Book } from '../book/book.model';
import {
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
  IUser,
  ReadingStatusType,
} from './auth.interface';
import { User } from './auth.model';
const createUser = async (payload: IUser): Promise<IUser | null> => {
  const user = await User.create(payload);
  return user;
};

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  const isUserExist = await User.isUserExist(email);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if password matches
  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect');
  }

  //create access token & refresh token
  const { _id, email: userEmail, name } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { _id, email: userEmail, name },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  const refreshToken = jwtHelpers.createToken(
    { _id, email: userEmail, name },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string,
  );
  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret,
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { _id } = verifiedToken;

  const isUserExist = await User.findById({
    _id,
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const newAccessToken = jwtHelpers.createToken(
    {
      _id: isUserExist._id,
      email: isUserExist.email,
      name: isUserExist.name,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string,
  );

  return {
    accessToken: newAccessToken,
  };
};

const createWishlist = async (
  userId: string,
  bookId: string,
): Promise<IUser | null> => {
  const bookObjectId = new Types.ObjectId(bookId);
  const existingBook = await Book.findOne({
    _id: bookId,
  });
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if (!user.wishlist) {
    user.wishlist = [];
  }

  // Check if the book is already in the wishlist
  const existingBookIndex = user.wishlist.findIndex(
    wishlistItem => wishlistItem.bookID.toString() === bookId,
  );
  if (existingBookIndex !== -1) {
    throw new ApiError(httpStatus.CONFLICT, 'Book already in the wishlist');
  }

  user.wishlist.push({
    bookID: bookObjectId,
    bookName: existingBook?.title,
  });

  await user.save();
  return user;
};

const removeFromWishlist = async (
  userId: string,
  bookId: string,
): Promise<IUser | null> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const bookObjectId = new Types.ObjectId(bookId);

  if (!user.wishlist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Book not in the wishlist');
  }

  user.wishlist = user.wishlist.filter(
    item => item.bookID.toString() !== bookObjectId.toString(),
  );

  await user.save();
  return user;
};

const addBookToReadingList = async (
  userId: string,
  bookId: string,
  status: ReadingStatusType,
): Promise<IUser | null> => {
  const bookObjectId = new Types.ObjectId(bookId);
  const existingBook = await Book.findOne({
    _id: bookId,
  });
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Ensure the readingList property exists
  if (!user.readingList) {
    user.readingList = [];
  }

  // Check if the book is already in the reading list
  const existingBookIndex = user.readingList.findIndex(
    readingItem => readingItem.book?.toString() === bookId,
  );
  if (existingBookIndex !== -1) {
    throw new ApiError(httpStatus.CONFLICT, 'Book already in the reading list');
  }

  // Add the book to the reading list
  const readingItem = {
    book: bookObjectId,
    bookName: existingBook?.title,
    status,
  };
  user.readingList.push(readingItem);

  await user.save();
  return user;
};

const updateReadingStatus = async (
  userId: string,
  bookId: string,
  status: ReadingStatusType,
): Promise<IUser | null> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found!');
  }

  // Ensure the readingList property exists
  if (!user.readingList) {
    user.readingList = [];
  }

  // Check if the book is already in the reading list
  const existingBookIndex = user.readingList.findIndex(
    readingItem => readingItem.book?.toString() === bookId,
  );
  if (existingBookIndex === -1) {
    throw new ApiError(httpStatus.CONFLICT, 'Book not in the reading list');
  }

  // update the book status in the reading list
  user.readingList[existingBookIndex].status = status;
  await user.save();
  return user;
};

const userProfile = async (userId: string): Promise<IUser | null> => {
  const result = await User.findById(userId).select(
    'name wishlist readingList',
  );
  return result;
};

export const UserService = {
  createUser,
  loginUser,
  refreshToken,
  createWishlist,
  removeFromWishlist,
  addBookToReadingList,
  updateReadingStatus,
  userProfile,
};
