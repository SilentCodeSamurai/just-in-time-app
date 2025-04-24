import "./index.css";

import { RouterProvider, createRouter } from "@tanstack/react-router";

import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import { initializeTaskNotifications } from '@/utils/taskNotificationUtils'

// Initialize task notifications
initializeTaskNotifications()

// Set up a Router instance
const router = createRouter({
	routeTree,
	defaultPreload: "intent",
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
});

// Register things for typesafety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(<RouterProvider router={router} />);
}
