"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { CategoryAllItem } from "@/types/category";
import { GroupAllItem } from "@/types/group";
import { Input } from "@/components/ui/input";
import { PriorityBadge } from "./priority-badges";
import { Textarea } from "@/components/ui/textarea";
import { TodoAllItem } from "@/types/todo";
import { TodoUpdateInputSchema } from "@/services/todo/schemas";
import { categoryGetAllQuery } from "@/queries/category";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { groupGetAllQuery } from "@/queries/group";
import { toast } from "sonner";
import { TodoService } from "@/services/todo/service";
import { useForm } from "react-hook-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type TodoUpdateFormData = z.infer<typeof TodoUpdateInputSchema>;

const getFormValues = (todo: TodoAllItem): TodoUpdateFormData => {
	return {
		id: todo.id,
		completed: undefined,
		title: todo.title,
		description: todo.description || undefined,
		priority: todo.priority,
		dueDate: todo.dueDate || undefined,
		categoryId: todo.category?.id || undefined,
		groupId: todo.group?.id || undefined,
		tagIds: undefined,
	};
};

type TodoUpdateFormProps = {
	todo: TodoAllItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function TodoUpdateForm({ todo, onSuccess, open, onOpenChange }: TodoUpdateFormProps) {
	const queryClient = useQueryClient();

	const categoryListResult = useSuspenseQuery(categoryGetAllQuery);
	const groupListResult = useSuspenseQuery(groupGetAllQuery);

	const categoryList = categoryListResult.data;
	const groupList = groupListResult.data;

	const form = useForm<TodoUpdateFormData>({
		resolver: zodResolver(TodoUpdateInputSchema),
		defaultValues: getFormValues(todo),
	});

	const updateMutation = useMutation({
		mutationFn: TodoService.update,
		onSuccess: (updatedTodo) => {
			queryClient.setQueryData(["todo", "all"], (old: TodoAllItem[]) => {
				return old.map((t) => (t.id === todo.id ? { ...updatedTodo } : t));
			});
			const prevTodoCategoryId = todo.category?.id;
			const prevTodoGroupId = todo.group?.id;

			if (updatedTodo.categoryId !== null) {
				if (updatedTodo.categoryId !== prevTodoCategoryId) {
					queryClient.setQueryData(["category", "all"], (old: CategoryAllItem[]) => {
						return old.map((c) =>
							c.id === updatedTodo.categoryId ? { ...c, _count: { todos: c._count.todos + 1 } } : c
						);
					});
				}
			} else {
				if (prevTodoCategoryId) {
					queryClient.setQueryData(["category", "all"], (old: CategoryAllItem[]) => {
						return old.map((c) =>
							c.id === prevTodoCategoryId ? { ...c, _count: { todos: c._count.todos - 1 } } : c
						);
					});
				}
			}
			if (updatedTodo.groupId !== null) {
				if (updatedTodo.groupId !== prevTodoGroupId) {
					queryClient.setQueryData(["group", "all"], (old: GroupAllItem[]) => {
						return old.map((g) =>
							g.id === updatedTodo.groupId ? { ...g, _count: { todos: g._count.todos + 1 } } : g
						);
					});
				}
			} else {
				if (prevTodoGroupId) {
					queryClient.setQueryData(["group", "all"], (old: GroupAllItem[]) => {
						return old.map((g) =>
							g.id === prevTodoGroupId ? { ...g, _count: { todos: g._count.todos - 1 } } : g
						);
					});
				}
			}

			toast.success("Todo updated");
			form.reset(getFormValues(updatedTodo));
			onSuccess?.();
			onOpenChange(false);
		},
		onError: () => {
			toast.error("Failed to update todo");
		},
	});

	function onSubmit(values: TodoUpdateFormData) {
		TodoService.update(values);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				onOpenChange(value);
				form.reset(getFormValues(todo));
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update todo</DialogTitle>
					<DialogDescription>Update the todo details.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<Input placeholder="Todo title" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											value={field.value || ""}
											onChange={(e) => field.onChange(e.target.value)}
											placeholder="Todo description"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="priority"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Priority</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(Number(value))}
										defaultValue={field.value?.toString() || undefined}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select priority" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value={"1"}>
												<PriorityBadge priority={1} />
											</SelectItem>
											<SelectItem value={"2"}>
												<PriorityBadge priority={2} />
											</SelectItem>
											<SelectItem value={"3"}>
												<PriorityBadge priority={3} />
											</SelectItem>
											<SelectItem value={"4"}>
												<PriorityBadge priority={4} />
											</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="categoryId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(value === "none" ? null : value)}
										defaultValue={field.value || "none"}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select category" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="none">Not specified</SelectItem>
											{categoryList.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													<div className="flex items-center gap-2">
														<div
															className="rounded-full size-3"
															style={{ backgroundColor: category.color || "inherit" }}
														/>
														<span>{category.name}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="groupId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Group</FormLabel>
									<Select
										onValueChange={(value) => field.onChange(value === "none" ? null : value)}
										defaultValue={field.value || "none"}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select group" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="none">Not specified</SelectItem>
											{groupList.map((group) => (
												<SelectItem key={group.id} value={group.id}>
													<div className="flex items-center gap-2">
														<div
															className="rounded-full size-3"
															style={{ backgroundColor: group.color || "inherit" }}
														/>
														<span>{group.name}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="dueDate"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Due Date</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													className={cn(
														"w-full pl-3 text-left font-normal",
														!field.value && "text-muted-foreground"
													)}
												>
													{field.value ? (
														format(field.value as Date, "PPP")
													) : (
														<span>Pick a date</span>
													)}
													<CalendarIcon className="opacity-50 ml-auto w-4 h-4" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent className="p-0 w-auto">
											<Calendar
												mode="single"
												disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
												selected={field.value || undefined}
												onSelect={(date) => field.onChange(date || null)}
											/>
										</PopoverContent>
									</Popover>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="id"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input type="hidden" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter>
							<Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty}>
								Update
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
