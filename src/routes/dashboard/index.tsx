import { DateRange, DayContent } from "react-day-picker";
import { createFileRoute } from "@tanstack/react-router";
import { isSameDay, isWithinInterval } from "date-fns";
import { useMemo, useState } from "react";

import { AnimatedGrid } from "@/components/animated-grid";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { DashboardContent } from "@/components/dashboard-content";
import { DashboardHeader } from "@/components/dashboard-header";
import { TodoCard } from "@/features/todo/components/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { filterTodo, sortTodo } from "@/features/todo/utils";

export const Route = createFileRoute("/dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [dateFilter, setDateFilter] = useState<DateRange | null>(null);

	const todos = useLiveQuery(async () => {
		const todos = await db.todos.toArray();

		const todosWithRelations = await Promise.all(
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

	const activeTodos = useMemo(
		() => filterTodo(todos || [], { completed: false }),
		[todos]
	);
	const dateTodos = useMemo(() => {
		if (dateFilter) {
			return activeTodos.filter((todo) => {
				const todoDate = todo.dueDate ? new Date(todo.dueDate) : null;
				if (!todoDate) return false;
				if (dateFilter.from && !dateFilter.to) {
					return isSameDay(todoDate, dateFilter.from);
				} else if (!dateFilter.from && dateFilter.to) {
					return isSameDay(todoDate, dateFilter.to);
				} else if (dateFilter.from && dateFilter.to) {
					if (isSameDay(dateFilter.from, dateFilter.to)) {
						return isSameDay(todoDate, dateFilter.from);
					} else {
						return isWithinInterval(todoDate, {
							start: dateFilter.from,
							end: dateFilter.to,
						});
					}
				}
				return false;
			});
		}
		return activeTodos;
	}, [activeTodos, dateFilter]);

	const urgentTodos = useMemo(
		() =>
			sortTodo(
				sortTodo(dateTodos, {
					sortBy: "priority",
					sortOrder: "desc",
				}),
				{
					sortBy: "dueDate",
					sortOrder: "asc",
				}
			),
		[dateTodos]
	);

	return (
		<>
			<DashboardHeader>
				<h1 className="font-bold text-xl">Dashboard</h1>
				<div className="size-9" />
			</DashboardHeader>
			<DashboardContent>
				<Card className="w-full max-w-[600px]">
					<Calendar
						mode="range"
						fixedWeeks
						className="flex w-full h-full"
						classNames={{
							months: "flex w-full flex-col flex-row lg:space-y-4 space-x-0 space-y-2 flex-1",
							month: "space-y-4 w-full flex flex-col",
							table: "w-full h-full border-collapse space-y-5",
							head_row: "",
							row: "w-full",
							day: cn(
								buttonVariants({ variant: "ghost" }),
								"size-10 lg:size-20 p-0 font-normal aria-selected:opacity-100 lg:text-xl"
							),
						}}
						selected={dateFilter || undefined}
						onSelect={(date) => setDateFilter(date || null)}
						components={{
							DayContent: (props) => {
								const dateTodos = activeTodos.filter(
									(todo) =>
										todo.dueDate &&
										isSameDay(todo.dueDate, props.date)
								);
								const dateColorsSet = new Set<string>();
								for (const todo of dateTodos) {
									dateColorsSet.add(
										todo.category?.color || "#FFFFFF"
									);
								}
								return (
									<>
										<div className="relative flex justify-center items-center size-10 lg:size-20">
											<DayContent {...props} />
											<div className="top-0 left-0 absolute flex gap-[1px]">
												{Array.from(dateColorsSet).map(
													(color) => (
														<div
															className="rounded-full size-2"
															style={{
																backgroundColor:
																	color,
															}}
															key={color}
														/>
													)
												)}
											</div>
										</div>
									</>
								);
							},
						}}
					/>
				</Card>
				<AnimatedGrid
					objects={urgentTodos}
					render={(todo) => <TodoCard todo={todo} />}
				/>
			</DashboardContent>
		</>
	);
}
