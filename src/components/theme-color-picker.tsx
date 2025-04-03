// import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

// import { Button } from "./ui/button";
// import { HexColorPicker } from "react-colorful";
// import { Input } from "./ui/input";
// import { Palette } from "lucide-react";
// import { debounce } from "@/lib/utils";
// import { useMemo } from "react";
// import { useThemeColor } from "@/hooks/use-theme-color";

// export default function ThemeColorPicker() {
// 	const { color, setColor } = useThemeColor();

// 	const handleChangeColor = (color: string) => {
// 		setColor(color);
// 	};

// 	const debouncedOnChange = useMemo(() => debounce(handleChangeColor, 100), [handleChangeColor]);

// 	const parsedValue = useMemo(() => {
// 		return color || "#FFFFFF";
// 	}, [color]);

// 	return (
// 		<Popover>
// 			<PopoverTrigger asChild>
// 				<Button className="size-8">
// 					<Palette className="size-4" />
// 				</Button>
// 			</PopoverTrigger>
// 			<PopoverContent className="w-full">
// 				<HexColorPicker color={parsedValue} onChange={debouncedOnChange} />
// 				<Input
// 					maxLength={7}
// 					onChange={(e) => {
// 						debouncedOnChange(e?.currentTarget?.value);
// 					}}
// 					value={parsedValue}
// 				/>
// 			</PopoverContent>
// 		</Popover>
// 	);
// }
