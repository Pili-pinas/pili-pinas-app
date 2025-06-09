import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Github Pages dones't support routing for SPA
// Recommended to use hash routing https://github.com/orgs/community/discussions/64096
const history = createHashHistory();
const router = createRouter({ routeTree, history });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
