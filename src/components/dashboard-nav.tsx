import { Bookmark, Box, LayoutDashboard, List, Settings } from "lucide-react";
import { Popover, PopoverTrigger } from "./ui/popover";
import { ThemeModeToggle } from "@/features/user-preferences/components/theme-mode-toggle";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { PopoverContent } from "./ui/popover";
import ThemeColorPicker from "@/features/user-preferences/components/theme-color-picker";

const items = [
	{
		title: "Dashboard",
		url: "/dashboard",
		icon: LayoutDashboard,
	},
	{
		title: "TODO",
		url: "/dashboard/todo",
		icon: Bookmark,
	},
	{
		title: "Categories",
		url: "/dashboard/category",
		icon: List,
	},
	{
		title: "Groups",
		url: "/dashboard/group",
		icon: Box,
	},
];

export function DashboardNav() {
	return (
		<>
			<header className="lg:pt-2 lg:top-0 bottom-0 lg:bottom-auto left-0 z-20 fixed flex flex-row lg:flex-col justify-center lg:justify-start items-center gap-2 lg:gap-2 bg-primary/10 backdrop-blur-xl w-full lg:w-12 h-12 lg:h-full">
				{items.map((item) => (
					<Button
						variant="ghost"
						asChild
						key={item.url}
						// className="gap-0.5 min-w-fit size-11"
						size="icon"
					>
						<Link
							key={item.url}
							to={item.url}
							className="flex flex-col items-center gap-0 hover:text-primary"
							activeOptions={{ exact: true }}
							activeProps={{ className: "text-primary" }}
						>
							<item.icon />
						</Link>
					</Button>
				))}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" size="icon">
							<Settings />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="flex flex-col items-center gap-2 w-fit">
						<div className="flex flex-row items-center gap-2 text-xs">
							<ThemeColorPicker />
							<ThemeModeToggle />
						</div>
					</PopoverContent>
				</Popover>
			</header>
		</>
	);
}
