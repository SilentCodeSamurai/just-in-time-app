import { AnimatedGrid } from "@/components/animated-grid";
import { CategoryCard } from "@/features/category/components/card";
import { CreateCategoryForm } from "@/features/category/components/create-form";
import { DashboardContent } from "@/components/dashboard-content";
import { DashboardHeader } from "@/components/dashboard-header";
import { createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { CategoryAllItem } from "@/features/category/types";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/category")({
	component: RouteComponent,
});

function RouteComponent() {
	const [createFormOpen, setCreateFormOpen] = useState(false);

	const categories = useLiveQuery(async () => {
		const categories = await db.categories.toArray();

		const categoriesWithCount: CategoryAllItem[] = await Promise.all(
			categories.map(async (category) => {
				const todoCount = await db.todos
					.where("categoryId")
					.equals(category.id)
					.count();
				return {
					...category,
					_count: {
						todos: todoCount,
					},
				};
			})
		);

		return categoriesWithCount;
	});

	return (
		<>
			<DashboardHeader>
				<h1 className="font-bold text-xl">Categories</h1>
				<CreateCategoryForm
					open={createFormOpen}
					onOpenChange={setCreateFormOpen}
				/>
			</DashboardHeader>

			<DashboardContent>
				<AnimatedGrid
					objects={categories || []}
					render={(category) => <CategoryCard category={category} />}
				/>
			</DashboardContent>
		</>
	);
}
