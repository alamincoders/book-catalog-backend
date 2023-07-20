import { z } from 'zod';


const createReviewZodSchema = z.object({
    body: z.object({
        user: z.string().optional(),
        book: z.string().optional(),
        comment: z.string().min(5).max(255),
    }),
});


export const ReviewValidator = {
    createReviewZodSchema,
};


