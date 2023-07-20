import { isValid, parse } from 'date-fns';
import { z } from 'zod';
import { genre } from './book.constants';

const createBookZodSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(255),
    genre: z.enum([...genre] as [string, ...string[]], {
      required_error: 'Genre is required!',
    }),
    publicationDate: z
      .string()
      .refine(dateString => {
        const date = parse(dateString, 'MM/dd/yyyy', new Date());
        return isValid(date);
      }, 'Invalid publication date')
      .transform(dateString => parse(dateString, 'MM/dd/yyyy', new Date())),
    author: z.string().optional(),
    authorID: z.string().optional(),
    reviews: z.array(z.string()).optional(),
  }),
});

const updateBookZodSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(255).optional(),
    genre: z.enum([...genre] as [string, ...string[]], {}).optional(),
    publicationDate: z
      .string()
      .refine(dateString => {
        const date = parse(dateString, 'MM/dd/yyyy', new Date());
        return isValid(date);
      }, 'Invalid publication date')
      .transform(dateString => parse(dateString, 'MM/dd/yyyy', new Date()))
      .optional(),
  }),
});


export const BookValidator = {
  createBookZodSchema,
  updateBookZodSchema,
};
