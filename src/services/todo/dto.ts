import {
	SubtaskChangeStatusInputSchema,
	SubtaskCreateInputSchema,
	SubtaskUpdateInputSchema,
	TodoCreateInputSchema,
	TodoDeleteInputSchema,
	TodoGetAllInputSchema,
	TodoUpdateInputSchema,
} from "./schemas";

import { z } from "zod";

// Todo
export type TodoGetAllInputDTO = z.infer<typeof TodoGetAllInputSchema>;
export type TodoCreateInputDTO = z.infer<typeof TodoCreateInputSchema>;
export type TodoUpdateInputDTO = z.infer<typeof TodoUpdateInputSchema>;
export type TodoDeleteInputDTO = z.infer<typeof TodoDeleteInputSchema>;


// Subtask
export type SubtaskCreateInputDTO = z.infer<typeof SubtaskCreateInputSchema>;
export type SubtaskUpdateInputDTO = z.infer<typeof SubtaskUpdateInputSchema>;
export type SubtaskChangeStatusInputDTO = z.infer<typeof SubtaskChangeStatusInputSchema>;
