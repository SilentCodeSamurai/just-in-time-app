"use client";

import { useEffect, useState } from "react";

import type React from "react";
import { cn } from "@/lib/utils";

interface SlidingHeaderProps {
	className?: string;
	children: React.ReactNode;
}

export function SlidingHeader({ className, children }: SlidingHeaderProps) {
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Determine if we're scrolling up or down
			if (currentScrollY > lastScrollY) {
				// Scrolling down
				setIsVisible(false);
			} else {
				// Scrolling up
				setIsVisible(true);
			}

			// Update the last scroll position
			setLastScrollY(currentScrollY);
		};

		// Add scroll event listener
		window.addEventListener("scroll", handleScroll, { passive: true });

		// Clean up
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [lastScrollY]);

	return (
		<header
			className={cn(
				"fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out bg-background border-b shadow-sm",
				isVisible ? "translate-y-0" : "-translate-y-full pointer-events-none",
				className
			)}
		>
			{children}
		</header>
	);
}
