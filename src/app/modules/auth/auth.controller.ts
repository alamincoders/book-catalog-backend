import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  ILoginUserResponse,
  IRefreshTokenResponse,
  IUser,
} from './auth.interface';
import { UserService } from './auth.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const { ...userData } = req.body;
  const result = await UserService.createUser(userData);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User created successfully!',
    data: result,
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await UserService.loginUser(loginData);
  const { refreshToken, ...others } = result;

  // set refresh token into cookie

  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<ILoginUserResponse>(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully!',
    data: others,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await UserService.refreshToken(refreshToken);

  // set refresh token into cookie

  const cookieOptions = {
    secure: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: 200,
    success: true,
    message: 'User logged in successfully!',
    data: result,
  });
});

const createWishlist = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as { _id: string };
  const { bookId } = req.body;
  const result = await UserService.createWishlist(userId, bookId);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Wishlist created successfully!',
    data: result,
  });
});

const removeFromWishlist = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as { _id: string };
  const { bookId } = req.body;
  const result = await UserService.removeFromWishlist(userId, bookId);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Wishlist created successfully!',
    data: result,
  });
});

const addBookToReadingList = catchAsync(async (req: Request, res: Response) => {
  const { _id: userId } = req.user as { _id: string };
  const { bookId, status } = req.body;
  const result = await UserService.addBookToReadingList(userId, bookId, status);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Wishlist created successfully!',
    data: result,
  });
});

const updateReadingStatus = catchAsync(async (req: Request, res: Response) => { 
  const { _id: userId } = req.user as { _id: string };
  const { bookId, status } = req.body;
  const result = await UserService.updateReadingStatus(userId, bookId, status);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Wishlist Updated successfully!',
    data: result,
  });
});

const userProfile = catchAsync(async (req: Request, res: Response) => { 
  const { _id: userId } = req.user as { _id: string };
  const result = await UserService.userProfile(userId);
  sendResponse<IUser>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Profile fetched successfully!',
    data: result,
  });
});

export const AuthController = {
  createUser,
  loginUser,
  refreshToken,
  createWishlist,
  removeFromWishlist,
  addBookToReadingList,
  updateReadingStatus,
  userProfile,
};
