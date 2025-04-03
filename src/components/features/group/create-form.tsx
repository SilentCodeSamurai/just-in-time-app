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
import { GroupAllItem, GroupListItem } from "@/types/group";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { GroupCreateInputSchema } from "@/services/group/schemas";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { GroupService } from "@/services/group/service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function CreateGroupForm() {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();
	const form = useForm<z.infer<typeof GroupCreateInputSchema>>({
		resolver: zodResolver(GroupCreateInputSchema),
		defaultValues: {
			name: "",
			description: "",
			color: "#FFFFFF",
		},
	});

	const createMutation = useMutation({
		mutationFn: GroupService.create,
		onSuccess: (createdGroup) => {
			queryClient.setQueryData(["group", "all"], (old: GroupAllItem[]) => {
				if (!old) return [createdGroup];
				return [...old, createdGroup];
			});
			queryClient.setQueryData(["group", "list"], (old: GroupListItem[]) => {
				if (!old) return [createdGroup];
				return [...old, createdGroup];
			});
			toast.success("Group created");
			form.reset();
			setOpen(false);
		},
		onError: (error) => {
			toast.error(`Failed to create group: ${error}`);
		},
	});

	function onSubmit(values: z.infer<typeof GroupCreateInputSchema>) {
		GroupService.create(values);
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
					<DialogTitle>Create group</DialogTitle>
					<DialogDescription>Create a new group.</DialogDescription>
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
										<Input placeholder="Group name" {...field} />
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
