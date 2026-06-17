import { z } from "zod";

/**
 * Validates the creation of a new product review/comment
 */
export const addCommentSchema = z.object({
  productId: z.string().cuid({
    message: "Invalid product identifier format.",
  }),
  content: z
    .string()
    .min(1, { message: "Review content must be at least 3 characters long." })
    .max(500, { message: "Review content cannot exceed 500 characters." }),
  rating: z
    .number({
      required_error: "Rating is mandatory.",
    })
    .min(1, { message: "Minimum rating is 1 star." })
    .max(5, { message: "Maximum rating is 5 stars." })
    .int({ message: "Rating must be a whole number." }),
});

/**
 * Validates updates to an existing review
 */
export const updateCommentSchema = z.object({
  commentId: z.string().cuid({
    message: "Invalid comment identifier.",
  }),
  content: z.string().min(3).max(500).optional(),
  rating: z.number().min(1).max(5).int().optional(),
});

/**
 * Validates comment deletion
 */
export const deleteCommentSchema = z.object({
  commentId: z.string().cuid({
    message: "Invalid comment identifier for deletion.",
  }),
});

// Infer types for use in Client Components & Mutations
export type AddCommentInput = z.infer<typeof addCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
