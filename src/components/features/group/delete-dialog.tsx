import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { GroupAllItem, GroupListItem } from "@/types/group";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { GroupService } from "@/services/group/service";
import { toast } from "sonner";

type GroupDeleteDialogProps = {
	group: GroupAllItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function GroupDeleteDialog({ group, open, onOpenChange }: GroupDeleteDialogProps) {
	const queryClient = useQueryClient();

	const deleteMutation = useMutation({
		mutationFn: GroupService.delete,
		onSuccess: () => {
			queryClient.setQueryData(["group", "all"], (old: GroupAllItem[]) => {
				return old.filter((c) => c.id !== group.id);
			});
			queryClient.setQueryData(["group", "list"], (old: GroupListItem[]) => {
				return old.filter((c) => c.id !== group.id);
			});
			toast.success("Group deleted");
		},
		onError: (error) => {
			toast.error(`Failed to delete group: ${error}`);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete {group.name}?</DialogTitle>
					<DialogDescription>This action cannot be undone. This will delete the group.</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="destructive"
						onClick={() => deleteMutation.mutate(group.id)}
						disabled={deleteMutation.isPending}
					>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
