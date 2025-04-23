import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { TodoAllItem } from "@/features/todo/types";
import { db } from "@/lib/db";
import { useState } from "react";

type TodoDeleteDialogProps = {
	todo: TodoAllItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function TodoDeleteDialog({
	todo,
	open,
	onOpenChange,
}: TodoDeleteDialogProps) {
	const [isDeleting, setIsDeleting] = useState(false);

	async function onDelete() {
		setIsDeleting(true);
		try {
			await Promise.all([
				db.todos.where({ id: todo.id }).delete(),
				db.subtasks.where("todoId").equals(todo.id).delete(),
			]);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to delete todo:", error);
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete {todo.title}?</DialogTitle>
					<DialogDescription>
						This action cannot be undone.
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
