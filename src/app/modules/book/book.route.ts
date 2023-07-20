import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BookController } from './book.controller';
import { BookValidator } from './book.validation';

const router = express.Router();

router.get('/', BookController.getAllBooks);
router.post(
  '/',
  auth(),
  validateRequest(BookValidator.createBookZodSchema),
  BookController.createBook,
);
router
  .route('/:id')
  .get(BookController.getSingleBook)
  .delete(auth(), BookController.deleteBook);

router.patch(
  '/:id',
  auth(),
  validateRequest(BookValidator.updateBookZodSchema),
  BookController.updateBook,
);
export const BookRoute = router;
