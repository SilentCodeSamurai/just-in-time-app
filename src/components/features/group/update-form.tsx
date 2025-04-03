"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GroupAllItem, GroupListItem } from "@/types/group";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { GroupUpdateInputSchema } from "@/services/group/schemas";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TodoAllItem } from "@/types/todo";
import { GroupService } from "@/services/group/service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type GroupUpdateFormData = z.infer<typeof GroupUpdateInputSchema>;

const getFormValues = (group: GroupAllItem): GroupUpdateFormData => {
	return {
		id: group.id,
		name: group.name,
		description: group.description,
		color: group.color,
	};
};

type GroupUpdateFormProps = {
	group: GroupAllItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSuccess?: () => void;
};

export function GroupUpdateForm({ group, onSuccess, open, onOpenChange }: GroupUpdateFormProps) {
	const queryClient = useQueryClient();
	const form = useForm<GroupUpdateFormData>({
		resolver: zodResolver(GroupUpdateInputSchema),
		defaultValues: getFormValues(group),
	});

	const updateMutation = useMutation({
		mutationFn: GroupService.update,
		onSuccess: (updatedGroup) => {
			queryClient.setQueryData(["group", "all"], (old: GroupAllItem[]) => {
				if (!old) return [updatedGroup];
				return old.map((c) => (c.id === group.id ? { ...updatedGroup } : c));
			});
			queryClient.setQueryData(["group", "list"], (old: GroupListItem[]) => {
				if (!old) return [updatedGroup];
				return old.map((c) => (c.id === group.id ? { ...updatedGroup } : c));
			});
			queryClient.setQueryData(["todo", "all"], (old: TodoAllItem[]) => {
				if (!old) return [updatedGroup];
				return old.map((t) => (t.group?.id === group.id ? { ...t, group: { ...updatedGroup } } : t));
			});
			toast.success("Group updated");
			form.reset(getFormValues(updatedGroup));
			onSuccess?.();
			onOpenChange(false);
		},
		onError: (error) => {
			toast.error(`Failed to update group: ${error}`);
		},
	});

	function onSubmit(values: z.infer<typeof GroupUpdateInputSchema>) {
		GroupService.update(values);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(value) => {
				onOpenChange(value);
				form.reset(getFormValues(group));
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update group</DialogTitle>
					<DialogDescription>Update the group details.</DialogDescription>
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
