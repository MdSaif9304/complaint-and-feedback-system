import { z } from "zod";
import {
  COMPLAINT_STATUSES,
  DEPARTMENTS,
  FEEDBACK_CATEGORIES,
  PRIORITIES,
  ROLES,
} from "./constants";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  role: z.enum(["student", "faculty"], {
    errorMap: () => ({ message: "Role must be student or faculty" }),
  }),
  department: z.enum(DEPARTMENTS).optional(),
  rollNo: z.string().trim().max(40).optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const complaintSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  // Category is a free string validated against the Category collection at submit
  // time, so admins can add/remove categories without code changes.
  category: z.string().trim().min(1, "Please select a category").max(60),
  department: z.enum(DEPARTMENTS),
  priority: z.enum(PRIORITIES).default("medium"),
  description: z
    .string()
    .trim()
    .min(15, "Please describe the issue in at least 15 characters")
    .max(2000),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  description: z.string().trim().max(200).optional().or(z.literal("")),
  sensitive: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true),
});

export const updateCategorySchema = categorySchema
  .partial()
  .refine((d) => Object.values(d).some((v) => v !== undefined), {
    message: "Provide at least one field to update",
  });

export const updateComplaintSchema = z
  .object({
    status: z.enum(COMPLAINT_STATUSES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    assignedTo: z.string().trim().max(80).optional(),
    response: z.string().trim().max(2000).optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined && v !== ""), {
    message: "Provide at least one field to update",
  });

export const feedbackSchema = z.object({
  category: z.enum(FEEDBACK_CATEGORIES),
  rating: z.coerce.number().int().min(1, "Rating is required").max(5),
  comments: z.string().trim().max(1000).optional().or(z.literal("")),
  anonymous: z.coerce.boolean().default(false),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;
export type UpdateComplaintInput = z.infer<typeof updateComplaintSchema>;
export type FeedbackInput = z.infer<typeof feedbackSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;

export { ROLES };
