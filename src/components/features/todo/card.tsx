"use client";

import { BookmarkCheck, Clock, EllipsisVertical, Pencil, TimerOff, Trash } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { differenceInHours, format, formatDistanceToNow } from "date-fns";
import { motion, useAnimation } from "motion/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorMarker } from "@/components/ui/color-marker";
import { PriorityBadge } from "./priority-badges";
import { TodoAllItem } from "@/types/todo";
import { TodoDeleteDialog } from "./delete-dialog";
import { TodoUpdateForm } from "./update-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TodoService } from "@/services/todo/service";

const WARNING_COLORS_MAPPING: Map<number, string> = new Map([
	[0, "text-red-600"],
	[1, "text-orange-400"],
	[2, "text-amber-400"],
	[3, "text-yellow-400"],
	[5, "text-lime-400"],
	[7, "text-green-400"],
]);

export function getWarningColor(dueDate: Date, now: Date) {
	const diffDays = differenceInHours(dueDate, now) / 24;
	for (const [key, value] of WARNING_COLORS_MAPPING.entries()) {
		if (diffDays <= key) return value;
	}
	return WARNING_COLORS_MAPPING.get(7);
}

export const priorityClasses: Record<number, string> = {
	1: "from-priority-1 bg-priority-1",
	2: "from-priority-2 bg-priority-2",
	3: "from-priority-3 bg-priority-3",
	4: "from-priority-4 bg-priority-4",
};

const getDueTime = (dueDate: Date) => {
	return new Date(dueDate.setHours(23, 59, 59, 999));
};

export function TodoCard({ todo }: { todo: TodoAllItem }) {
	const now = useRef(new Date());
	const queryClient = useQueryClient();
	const controls = useAnimation();
	const diffHours = todo.dueDate ? differenceInHours(getDueTime(todo.dueDate), now.current) : Infinity;
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [updateFormOpen, setUpdateFormOpen] = useState(false);

	const animateUpdate = () => {
		controls.start({
			transform: ["scale(1)", "scale(1.01)", "scale(1)"],
			transition: { duration: 0.2 },
		});
	};

	const updateMutation = useMutation({
		mutationFn: TodoService.update,
		onSuccess: (updatedTodo) => {
			queryClient.setQueryData(["todo", "all"], (old: TodoAllItem[]) => {
				return old.map((t) => (t.id === todo.id ? { ...t, ...updatedTodo } : t));
			});
			toast.success(`Todo ${updatedTodo?.title} ${updatedTodo?.completed ? "completed" : "uncompleted"}`);
			animateUpdate();
		},
		onError: (error) => {
			toast.error(`Failed to update todo: ${error}`);
		},
	});

	const handleChangeStatus = (completed: boolean) => {
		updateMutation.mutate({
			id: todo.id,
			completed,
		});
	};

	return (
		<>
			<TodoDeleteDialog todo={todo} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
			<TodoUpdateForm
				todo={todo}
				onSuccess={animateUpdate}
				open={updateFormOpen}
				onOpenChange={setUpdateFormOpen}
			/>
			<motion.div animate={controls}>
				<Card variant="item" className={`relative w-full gap-1 pl-2 lg:pl-3`}>
					{todo.completed && (
						<div className="top-0 right-0 bottom-0 left-0 z-10 absolute bg-neutral-900 opacity-60 rounded-lg pointer-events-none" />
					)}
					<ColorMarker color={todo.category?.color || "gray"} />
					<CardHeader>
						<div className="flex flex-row justify-between items-start gap-2">
							<div className="flex flex-row items-center gap-2">
								<Checkbox
									className="size-5"
									checked={todo.completed}
									onCheckedChange={handleChangeStatus}
								/>
								<PriorityBadge priority={todo.priority} />

								{!todo.completed
									? todo.dueDate && (
											<div className="flex flex-row items-center gap-2">
												{diffHours <= 0 ? (
													<div className="relative">
														<TimerOff className="size-6 text-red-600 dark:text-red-500" />
														<TimerOff className="absolute inset-0 opacity-50 dark:opacity-70 rounded-full size-6 text-red-600 animate-ping" />
													</div>
												) : (
													<Clock
														className={cn(
															"size-5 lg:size-6",
															getWarningColor(todo.dueDate, now.current)
														)}
													/>
												)}
												<p
													suppressHydrationWarning
													className={`text-xs ${!todo.completed ? getWarningColor(todo.dueDate, now.current) : ""}`}
												>
													{formatDistanceToNow(todo.dueDate, { addSuffix: true })}
												</p>
											</div>
										)
									: todo.completedAt && (
											<div className="flex flex-row items-center gap-2">
												<div className="relative w-6 lg:w-8">
													<BookmarkCheck className="top-[-23px] lg:top-[-24px] z-20 absolute opacity-50 size-6 lg:size-8 text-green-600" />
												</div>
												<p className="text-muted-foreground text-xs" suppressHydrationWarning>
													{format(todo.completedAt, "dd/MM/yyyy HH:mm")}
												</p>
											</div>
										)}
								{/* <div className="flex flex-row items-center gap-2">
									<p suppressHydrationWarning className="text-gray-500 text-sm">
										{format(todo.createdAt, "dd/MM/yyyy")}
									</p>
								</div> */}
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button type="button" variant="ghost" className="size-8">
										<EllipsisVertical className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem
										onClick={() => setUpdateFormOpen(true)}
										disabled={todo.completed || updateMutation.isPending}
									>
										<Pencil className="size-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} variant="destructive">
										<Trash className="size-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>

						<CardDescription>
							<div className="flex flex-row items-center gap-2">
								{todo.category && (
									<div className="flex flex-row items-center gap-2">
										<div
											className="rounded-full w-2 h-2"
											style={{ backgroundColor: todo.category.color || "gray" }}
										></div>
										<p>{todo.category?.name}</p>
									</div>
								)}
								{todo.group && (
									<div className="flex flex-row items-center gap-2">
										<div
											className="rounded-full w-2 h-2"
											style={{ backgroundColor: todo.group.color || "gray" }}
										></div>
										<p>{todo.group?.name}</p>
									</div>
								)}
							</div>
						</CardDescription>
						<CardTitle className={`text-sm lg:text-xl ${todo.completed ? "line-through opacity-50" : ""}`}>
							{todo.title}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className={`text-sm ${todo.completed ? "line-through opacity-50" : ""}`}>
							{todo.description}
						</p>
					</CardContent>
				</Card>
			</motion.div>
		</>
	);
}
