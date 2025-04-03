import { CategoryCreateInputSchema, CategoryDeleteInputSchema, CategoryUpdateInputSchema } from "./schemas";

import { z } from "zod";

export type CategoryCreateInputDTO = z.infer<typeof CategoryCreateInputSchema>;
export type CategoryUpdateInputDTO = z.infer<typeof CategoryUpdateInputSchema>;
export type CategoryDeleteInputDTO = z.infer<typeof CategoryDeleteInputSchema>;

