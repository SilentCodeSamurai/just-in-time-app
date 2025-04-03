import { AnimatedGrid } from "@/components/animated-grid";
import { CategoryCard } from "@/components/features/category/card";
import { CreateCategoryForm } from "@/components/features/category/create-form";
import { DashboardContent } from "@/components/dashboard-content";
import { DashboardHeader } from "@/components/dashboard-header";
import { categoryGetAllQuery } from "@/queries/category";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/category")({
	loader: async ({ context }) => {
		const categories = await context.queryClient.ensureQueryData(categoryGetAllQuery);
		return categories;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const categoryAllResult = useSuspenseQuery(categoryGetAllQuery);
	const categoryAll = categoryAllResult.data;

	return (
		<>
			<DashboardHeader>
				<h1 className="font-bold text-xl">Categories</h1>
				<CreateCategoryForm />
			</DashboardHeader>

			<DashboardContent>
				<AnimatedGrid objects={categoryAll} render={(category) => <CategoryCard category={category} />} />
			</DashboardContent>
		</>
	);
}
