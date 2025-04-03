import { TodoService } from "@/services/todo/service";

import { queryOptions } from "@tanstack/react-query";

export const todoGetAllQuery = queryOptions({
	queryKey: ["todo", "all"],
	queryFn: TodoService.getAll,
	staleTime: Infinity,
});
