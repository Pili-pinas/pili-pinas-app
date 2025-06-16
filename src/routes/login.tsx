import { createFileRoute, redirect } from "@tanstack/react-router";
import React from "react";
import { useAuthStore } from "../auth-store";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (useAuthStore.getState().isLoggedIn) {
      throw redirect({
        to: "/dashboard",
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const login = useAuthStore((state) => state.login);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // get values
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      await navigate({
        to: (search as { redirect?: string }).redirect || "/dashboard",
      });
    } catch (error) {
      console.log("Login failed:", error);
      e.currentTarget.reset();
    }
  };

  return (
    <main>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Login</button>
      </form>
    </main>
  );
}
