import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { UserValidator } from './auth.validation';

const router = express.Router();

router.post(
  '/signup',
  validateRequest(UserValidator.createUserZodSchema),
  AuthController.createUser,
);
router.post(
  '/login',
  validateRequest(UserValidator.loginZodSchema),
  AuthController.loginUser,
);
router.post(
  '/refresh-token',
  validateRequest(UserValidator.refreshTokenZodSchema),
  AuthController.refreshToken,
);

router.get('/me', auth(), AuthController.userProfile);
router.post('/reading-list', auth(), AuthController.addBookToReadingList);
router.patch('/reading-list', auth(), AuthController.updateReadingStatus);
router.post('/wishlist', auth(), AuthController.createWishlist);
router.delete('/wishlist/:bookId', auth(), AuthController.removeFromWishlist);

export const AuthRoute = router;
