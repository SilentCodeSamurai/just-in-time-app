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
import { GroupAllItem } from "@/features/group/types";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { GroupUpdateInputSchema } from "@/features/group/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { db } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";

type GroupUpdateFormData = z.infer<typeof GroupUpdateInputSchema>;

const getFormValues = (group: GroupAllItem): GroupUpdateFormData => {
	return {
		id: group.id,
		name: group.name,
		description: group.description || "",
		color: group.color || "#000000",
	};
};

type GroupUpdateFormProps = {
	group: GroupAllItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function GroupUpdateForm({
	group,
	onSuccess,
	open,
	onOpenChange,
}: GroupUpdateFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<z.infer<typeof GroupUpdateInputSchema>>({
		resolver: zodResolver(GroupUpdateInputSchema),
		defaultValues: getFormValues(group),
	});

	async function onSubmit(values: z.infer<typeof GroupUpdateInputSchema>) {
		setIsSubmitting(true);
		try {
			const group = await db.groups.get(values.id);
			if (!group) {
				throw new Error("Group not found");
			}
			const { id, ...updateData } = values;
			await db.groups.where({ id }).modify({
				...group,
				...updateData,
				updatedAt: new Date(),
			});
			onOpenChange(false);
			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("Failed to update group:", error);
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
						<DialogTitle>Update group</DialogTitle>
						<DialogDescription>
							Update the group details.
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
												placeholder="Group name"
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
												placeholder="Group description"
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
