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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { TodoCreateInputSchema } from "@/features/todo/schemas";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PriorityBadge } from "./priority-badges";
import { db } from "@/lib/db";
import { Category } from "@/lib/db";
import { Group } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
type TodoCreateFormProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function TodoCreateForm({
	open,
	onOpenChange,
	onSuccess,
}: TodoCreateFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const categories = useLiveQuery(async () => {
		return await db.categories.toArray();
	});

	const groups = useLiveQuery(async () => {
		return await db.groups.toArray();
	});

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

	async function onSubmit(values: z.infer<typeof TodoCreateInputSchema>) {
		setIsSubmitting(true);
		try {
			const { subtasks, ...todoData } = values;
			const todoId = uuidv4();

			const todo = {
				id: todoId,
				...todoData,
				completed: false,
				completedAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			await db.todos.add(todo);

			if (subtasks?.length) {
				const subtasksToAdd = subtasks.map((subtask) => ({
					id: uuidv4(),
					...subtask,
					todoId,
					completed: false,
					completedAt: null,
					createdAt: new Date(),
					updatedAt: new Date(),
				}));
				await db.subtasks.bulkAdd(subtasksToAdd);
			}

			onOpenChange(false);
			form.reset();
			onSuccess?.();
			toast.success("Todo created successfully");
		} catch (error) {
			toast.error("Failed to create todo", {
				description:
					error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				onOpenChange(value);
				if (!value) form.reset();
			}}
		>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon">
					<Plus />
				</Button>
			</DialogTrigger>
			<DialogContent className="p-0">
				<ScrollArea className="max-h-[90lvh] p-4">
					<DialogHeader className="mb-4">
						<DialogTitle>Create todo</DialogTitle>
						<DialogDescription>
							Create a new todo.
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title*</FormLabel>
										<FormControl>
											<Input
												placeholder="Todo title"
												{...field}
											/>
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
												onChange={(e) =>
													field.onChange(
														e.target.value
													)
												}
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
											onValueChange={(value) =>
												field.onChange(Number(value))
											}
											defaultValue={field.value.toString()}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select priority" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value={"1"}>
													<PriorityBadge
														priority={1}
													/>
												</SelectItem>
												<SelectItem value={"2"}>
													<PriorityBadge
														priority={2}
													/>
												</SelectItem>
												<SelectItem value={"3"}>
													<PriorityBadge
														priority={3}
													/>
												</SelectItem>
												<SelectItem value={"4"}>
													<PriorityBadge
														priority={4}
													/>
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
											onValueChange={(value) =>
												field.onChange(
													value === "none"
														? undefined
														: value
												)
											}
											defaultValue={field.value || "none"}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="none">
													Not specified
												</SelectItem>
												{categories?.map(
													(category: Category) => (
														<SelectItem
															key={category.id}
															value={category.id}
														>
															<div className="flex items-center gap-2">
																<div
																	className="rounded-full size-3"
																	style={{
																		backgroundColor:
																			category.color ||
																			"inherit",
																	}}
																/>
																<span>
																	{
																		category.name
																	}
																</span>
															</div>
														</SelectItem>
													)
												)}
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
											onValueChange={(value) =>
												field.onChange(
													value === "none"
														? undefined
														: value
												)
											}
											defaultValue={field.value || "none"}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select group" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="none">
													Not specified
												</SelectItem>
												{groups?.map((group: Group) => (
													<SelectItem
														key={group.id}
														value={group.id}
													>
														<div className="flex items-center gap-2">
															<div
																className="rounded-full size-3"
																style={{
																	backgroundColor:
																		group.color ||
																		"inherit",
																}}
															/>
															<span>
																{group.name}
															</span>
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
															!field.value &&
																"text-muted-foreground"
														)}
													>
														{field.value ? (
															format(
																field.value as Date,
																"PPP"
															)
														) : (
															<span>
																Pick a date
															</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent
												className="w-auto p-0"
												align="start"
											>
												<Calendar
													mode="single"
													selected={
														field.value as Date
													}
													onSelect={field.onChange}
													disabled={(date) =>
														date <
														new Date(
															new Date().setHours(
																0,
																0,
																0,
																0
															)
														)
													}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Creating..." : "Create"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</ScrollArea>
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
