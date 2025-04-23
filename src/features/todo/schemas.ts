import { z } from "zod";

// Priority
export const PrioritySchema = z.number().min(1).max(4);
export type Priority = z.infer<typeof PrioritySchema>;

// Todo
export const TodoGetAllInputSchema = z.object({
	filter: z
		.object({
			groupId: z.string().nullable().optional(),
			categoryId: z.string().nullable().optional(),
			tagIds: z.array(z.string()).optional(),
			priority: PrioritySchema.optional(),
			completed: z.boolean().optional(),
			dueDate: z.string().optional(),
		})
		.optional(),
	paging: z
		.object({
			limit: z.number().optional(),
			offset: z.number().optional(),
		})
		.optional(),
	sorting: z
		.object({
			sortBy: z.enum(["createdAt", "dueDate", "priority"]).optional(),
			sortOrder: z.enum(["asc", "desc"]).optional(),
		})
		.optional(),
});

export const TodoCreateInputSchema = z.object({
	title: z.string().min(1, { message: "Title is required" }),
	description: z.string().nullable(),
	priority: PrioritySchema.optional().default(2),
	dueDate: z.date().nullable(),
	groupId: z.string().nullable(),
	categoryId: z.string().nullable(),
	tagIds: z.array(z.string()).nullable(),
	subtasks: z
		.array(
			z.object({
				title: z.string(),
				completed: z.boolean().optional().default(false),
			})
		)
		.nullable(),
});

export const TodoUpdateInputSchema = z.object({
	id: z.string().min(1, { message: "Id is required" }),
	completed: z.boolean().optional(),
	title: z.string().min(1, { message: "Title is required" }).optional(),
	description: z.string().nullable().optional(),
	priority: PrioritySchema.optional(),
	dueDate: z.date().nullable().optional(),
	categoryId: z.string().nullable().optional(),
	groupId: z.string().nullable().optional(),
	tagIds: z.array(z.string()).optional(),
});

export const TodoDeleteInputSchema = z.object({
	id: z.string().min(1, { message: "Id is required" }),
});

// Subtask
export const SubtaskCreateInputSchema = z.object({
	todoId: z.string(),
	title: z.string(),
	completed: z.boolean().optional().default(false),
});

export const SubtaskUpdateInputSchema = z.object({
	id: z.string(),
	title: z.string(),
	completed: z.boolean().optional(),
});

export const SubtaskChangeStatusInputSchema = z.object({
	id: z.string(),
	completed: z.boolean(),
});

// Todo FindOptions
export const TodoFindOptionsFilterSchema = z.object({
	groupId: z.string().nullable().optional(),
	categoryId: z.string().nullable().optional(),
	// tagIds: z.array(z.string()).optional(),
	priority: z.number().min(1).max(4).optional(),
	completed: z.boolean().optional(),
	dueDate: z.string({ description: "ISO Date" }).date().optional(),
	exactDate: z.boolean().optional(),
});

export const TodoFindOptionsPagingSchema = z.object({
	limit: z.number().optional(),
	offset: z.number().optional(),
});

export const TodoFindOptionsSortingSchema = z.object({
	sortBy: z.enum(["createdAt", "dueDate", "priority"]).optional(),
	sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const TodoSearchSchema = z.object({
	filter: TodoFindOptionsFilterSchema.optional(),
	paging: TodoFindOptionsPagingSchema.optional(),
	sorting: TodoFindOptionsSortingSchema.optional(),
});
