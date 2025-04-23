import { TodoFilters, useTodoFilter } from "@/features/todo/components/filters";
import { AnimatedGrid } from "@/components/animated-grid";
import { DashboardContent } from "@/components/dashboard-content";
import { DashboardHeader } from "@/components/dashboard-header";
import { TodoCard } from "@/features/todo/components/card";
import { TodoCreateForm } from "@/features/todo/components/create-form";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { zodValidator } from "@tanstack/zod-adapter";
import { db } from "@/lib/db";
import { TodoAllItem } from "@/features/todo/types";
import { TodoSearchSchema } from "@/features/todo/schemas";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/todo")({
	validateSearch: zodValidator(TodoSearchSchema),
	component: RouteComponent,
});

function RouteComponent() {
	const [createFormOpen, setCreateFormOpen] = useState(false);

	const todos = useLiveQuery(async () => {
		const todos = await db.todos.toArray();
		const todosWithRelations: TodoAllItem[] = await Promise.all(
			todos.map(async (todo) => {
				const [category, group, subtasks] = await Promise.all([
					todo.categoryId ? db.categories.get(todo.categoryId) : null,
					todo.groupId ? db.groups.get(todo.groupId) : null,
					db.subtasks.where("todoId").equals(todo.id).toArray(),
				]);

				return {
					...todo,
					category: category
						? {
								id: category.id,
								name: category.name,
								color: category.color,
							}
						: null,
					group: group
						? {
								id: group.id,
								name: group.name,
								color: group.color,
							}
						: null,
					subtasks: subtasks.map((subtask) => ({
						id: subtask.id,
						title: subtask.title,
						completed: subtask.completed,
					})),
				};
			})
		);
		return todosWithRelations;
	});

	const todoFilter = useTodoFilter();
	const filteredTodos = todoFilter(todos || []);

	return (
		<>
			<DashboardHeader>
				<h1 className="font-bold text-xl">Todos</h1>
				<TodoCreateForm
					open={createFormOpen}
					onOpenChange={setCreateFormOpen}
				/>
				<TodoFilters />
			</DashboardHeader>

			<DashboardContent>
				<AnimatedGrid
					objects={filteredTodos}
					render={(todo) => <TodoCard todo={todo} />}
				/>
			</DashboardContent>
		</>
	);
}
