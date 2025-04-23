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

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { GroupCreateInputSchema } from "@/features/group/schemas";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { ScrollArea } from "@/components/ui/scroll-area";

type CreateGroupFormProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function CreateGroupForm({
	open,
	onOpenChange,
	onSuccess,
}: CreateGroupFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);

	const form = useForm<z.infer<typeof GroupCreateInputSchema>>({
		resolver: zodResolver(GroupCreateInputSchema),
		defaultValues: {
			name: "",
			description: "",
			color: "#000000",
		},
	});

	async function onSubmit(values: z.infer<typeof GroupCreateInputSchema>) {
		setIsSubmitting(true);
		try {
			const group = {
				id: uuidv4(),
				...values,
				color: values.color || "#000000",
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			await db.groups.add(group);
			onOpenChange(false);
			form.reset();
			onSuccess?.();
		} catch (error) {
			console.error("Failed to create group:", error);
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
						<DialogTitle>Create group</DialogTitle>
						<DialogDescription>
							Create a new group.
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
