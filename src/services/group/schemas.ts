import { z } from "zod";

export const GroupCreateInputSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	description: z.string().nullable(),
	color: z.string().optional(),
});

export const GroupUpdateInputSchema = z.object({
	id: z.string().min(1, { message: "Id is required" }),
	name: z.string().min(1, { message: "Name is required" }).optional(),
	description: z.string().optional(),
	color: z.string().optional(),
});

export const GroupDeleteInputSchema = z.object({
	id: z.string().min(1, { message: "Id is required" }),
});
