import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <main  className="flex h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <Input name="email" type="email" placeholder="Email" />
        <Input name="password" type="password" placeholder="Password" />
        <Button type="submit">Login</Button>
      </form>
    </main>
  );
}
