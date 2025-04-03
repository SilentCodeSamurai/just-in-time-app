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
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { CategoryAllItem } from "@/types/category";
import { GroupAllItem } from "@/types/group";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { PriorityBadge } from "./priority-badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { TodoAllItem } from "@/types/todo";
import { TodoCreateInputSchema } from "@/services/todo/schemas";
import { TodoService } from "@/services/todo/service";
import { categoryGetAllQuery } from "@/queries/category";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { groupGetAllQuery } from "@/queries/group";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function TodoCreateForm() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const categoryListResult = useSuspenseQuery(categoryGetAllQuery);
	const groupListResult = useSuspenseQuery(groupGetAllQuery);

	const categoryList = categoryListResult.data;
	const groupList = groupListResult.data;

	const form = useForm<z.infer<typeof TodoCreateInputSchema>>({
		resolver: zodResolver(TodoCreateInputSchema),
		defaultValues: {
			title: "",
			description: null,
			priority: 2,
			dueDate: null,
			groupId: null,
			categoryId: null,
			tagIds: null,
			subtasks: null,
		},
	});

	const createMutation = useMutation({
		mutationFn: TodoService.create,
		onSuccess: (createdTodo) => {
			queryClient.setQueryData(["todo", "all"], (old: TodoAllItem[]) => [...old, createdTodo]);
			if (createdTodo.categoryId) {
				queryClient.setQueryData(["category", "all"], (old: CategoryAllItem[]) =>
					old.map((c) =>
						c.id === createdTodo.categoryId ? { ...c, _count: { todos: c._count.todos + 1 } } : c
					)
				);
			}
			if (createdTodo.groupId) {
				queryClient.setQueryData(["group", "all"], (old: GroupAllItem[]) =>
					old.map((g) => (g.id === createdTodo.groupId ? { ...g, _count: { todos: g._count.todos + 1 } } : g))
				);
			}
			toast.success("Todo created");
			form.reset();
			setOpen(false);
		},
		onError: (error) => {
			toast.error(`Failed to create todo: ${error}`);
		},
	});

	function onSubmit(values: z.infer<typeof TodoCreateInputSchema>) {
		createMutation.mutate(values);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				setOpen(value);
				if (!value) form.reset();
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Plus className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create todo</DialogTitle>
					<DialogDescription>Create a new todo.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title*</FormLabel>
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
										defaultValue={field.value.toString()}
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
										onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
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
										onValueChange={(value) => field.onChange(value === "none" ? undefined : value)}
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
						<DialogFooter>
							<Button type="submit" disabled={createMutation.isPending}>
								Create
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

export function CreateTodoFormSkeleton() {
	return (
		<div className="flex flex-col gap-2">
			<Skeleton className="w-[100px] h-[40px]" />
			<Skeleton className="w-[100px] h-[40px]" />
			<Skeleton className="w-[100px] h-[40px]" />
			<Skeleton className="w-[100px] h-[40px]" />
			<Skeleton className="w-[100px] h-[40px]" />
			<Skeleton className="w-[100px] h-[40px]" />
			{/* //TODO: fixme: Add the rest of the form */}
		</div>
	);
}
