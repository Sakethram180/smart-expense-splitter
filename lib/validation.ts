import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

export const groupSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(200).optional().default("")
});

export const inviteSchema = z.object({
  email: z.string().email()
});

export const expenseSchema = z.object({
  title: z.string().min(2).max(80),
  amount: z.coerce.number().positive(),
  paidBy: z.string().min(1),
  participants: z.array(z.string().min(1)).min(1),
  date: z.string().min(1)
});
