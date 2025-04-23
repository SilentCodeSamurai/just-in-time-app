"use client";

import {
	ArrowDown,
	ArrowUp,
	ArrowUpDown,
	CalendarIcon,
	Filter,
	X,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PriorityBadge } from "./priority-badges";
import {
	TodoAllItem,
	TodoFindOptionsFilter,
	TodoFindOptionsSorting,
} from "@/features/todo/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { filterTodo, sortTodo } from "@/features/todo/utils";

const sortingOptions: Map<TodoFindOptionsSorting["sortBy"], string> = new Map([
	["priority", "Priority"],
	["dueDate", "Deadline"],
	["createdAt", "Created"],
]);

const routeApi = getRouteApi("/dashboard/todo");

export function TodoFilters() {
	const categories = useLiveQuery(async () => {
		return await db.categories.toArray();
	});
	const groups = useLiveQuery(async () => {
		return await db.groups.toArray();
	});

	const { sorting, filter } = routeApi.useSearch();
	const navigate = useNavigate({ from: "/dashboard/todo" });

	const [filtersOpen, setFiltersOpen] = useState(false);

	const date = useMemo(() => {
		const dueDate = filter?.dueDate;
		return dueDate ? new Date(dueDate) : undefined;
	}, [filter]);

	const hasActiveFilters = Object.keys(filter || {}).length > 0;
	const hasActiveSorting = Object.keys(sorting || {}).length > 0;

	const handleSortByChange = (sortBy: TodoFindOptionsSorting["sortBy"]) => {
		navigate({
			to: ".",
			replace: true,
			search: (prev) => {
				let newSortOrder: "asc" | "desc" = "asc";
				if (!prev.sorting) {
					return {
						...prev,
						sorting: {
							sortBy: sortBy,
							sortOrder: newSortOrder,
						},
					};
				} else if (prev.sorting.sortBy === sortBy) {
					if (prev.sorting.sortOrder === "asc") {
						newSortOrder = "desc";
					} else {
						newSortOrder = "asc";
					}
					return {
						...prev,
						sorting: {
							sortBy: sortBy,
							sortOrder: newSortOrder,
						},
					};
				} else {
					return {
						...prev,
						sorting: {
							sortBy: sortBy,
							sortOrder: newSortOrder,
						},
					};
				}
			},
		});
	};

	type FilterKey = keyof TodoFindOptionsFilter;

	const handleToggleFilter = (
		key: FilterKey,
		value: TodoFindOptionsFilter[FilterKey] | "all"
	) => {
		navigate({
			to: ".",
			replace: true,
			search: (prev) => {
				const newFilter = { ...prev.filter };
				if (value === "all") {
					delete newFilter[key];
				} else {
					Object.assign(newFilter, { [key]: value });
				}
				if (Object.keys(newFilter).length === 0) {
					return { ...prev, filter: undefined };
				}
				return { ...prev, filter: newFilter };
			},
		});
	};

	return (
		<>
			<Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Filters</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-2 w-full">
						<Label>Priority</Label>
						<Select
							value={filter?.priority?.toString() || "all"}
							onValueChange={(value) =>
								handleToggleFilter(
									"priority",
									value === "all" ? "all" : parseInt(value)
								)
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Filter by priority" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								{[1, 2, 3, 4].map((priority) => (
									<SelectItem
										key={priority}
										value={priority.toString()}
									>
										<PriorityBadge priority={priority} />
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2 w-full">
						<Label>Category</Label>
						<Select
							value={filter?.categoryId || "all"}
							defaultValue="all"
							onValueChange={(value) =>
								handleToggleFilter("categoryId", value)
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Filter by category" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<div className="flex items-center gap-2">
										<div className="bg-muted rounded-full size-3" />
										<span>All</span>
									</div>
								</SelectItem>
								{categories?.map((category) => (
									<SelectItem
										key={category.id}
										value={category.id}
									>
										<div className="flex items-center gap-2">
											<div
												className="rounded-full size-3"
												style={{
													backgroundColor:
														category.color ||
														"inherit",
												}}
											/>
											<span>{category.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Group</Label>
						<Select
							value={filter?.groupId || "all"}
							onValueChange={(value) =>
								handleToggleFilter("groupId", value)
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Filter by group" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">
									<div className="flex items-center gap-2">
										<div className="bg-muted rounded-full size-3" />
										<span>All</span>
									</div>
								</SelectItem>
								{groups?.map((group) => (
									<SelectItem key={group.id} value={group.id}>
										<div className="flex items-center gap-2">
											<div
												className="rounded-full size-3"
												style={{
													backgroundColor:
														group.color ||
														"inherit",
												}}
											/>
											<span>{group.name}</span>
										</div>
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Status</Label>
						<Select
							value={
								filter?.completed !== undefined
									? filter?.completed
										? "completed"
										: "active"
									: "all"
							}
							defaultValue="all"
							onValueChange={(value) =>
								handleToggleFilter(
									"completed",
									value === "all"
										? "all"
										: value === "completed"
								)
							}
						>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="completed">
									Completed
								</SelectItem>
								<SelectItem value="active">Active</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex flex-col gap-2">
						<div className="flex flex-col gap-2">
							<Label>
								{filter?.exactDate
									? "Deadline"
									: "Expires before"}
							</Label>
							<div className="flex flex-row items-center gap-2">
								<Label>exact</Label>
								<Checkbox
									checked={filter?.exactDate || false}
									onCheckedChange={(value) =>
										handleToggleFilter(
											"exactDate",
											value || undefined
										)
									}
								/>
							</div>
						</div>
						<Popover>
							<PopoverTrigger asChild>
								<Button
									variant="outline"
									className={cn(
										"w-full justify-start text-left font-normal",
										!date && "text-muted-foreground"
									)}
								>
									<CalendarIcon className="mr-2 w-4 h-4" />
									{date
										? `${format(date, "PPP")}`
										: filter?.exactDate
											? "Deadline"
											: "Expires before"}
								</Button>
							</PopoverTrigger>

							<PopoverContent
								className="p-0 w-auto"
								align="start"
							>
								<Calendar
									mode="single"
									selected={date}
									onSelect={(value) =>
										handleToggleFilter(
											"dueDate",
											value?.toISOString()
										)
									}
								/>
							</PopoverContent>
						</Popover>
					</div>
				</DialogContent>
			</Dialog>

			<div className="flex flex-row gap-2">
				<div className="flex flex-row items-center gap-0">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon">
								{sorting && sorting.sortBy ? (
									sorting.sortOrder === "asc" ? (
										<ArrowUp className="text-primary" />
									) : (
										<ArrowDown className="text-primary" />
									)
								) : (
									<ArrowUpDown />
								)}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							{Array.from(sortingOptions.entries()).map(
								([key, label]) => (
									<DropdownMenuItem
										key={key}
										onClick={() =>
											handleSortByChange(
												key as TodoFindOptionsSorting["sortBy"]
											)
										}
									>
										{label}
										{sorting?.sortBy === key && (
											<span className="ml-2">
												{sorting?.sortOrder === "asc"
													? "↑"
													: "↓"}
											</span>
										)}
									</DropdownMenuItem>
								)
							)}
						</DropdownMenuContent>
					</DropdownMenu>

					{hasActiveSorting && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								navigate({
									to: ".",
									search: (prev) => ({
										...prev,
										sorting: undefined,
									}),
								});
							}}
							title="Clear sorting"
						>
							<X className="w-4 h-4" />
						</Button>
					)}
				</div>

				<div className="flex flex-row items-center gap-0">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setFiltersOpen(!filtersOpen)}
					>
						<Filter
							className={cn(
								"transition-colors duration-200",
								hasActiveFilters && "text-primary"
							)}
						/>
					</Button>

					{hasActiveFilters && (
						<Button
							variant="ghost"
							size="icon"
							onClick={() => {
								navigate({
									to: ".",
									search: (prev) => ({
										...prev,
										filter: undefined,
									}),
								});
							}}
							className="ml-auto"
							title="Clear all filters"
						>
							<X className="w-4 h-4" />
						</Button>
					)}
				</div>
			</div>
		</>
	);
}

export function useTodoFilter(): (todoAll: TodoAllItem[]) => TodoAllItem[] {
	const { sorting, filter } = routeApi.useSearch();

	return (todoAll: TodoAllItem[]) => {
		let result: TodoAllItem[] = todoAll;
		if (filter) {
			result = filterTodo(todoAll, filter);
		}
		if (sorting) {
			result = sortTodo(result, sorting);
		}
		return result;
	};
}
