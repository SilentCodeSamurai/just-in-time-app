import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { TodoAllItem } from "@/types/todo";
import { toast } from "sonner";
import { TodoService } from "@/services/todo/service";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

type TodoDeleteDialogProps = {
	todo: TodoAllItem;
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function TodoDeleteDialog({ todo, open, onOpenChange }: TodoDeleteDialogProps) {
	const queryClient = useQueryClient();
	const deleteMutation = useMutation({
		mutationFn: TodoService.delete,
		onSuccess: () => {
			queryClient.setQueryData(["todo", "all"], (old: TodoAllItem[]) => {
				return old.filter((t) => t.id !== todo.id);
			});
			toast.success("Todo deleted");
		},
		onError: (error) => {
			toast.error(`Failed to delete todo: ${error}`);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Delete {todo.title}?</DialogTitle>
					<DialogDescription>This action cannot be undone.</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						variant="destructive"
						onClick={() => deleteMutation.mutate(todo.id)}
						disabled={deleteMutation.isPending}
					>
						Delete
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
