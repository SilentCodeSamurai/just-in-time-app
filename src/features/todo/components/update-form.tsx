"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
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
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PriorityBadge } from "./priority-badges";
import { Textarea } from "@/components/ui/textarea";
import { TodoAllItem } from "@/features/todo/types";
import { TodoUpdateInputSchema } from "@/features/todo/schemas";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { useLiveQuery } from "dexie-react-hooks";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function TodoUpdateForm({
	todo,
	onSuccess,
	open,
	onOpenChange,
}: TodoUpdateFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const categories = useLiveQuery(async () => {
		return await db.categories.toArray();
	});

	const groups = useLiveQuery(async () => {
		return await db.groups.toArray();
	});

	const form = useForm<z.infer<typeof TodoUpdateInputSchema>>({
		resolver: zodResolver(TodoUpdateInputSchema),
		defaultValues: getFormValues(todo),
	});

	async function onSubmit(values: z.infer<typeof TodoUpdateInputSchema>) {
		setIsSubmitting(true);
		try {
			const todo = await db.todos.get(values.id);
			if (!todo) {
				throw new Error("Todo not found");
			}
			await db.todos.where({ id: values.id }).modify({
				...todo,
				...values,
				completedAt: values.completed ? new Date() : null,
				updatedAt: new Date(),
			});
			onOpenChange(false);
			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("Failed to update todo:", error);
		} finally {
			setIsSubmitting(false);
		}
	}

	if (!categories || !groups) {
		return null;
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				onOpenChange(value);
				form.reset(getFormValues(todo));
			}}
		>
			<DialogContent className="p-0">
				<ScrollArea className="max-h-[90lvh] p-4">
					<DialogHeader className="mb-4">
						<DialogTitle>Update todo</DialogTitle>
						<DialogDescription>
							Update the todo details.
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
										<FormLabel>Title</FormLabel>
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
											defaultValue={
												field.value?.toString() ||
												undefined
											}
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
														? null
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
												{categories.map((category) => (
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
																{category.name}
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
								name="groupId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Group</FormLabel>
										<Select
											onValueChange={(value) =>
												field.onChange(
													value === "none"
														? null
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
												{groups.map((group) => (
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
									{isSubmitting ? "Updating..." : "Update"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
