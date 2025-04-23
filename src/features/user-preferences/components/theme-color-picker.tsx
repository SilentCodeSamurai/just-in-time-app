import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";
import { debounce } from "@/lib/utils";
import { useMemo } from "react";
import { useUserPreferences } from "@/features/user-preferences/hooks/use-user-preferences";

export default function ThemeColorPicker() {
	const { themeColor, setThemeColor } = useUserPreferences();

	const handleChangeColor = (color: string) => {
		setThemeColor(color);
	};

	const debouncedOnChange = useMemo(
		() => debounce(handleChangeColor, 100),
		[handleChangeColor]
	);

	const parsedValue = useMemo(() => {
		return themeColor || "#FFFFFF";
	}, [themeColor]);

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button className="size-8">
					<Palette className="size-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full">
				<HexColorPicker
					color={parsedValue}
					onChange={debouncedOnChange}
				/>
				<Input
					maxLength={7}
					onChange={(e) => {
						debouncedOnChange(e?.currentTarget?.value);
					}}
					value={parsedValue}
				/>
			</PopoverContent>
		</Popover>
	);
}
