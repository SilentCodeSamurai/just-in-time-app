import { CategoryService } from "@/services/category/service";
import { queryOptions } from "@tanstack/react-query";

export const categoryGetAllQuery = queryOptions({
	queryKey: ["category", "all"],
	queryFn: CategoryService.getAll,
	staleTime: Infinity,
});

