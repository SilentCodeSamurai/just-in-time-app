import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
	priority: number;
	className?: string;
}

const priorityClasses: Record<number, string> = {
	1: "bg-priority-1",
	2: "bg-priority-2",
	3: "bg-priority-3",
	4: "bg-priority-4",
};

export const PRIORITY_LABELS: Map<number, string> = new Map([
	[1, "Low"],
	[2, "Medium"],
	[3, "High"],
	[4, "Urgent"],
]);

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
	return (
		<Badge variant="outline" className={cn(priorityClasses[priority], className, "text-white")}>
			{PRIORITY_LABELS.get(priority)}
		</Badge>
	);
}
