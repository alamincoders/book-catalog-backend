import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { bookFilterableFields } from './book.constants';
import { IBook } from './book.interface';
import { BookService } from './book.service';

const getAllBooks = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, bookFilterableFields);
  const paginationOptions = pick(req.query, paginationFields);
  const result = await BookService.getAllBooks(filters, paginationOptions);
  sendResponse<IBook[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Books fetched successfully',
    meta: result.meta,
    data: result.data,
  });
});

const createBook = catchAsync(async (req: Request, res: Response) => {
  const { _id: userID } = req.user as { _id: string };
  const result = await BookService.createBook(userID, req.body);
  sendResponse<IBook>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Book created successfully',
    data: result,
  });
});

const getSingleBook = catchAsync(async (req: Request, res: Response) => {
  const result = await BookService.getSingleBook(req.params.id);
  sendResponse<IBook>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book fetched successfully',
    data: result,
  });
});


const deleteBook = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { _id: userID } = req.user as { _id: string };
  const result = await BookService.deleteBook(userID, id);
  sendResponse<IBook>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book deleted successfully',
    data: result,
  });
});

const updateBook = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { _id: userID } = req.user as { _id: string };
    const { ...bookData } = req.body;
    const result = await BookService.updateBook(id, userID, bookData);
    sendResponse<IBook>(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Book updated successfully',
        data: result,
    });
});

export const BookController = {
  getAllBooks,
  createBook,
  getSingleBook,
  deleteBook,
  updateBook,
};
