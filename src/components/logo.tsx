import { Hourglass } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

const svgVariants = cva("font-bold whitespace-nowrap", {
	variants: {
		size: {
			lg: "md:top-[7px] lg:top-[12px] right-[56px] md:right-[92px] lg:right-[146px] z-0 absolute size-[28px] md:size-[48px] lg:size-[77px] text-primary",
			sm: "top-[5.8px] md:top-[6.5px] lg:top-[7px] right-[24.6px] md:right-[30.5px] lg:right-[36px] z-0 absolute size-[13px] md:size-[16px] lg:size-[20px] text-primary",
		},
	},
	defaultVariants: {
		size: "lg",
	},
});

const textVariants = cva("font-bold whitespace-nowrap", {
	variants: {
		size: {
			lg: "text-4xl md:text-6xl lg:text-8xl",
			sm: "text-md md:text-xl lg:text-2xl",
		},
	},
	defaultVariants: {
		size: "lg",
	},
});

type LogoProps = { animate?: "hover" | "always"; size?: "lg" | "sm" } & React.ComponentProps<"div">;

export function Logo({ animate = "hover", size = "lg", className }: LogoProps) {
	return (
		<div
			className={cn(
				"relative flex items-center gap-2",
				animate === "hover" && "hover:[&>_svg]:animate-hourglass",
				className
			)}
		>
			<h1 className={cn(textVariants({ size }))}>
				JUST IN{" "}
				<span className="text-primary">
					T<span className="opacity-0 text-foreground">I</span>ME
				</span>
			</h1>
			<Hourglass className={cn(svgVariants({ size }), animate === "always" && "animate-hourglass")} />
		</div>
	);
}
