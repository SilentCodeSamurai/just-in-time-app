import { GroupCreateInputDTO, GroupUpdateInputDTO } from "./dto";
import { JustInTimeDB, Group } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';

const db = new JustInTimeDB();

export class GroupService {
	static async create(input: GroupCreateInputDTO) {
		const group: Group = {
			id: uuidv4(),
			...input,
			color: input.color || '#000000',
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await db.groups.add(group);
		return this.getById(group.id);
	}

	static async getById(id: string) {
		const group = await db.groups
			.where({ id })
			.first();

		if (!group) return null;

		const count = await db.todos
			.where('groupId')
			.equals(id)
			.count();

		return {
			...group,
			_count: { todos: count }
		};
	}

	static async getAll() {
		const groups = await db.groups
			.reverse()
			.toArray();

		// Добавляем количество todos для каждой группы
		const groupsWithCount = await Promise.all(
			groups.map(async (group) => {
				const count = await db.todos
					.where('groupId')
					.equals(group.id)
					.count();
				return {
					...group,
					_count: { todos: count }
				};
			})
		);

		return groupsWithCount;
	}

	static async getList() {
		const groups = await db.groups
			.toArray();
		return groups.map(({ id, name, color }) => ({ id, name, color }));
	}

	static async update(input: GroupUpdateInputDTO) {
		const { id, ...updateData } = input;
		
		await db.groups
			.where({ id })
			.modify({
				...updateData,
				updatedAt: new Date()
			});

		const updatedGroup = await this.getById(id);
		if (!updatedGroup) throw new Error("Group not found");

		const count = await db.todos
			.where('groupId')
			.equals(id)
			.count();
		return {
			...updatedGroup,
			_count: { todos: count }
		};
	}

	static async delete(id: string) {
		await db.groups
			.where({ id })
			.delete();
		return true;
	}
}
