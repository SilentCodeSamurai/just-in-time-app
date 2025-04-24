"use client";

import { CategoryAllItem } from "@/features/category/types";
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

import { Button } from "@/components/ui/button";
import { CategoryUpdateInputSchema } from "@/features/category/schemas";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { db } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";
import { removeUndefinedFields } from "@/lib/utils";
import { toast } from "sonner";

type CategoryUpdateFormData = z.infer<typeof CategoryUpdateInputSchema>;

const getFormValues = (category: CategoryAllItem): CategoryUpdateFormData => {
	return {
		id: category.id,
		name: category.name,
		description: category.description || undefined,
		color: category.color || undefined,
	};
};

type CategoryUpdateFormProps = {
	category: CategoryAllItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function CategoryUpdateForm({
	category,
	open,
	onOpenChange,
	onSuccess,
}: CategoryUpdateFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<z.infer<typeof CategoryUpdateInputSchema>>({
		resolver: zodResolver(CategoryUpdateInputSchema),
		defaultValues: getFormValues(category),
	});

	async function onSubmit(values: z.infer<typeof CategoryUpdateInputSchema>) {
		setIsSubmitting(true);
		try {
			await db.categories.update(values.id, {
				...removeUndefinedFields(values),
				updatedAt: new Date(),
			});
			onOpenChange(false);
			onSuccess?.();
			toast.success("Category updated successfully");
		} catch (error) {
			toast.error("Failed to update category", {
				description:
					error instanceof Error ? error.message : "Unknown error",
			});
			form.reset(getFormValues(category));
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				onOpenChange(value);
				form.reset();
			}}
		>
			<DialogContent className="p-0">
				<ScrollArea className="max-h-[90lvh] p-4">
					<DialogHeader className="mb-4">
						<DialogTitle>Update category</DialogTitle>
						<DialogDescription>
							Update the category details.
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												placeholder="Category name"
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
											<Input
												value={field.value || ""}
												onChange={(e) =>
													field.onChange(
														e.target.value
													)
												}
												placeholder="Category description"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="color"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Color</FormLabel>
										<FormControl>
											<ColorPicker
												value={field.value || ""}
												onChange={field.onChange}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button
									type="submit"
									disabled={
										isSubmitting || !form.formState.isDirty
									}
								>
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
