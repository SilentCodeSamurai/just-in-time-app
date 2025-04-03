import { Bookmark, Box, LayoutDashboard, List, LogOut, User } from "lucide-react";
import { Popover, PopoverTrigger } from "./ui/popover";

import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { PopoverContent } from "./ui/popover";
import { Separator } from "./ui/separator";
// import ThemeColorPicker from "./theme-color-picker";

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

type DashboardNavProps = {
	email: string;
};

export function DashboardNav({ email }: DashboardNavProps) {
	return (
		<>
			<header className="lg:top-0 bottom-0 lg:bottom-auto left-0 z-100 fixed flex flex-row justify-center items-center gap-1 lg:gap-2 bg-primary/10 backdrop-blur-xl w-full h-12">
				<div>
					<Logo size="sm" className="hidden lg:flex" animate="always" />
					<Separator orientation="vertical" />
				</div>

				{items.map((item) => (
					<Button variant="ghost" asChild key={item.url} className="gap-0.5 min-w-fit size-11">
						<Link
							key={item.url}
							to={item.url}
							className="flex flex-col items-center gap-0"
							activeOptions={{ exact: true }}
							activeProps={{ className: "text-primary" }}
						>
							<item.icon />
							<p className="text-xs">{item.title}</p>
						</Link>
					</Button>
				))}
				<Popover>
					<PopoverTrigger asChild>
						<Button variant="ghost" className="flex flex-col items-center gap-0 min-w-fit size-11">
							<User />
							<p className="text-xs">Me</p>
						</Button>
					</PopoverTrigger>
					<PopoverContent className="flex flex-col items-center gap-2 w-fit">
						<p className="font-medium text-sm">{email}</p>
						<div className="flex flex-row items-center gap-2 text-xs">
							{/* <ThemeColorPicker /> */}
							<Button variant="destructive" className="w-fit">
								<LogOut />
								<p>Logout</p>
							</Button>
						</div>
					</PopoverContent>
				</Popover>
			</header>
		</>
	);
}
