import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { CategoryAllItem } from "@/features/category/types";
import { db } from "@/lib/db";
import { useState } from "react";

type CategoryDeleteDialogProps = {
	category: CategoryAllItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function CategoryDeleteDialog({
	category,
	open,
	onOpenChange,
}: CategoryDeleteDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	async function onDelete() {
		setIsDeleting(true);
		try {
			await db.categories.where({ id: category.id }).delete();
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete category:", error);
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete {category.name}?</DialogTitle>
					<DialogDescription>
						This action cannot be undone. This will delete the item.
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
