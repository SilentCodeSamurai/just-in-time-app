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
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { CategoryCreateInputSchema } from "@/services/category/schemas";
import { CategoryService } from "@/services/category/service";
import { ColorPicker } from "@/components/ui/color-picker";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function CreateCategoryForm() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const createMutation = useMutation({
		mutationFn: CategoryService.create,
		onSuccess: (createdCategory) => {
			console.log("Category create mutation success", createdCategory);
			queryClient.invalidateQueries({ queryKey: ["category", "all"] });
			toast.success("Category created");
			form.reset();
			setOpen(false);
		},
		onError: (error) => {
			toast.error(`Failed to create category: ${error}`);
		},
	});

	const form = useForm<z.infer<typeof CategoryCreateInputSchema>>({
		resolver: zodResolver(CategoryCreateInputSchema),
		defaultValues: {
			name: "",
			description: "",
			color: "#FFFFFF",
		},
	});

	function onSubmit(values: z.infer<typeof CategoryCreateInputSchema>) {
		createMutation.mutate(values);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				setOpen(value);
				if (!value) {
					form.reset();
				}
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" size="icon">
					<Plus className="size-4" />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create category</DialogTitle>
					<DialogDescription>Create a new category.</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Category name" {...field} />
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
											onChange={(e) => field.onChange(e.target.value)}
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
										<ColorPicker value={field.value || ""} onChange={field.onChange} />
									</FormControl>
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
