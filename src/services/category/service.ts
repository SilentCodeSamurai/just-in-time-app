import { Category, JustInTimeDB } from "@/lib/db";
import { CategoryCreateInputDTO, CategoryUpdateInputDTO } from "./dto";

import { v4 as uuidv4 } from 'uuid';

const db = new JustInTimeDB();

export class CategoryService {
	static async create(input: CategoryCreateInputDTO) {
		const category: Category = {
			...input,
			id: uuidv4(),
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		await db.categories.add(category);
		return category;
	}

	static async getById(id: string) {
		const category = await db.categories
			.where({ id })
			.first();
		return category;
	}

	static async getAll() {
		const categories = await db.categories
			.reverse()
			.toArray();

		const categoriesWithCount = await Promise.all(
			categories.map(async (category) => {
				const count = await db.todos
					.where('categoryId')
					.equals(category.id)
					.count();
				return {
					...category,
					_count: { todos: count }
				};
			})
		);
		return categoriesWithCount;
	}

	static async update(input: CategoryUpdateInputDTO) {
		const { id, ...updateData } = input;
		const updatedObjects = await db.categories.update(id, {
			...updateData,
			updatedAt: new Date()
		});
		if (!updatedObjects) throw new Error("Category not found");
		const updatedCategory = await CategoryService.getById(id);
		if (!updatedCategory) throw new Error("Category not found");
		const count = await db.todos
			.where('categoryId')
			.equals(id)
			.count();
		return {
			...updatedCategory,
			_count: { todos: count }
		};
	}

	static async delete(id: string) {
		await db.categories
			.where({ id })
			.delete();
		return true;
	}
}
