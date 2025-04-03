import { Link, createFileRoute } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<div className="flex flex-col justify-center items-center space-y-8 h-svh">
				<Logo size="lg" animate="always" />
				{
					<Button asChild className="w-40 md:w-60 lg:w-70">
						<Link to="/dashboard" viewTransition={true}>
							Dashboard
						</Link>
					</Button>
				}
			</div>
		</>
	);
}
