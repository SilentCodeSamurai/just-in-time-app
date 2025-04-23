import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DashboardNav } from "@/components/dashboard-nav";

export const Route = createFileRoute("/dashboard")({
	component: Layout,
});

function Layout() {
	return (
		<>
			<DashboardNav />
			<main className="relative flex flex-col gap-2 mb-12 lg:mb-0 p-2 lg:pl-14 w-full min-h-svh">
				<Outlet />
			</main>
		</>
	);
}
