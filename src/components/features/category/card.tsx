"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, ExternalLink, Pencil, Trash } from "lucide-react";
import { motion, useAnimation } from "motion/react";

import { Button } from "@/components/ui/button";
import { CategoryDeleteDialog } from "./delete-dialog";
import { CategoryUpdateForm } from "./update-form";
import { ColorMarker } from "@/components/ui/color-marker";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { CategoryAllItem } from "@/types/category";

export function CategoryCard({ category }: { category: CategoryAllItem }) {
	const controls = useAnimation();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [updateFormOpen, setUpdateFormOpen] = useState(false);

	const handleUpdateSuccess = () => {
		controls.start({
			scale: [1, 1.01, 1],
			transition: { duration: 0.2 },
		});
	};

	return (
		<>
			<CategoryDeleteDialog category={category} open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
			<CategoryUpdateForm
				category={category}
				open={updateFormOpen}
				onOpenChange={setUpdateFormOpen}
				onSuccess={handleUpdateSuccess}
			/>
			<motion.div animate={controls}>
				<Card variant="item" key={category.id} className={`w-full h-fit relative gap-1 pl-2 lg:pl-3`}>
					<ColorMarker color={category.color} />
					<CardHeader>
						<div className="flex flex-row justify-between items-center gap-2">
							<div className="flex flex-row items-center gap-2">
								<div
									className="rounded-full size-4"
									style={{ backgroundColor: category.color || "inherit" }}
								/>
							</div>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="size-8">
										<EllipsisVertical className="size-4" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem onClick={() => setUpdateFormOpen(true)}>
										<Pencil className="size-4" />
										Edit
									</DropdownMenuItem>
									<DropdownMenuItem variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
										<Trash className="size-4" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
						<CardTitle className="text-md">{category.name}</CardTitle>
						<CardDescription>{category.description}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-row items-center gap-4">
							<p className="text-md">TODOS: {category._count.todos}</p>
							{category._count.todos > 0 && (
								<Button asChild type="button" variant="outline" className="size-8">
									<Link
										to="/dashboard/todo"
										search={{ filter: { categoryId: category.id } }}
										viewTransition={true}
									>
										<ExternalLink className="size-4" />
									</Link>
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</>
	);
}
