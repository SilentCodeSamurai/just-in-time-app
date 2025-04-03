import { GroupCreateInputSchema, GroupDeleteInputSchema, GroupUpdateInputSchema } from "./schemas";

import { z } from "zod";

export type GroupCreateInputDTO = z.infer<typeof GroupCreateInputSchema>;
export type GroupUpdateInputDTO = z.infer<typeof GroupUpdateInputSchema>;
export type GroupDeleteInputDTO = z.infer<typeof GroupDeleteInputSchema>;
