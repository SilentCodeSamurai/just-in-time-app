import { GroupService } from "@/services/group/service";

import { queryOptions } from "@tanstack/react-query";

export const groupGetAllQuery = queryOptions({
	queryKey: ["group", "all"],
	queryFn: GroupService.getAll,
	staleTime: Infinity,
});

