export function ColorMarker({ color }: { color?: string | null | undefined }) {
	return (
		<div
			style={{ height: "calc(100% + 2px)" }}
			className="-top-[1px] right-0 bottom-0 -left-[1px] absolute border-0 border-transparent rounded-lg overflow-hidden pointer-events-none"
		>
			<div
				style={{
					zIndex: 0,
					position: "absolute",
					top: 0,
					left: "-5px",
					width: "20px",
					height: "100%",
					background: `linear-gradient(to right, ${color || "gray"} 0%, transparent 100%)`,
				}}
			></div>
		</div>
	);
}
