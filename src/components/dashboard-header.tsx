import { SlidingHeader } from "./ui/sliding-header";

export function DashboardHeader({ children }: React.PropsWithChildren) {
	return (
		<SlidingHeader className="top-0 lg:top-12 flex flex-row items-center gap-2 p-2 h-12">
			{children}
		</SlidingHeader>
	);
}
