import { db } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useLayoutEffect, useMemo } from "react";

const defaultThemeColor = "#31d071";
const defaultThemeMode = "system";

export function useUserPreferences() {
	const userPreferences = useLiveQuery(async () => {
		return await db.userPreferences.get("1");
	});

	useLayoutEffect(() => {
		if (!userPreferences) {
			db.userPreferences.add({
				id: "1",
				themeColor: defaultThemeColor,
				themeMode: defaultThemeMode,
				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}
	}, [userPreferences]);

	const themeMode = useMemo(() => {
		return userPreferences?.themeMode || "light";
	}, [userPreferences]);

	const themeColor = useMemo(() => {
		return userPreferences?.themeColor || "#FFFFFF";
	}, [userPreferences]);

	const setThemeMode = useMemo(() => {
		return (mode: "light" | "dark" | "system") => {
			db.userPreferences.update("1", { themeMode: mode });
		};
	}, []);

	const setThemeColor = useMemo(() => {
		return (color: string) => {
			db.userPreferences.update("1", { themeColor: color });
		};
	}, []);

	useEffect(() => {
		if (themeMode === "system") {
			const systemTheme = window.matchMedia(
				"(prefers-color-scheme: dark)"
			).matches
				? "dark"
				: "light";
			setThemeMode(systemTheme);
		}
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(themeMode);
	}, [themeMode]);

	useEffect(() => {
		const root = window.document.documentElement;
		root.style.setProperty("--primary", themeColor);
	}, [themeColor]);

	return { themeColor, themeMode, setThemeColor, setThemeMode };
}
