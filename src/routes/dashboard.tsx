import { Outlet, createFileRoute } from "@tanstack/react-router";

import { DashboardNav } from "@/components/dashboard-nav";

export const Route = createFileRoute("/dashboard")({
	component: Layout,
});

function Layout() {
	return (
		<>
			{/* TODO: add user session */}
			<DashboardNav email={"Test user"} />
			<main className="relative flex flex-col gap-2 mb-12 lg:mb-0 p-2 w-full min-h-svh">
				<Outlet />
			</main>
		</>
	);
}
