import { JustInTimeDB, Subtask, Todo } from "@/lib/db";
import {
	SubtaskChangeStatusInputDTO,
	SubtaskCreateInputDTO,
	SubtaskUpdateInputDTO,
	TodoCreateInputDTO,
	TodoUpdateInputDTO,
} from "./dto";

import { v4 as uuidv4 } from 'uuid';

const db = new JustInTimeDB();

export class TodoService {
	static async create(input: TodoCreateInputDTO) {
		const { subtasks, ...todoData } = input;
		const todoId = uuidv4();

		const todo: Todo = {
			id: todoId,
			...todoData,
			completed: false,
			completedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await db.todos.add(todo);

		// Создаем подзадачи
		if (subtasks?.length) {
			const subtasksToAdd = subtasks.map(subtask => ({
				id: uuidv4(),
				...subtask,
				todoId,
				completed: false,
				completedAt: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			}));
			await db.subtasks.bulkAdd(subtasksToAdd);
		}

		const createdTodo = await TodoService.getById(todoId);
		if (!createdTodo) throw new Error("Todo not found");
		return createdTodo;
	}

	static async getAll() {
		const todos = await db.todos
			.reverse()
			.toArray();

		const todosWithRelations = await Promise.all(
			todos.map(async (todo) => {
				const [category, group, subtasks] = await Promise.all([
					todo.categoryId ? db.categories.get(todo.categoryId) : null,
					todo.groupId ? db.groups.get(todo.groupId) : null,
					db.subtasks
						.where('todoId')
						.equals(todo.id)
						.toArray()
				]);

				return {
					...todo,
					category,
					group,
					subtasks
				};
			})
		);

		return todosWithRelations;
	}

	static async getById(id: string) {
		const todo = await db.todos
			.where({ id })
			.first();

		if (!todo) return null;

		const [category, group, subtasks] = await Promise.all([
			todo.categoryId ? db.categories.get(todo.categoryId) : null,
			todo.groupId ? db.groups.get(todo.groupId) : null,
			db.subtasks
				.where('todoId')
				.equals(todo.id)
				.toArray()
		]);

		return {
			...todo,
			category,
			group,
			subtasks
		};
	}

	static async update(input: TodoUpdateInputDTO) {
		const { id, ...updateData } = input;

		// Обновляем todo
		await db.todos
			.where({ id })
			.modify({
				...updateData,
				completedAt: updateData.completed ? new Date() : null,
				updatedAt: new Date()
			});

		const updatedTodo = await TodoService.getById(id);
		if (!updatedTodo) throw new Error("Todo not found");
		return updatedTodo;
	}

	static async delete(id: string) {
		// Удаляем todo и все связанные данные
		await Promise.all([
			db.todos.where({ id }).delete(),
			db.subtasks.where('todoId').equals(id).delete()
		]);
		return true;
	}

	// Subtask methods
	static async createSubtask(input: SubtaskCreateInputDTO) {
		const subtask: Subtask = {
			id: uuidv4(),
			...input,
			completed: false,
			completedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await db.subtasks.add(subtask);
		return subtask;
	}

	static async updateSubtask(input: SubtaskUpdateInputDTO) {
		const { id, ...updateData } = input;
		
		await db.subtasks
			.where({ id })
			.modify({
				...updateData,
				completedAt: updateData.completed ? new Date() : null,
				updatedAt: new Date()
			});

		return db.subtasks.get(id);
	}

	static async deleteSubtask(id: string) {
		await db.subtasks
			.where({ id })
			.delete();
		return true;
	}

	static async changeSubtaskStatus(input: SubtaskChangeStatusInputDTO) {
		const { id, completed } = input;
		
		await db.subtasks
			.where({ id })
			.modify({
				completed,
				completedAt: completed ? new Date() : null,
				updatedAt: new Date()
			});

		return db.subtasks.get(id);
	}
}
