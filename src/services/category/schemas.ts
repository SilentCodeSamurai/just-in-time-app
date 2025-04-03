import { z } from "zod";

export const CategoryCreateInputSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	description: z.string().nullable(),
	color: z.string(),
});

export const CategoryUpdateInputSchema = z.object({
	id: z.string(),
	name: z.string().min(1, { message: "Name is required" }).optional(),
	description: z.string().nullable().optional(),
	color: z.string().optional(),
});

export const CategoryDeleteInputSchema = z.object({
	id: z.string().min(1, { message: "Id is required" }),
});
