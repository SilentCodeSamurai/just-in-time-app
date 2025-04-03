export type TodoAllItem = {
	id: string;
	title: string;
	description: string | null;
	completed: boolean;
	completedAt: Date | null;
	createdAt: Date;
	dueDate: Date | null;
	priority: number;
	groupId: string | null;
	categoryId: string | null;
	category: {
		id: string;
		name: string;
		color: string | null;
	} | null;
	group: {
		id: string;
		name: string;
		color: string | null;
	} | null;
	subtasks: {
		id: string;
		title: string;
		completed: boolean;
	}[];
};
