import { RemoveUndefined } from "@/types/utils";
import { TodoAllItem } from "@/types/todo";
import { TodoSearch } from "@/routes/dashboard/todo";
import { isSameDay } from "date-fns";

type Filter = RemoveUndefined<TodoSearch["filter"]>;
type Sorting = RemoveUndefined<TodoSearch["sorting"]>;

export function filterTodo(todoAll: TodoAllItem[], filter: Filter) {
	const result = todoAll.filter((todo) => {
		const exactDate = filter.exactDate;
		for (const [filterKey, filterValue] of Object.entries(filter)) {
			const key = filterKey as keyof Filter;
			if (key === "exactDate") {
				continue;
			}
			if (key === "dueDate" && filterValue !== undefined && todo.dueDate !== null) {
				const dueDate = new Date(filterValue as string);
				if (exactDate) {
					if (!isSameDay(dueDate, todo.dueDate)) {
						return false;
					}
				} else {
					if (dueDate < todo.dueDate) {
						return false;
					}
				}
			} else if (filterValue !== undefined && todo[key] !== filterValue) {
				return false;
			}
		}
		return true;
	});

	return result;
}

export function sortTodo(todoAll: TodoAllItem[], sorting: Sorting) {
	const result = [...todoAll];
	const sortBy = sorting.sortBy;
	if (!sortBy) {
		return result;
	}

	result.sort((a, b) => {
		const aValue = a[sortBy];
		const bValue = b[sortBy];
		if (aValue && bValue) {
			return sorting.sortOrder === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
		} else if (aValue && !bValue) {
			return -1;
		} else if (!aValue && bValue) {
			return 1;
		}
		return 0;
	});

	return result;
}
