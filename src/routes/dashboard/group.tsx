import { AnimatedGrid } from "@/components/animated-grid";
import { CreateGroupForm } from "@/features/group/components/create-form";
import { DashboardContent } from "@/components/dashboard-content";
import { DashboardHeader } from "@/components/dashboard-header";
import { GroupCard } from "@/features/group/components/card";
import { useLiveQuery } from "dexie-react-hooks";
import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { GroupAllItem } from "@/features/group/types";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/group")({
	component: RouteComponent,
});

function RouteComponent() {
	const [createFormOpen, setCreateFormOpen] = useState(false);

	const groups = useLiveQuery(async () => {
		const groups = await db.groups.toArray();

		const groupsWithCount: GroupAllItem[] = await Promise.all(
			groups.map(async (group) => {
				const todoCount = await db.todos
					.where("groupId")
					.equals(group.id)
					.count();
				return {
					...group,
					_count: {
						todos: todoCount,
					},
				};
			})
		);

		return groupsWithCount;
	});

	return (
		<>
			<DashboardHeader>
				<div className="flex flex-row items-center gap-2">
					<h1 className="font-bold text-xl">Groups</h1>
					<CreateGroupForm
						open={createFormOpen}
						onOpenChange={setCreateFormOpen}
					/>
				</div>
			</DashboardHeader>
			<DashboardContent>
				<AnimatedGrid
					objects={groups || []}
					render={(group) => <GroupCard group={group} />}
				/>
			</DashboardContent>
		</>
	);
}
