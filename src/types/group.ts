export type GroupAllItem = {
    id: string;
	name: string;
    description: string | null;
    color: string | null;
    createdAt: Date;
    updatedAt: Date;
	_count: { todos: number }
}

export type GroupListItem = {
    id: string;
    name: string;
    color: string | null;
}
