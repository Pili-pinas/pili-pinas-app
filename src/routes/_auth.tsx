import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuthStore } from "../auth-store";

export const Route = createFileRoute("/_auth")({
  //   component: RouteComponent,
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().isLoggedIn) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
});

// function RouteComponent() {
//   return <div>Hello "/_auth"!</div>
// }
