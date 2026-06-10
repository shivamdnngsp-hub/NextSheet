import { z } from "zod";

export const signupValidator = z.object({
  userName: z.string().trim().min(3, "At least 3 characters required for username").max(30, "Username is too long"),
  email: z.string().trim().min(1, "Please enter email").email("Enter valid email id"),
  password: z.string().trim().min(4, "Password should be at least 4 characters"),
});

export const loginValidator = z.object({
  email: z.string().trim().email("Please enter valid email id"),
  password: z.string().min(1, "Please enter password"),
});