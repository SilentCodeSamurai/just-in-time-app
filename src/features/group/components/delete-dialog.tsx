import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { GroupAllItem } from "@/features/group/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

type GroupDeleteDialogProps = {
	group: GroupAllItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function GroupDeleteDialog({
	group,
	open,
	onOpenChange,
}: GroupDeleteDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	async function onDelete() {
		setIsDeleting(true);
		try {
			await db.groups.where({ id: group.id }).delete();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete group:", error);
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete {group.name}?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will delete the
						group.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="destructive"
						onClick={onDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
