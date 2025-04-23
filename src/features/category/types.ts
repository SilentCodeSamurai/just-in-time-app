export type CategoryAllItem = {
	id: string;
	name: string;
	description: string | null;
	color: string | null;
	createdAt: Date;
	updatedAt: Date;
	_count: {
		todos: number;
	};
};

export type CategoryListItem = {
	id: string;
	name: string;
};
