import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

type AnimatedGridProps<T extends { id: string }> = {
	objects: T[];
	render: (object: T) => React.ReactNode;
} & React.ComponentProps<"div">;

export function AnimatedGrid<T extends { id: string }>({ objects: object, render, className, ...props }: AnimatedGridProps<T>) {
	return (
		<div className={cn("gap-2 md:gap-4 grid grid-cols-1 2xl:grid-cols-3 xl:grid-cols-2", className)} {...props}>
			<AnimatePresence mode="popLayout" presenceAffectsLayout>
				{object.map((object) => (
					<motion.div
						key={object.id}
						layout
						initial={{ opacity: 0, transform: "translateY(8px)" }}
						animate={{ opacity: 1, transform: "translateX(0)" }}
						exit={{ opacity: 0, transform: "translateY(-8px)" }}
						transition={{ duration: 0.2 }}
					>
						{render(object)}
					</motion.div>
				))}
			</AnimatePresence>
		</div>
	);
}
