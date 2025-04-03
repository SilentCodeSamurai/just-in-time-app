import { AnimatedGrid } from "@/components/animated-grid";
import { CreateGroupForm } from "@/components/features/group/create-form";
import { DashboardContent } from "@/components/dashboard-content";
import { DashboardHeader } from "@/components/dashboard-header";
import { GroupCard } from "@/components/features/group/card";
import { groupGetAllQuery } from "@/queries/group";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/group")({
	loader: async ({ context }) => {
		const groups = await context.queryClient.ensureQueryData(groupGetAllQuery);
		return groups;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const groupAllResult = useSuspenseQuery(groupGetAllQuery);
	const groupAll = groupAllResult.data;

	return (
		<>
			<DashboardHeader>
				<div className="flex flex-row items-center gap-2">
					<h1 className="font-bold text-xl">Groups</h1>
					<CreateGroupForm />
				</div>
			</DashboardHeader>
			<DashboardContent>
				<AnimatedGrid objects={groupAll} render={(group) => <GroupCard group={group} />} />
			</DashboardContent>
		</>
	);
}
