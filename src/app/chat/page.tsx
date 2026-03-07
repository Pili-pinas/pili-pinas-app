"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Chat from "@/components/Chat";

const AUTH_URL = "https://rag-pipeline-91ct.vercel.app";
const STORAGE_KEY = "apiKey";

export default function ChatPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setApiKey(stored);
    setReady(true);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`${AUTH_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError(
          res.status === 401 || res.status === 403
            ? "Invalid email or password."
            : "Login failed. Please try again."
        );
        return;
      }

      const { api_key } = await res.json();
      localStorage.setItem(STORAGE_KEY, api_key);
      setApiKey(api_key);
    } catch {
      setError("Could not reach the server. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
    setEmail("");
    setPassword("");
    setError("");
  }

  if (!ready) return null;

  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      {/* Brick wall texture */}
      <div className="brick-wall absolute inset-0 opacity-[0.06]" />
      <div className="paint-splatter top-[5%] left-[10%] h-24 w-24" />
      <div className="paint-splatter bottom-[10%] right-[8%] h-40 w-40" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-6">
        <Link
          href="/"
          className="graffiti-font text-xs tracking-[0.3em] text-white/40 uppercase hover:text-white transition-colors duration-200"
        >
          ← Back
        </Link>
        <h1 className="graffiti-font text-white text-2xl tracking-wide">
          Tanong Mo!
        </h1>
        {apiKey ? (
          <button
            onClick={handleLogout}
            className="graffiti-font text-xs tracking-[0.3em] text-white/30 uppercase hover:text-white/70 transition-colors duration-200"
          >
            Logout
          </button>
        ) : (
          <div className="w-16" />
        )}
      </header>

      {/* Auth gate or Chat */}
      <div className="relative z-10 flex flex-1 flex-col px-0">
        {apiKey ? (
          <Chat apiKey={apiKey} onUnauthorized={handleLogout} />
        ) : (
          <div className="flex flex-1 items-center justify-center px-6">
            <div className="w-full max-w-sm">
              <p className="graffiti-font mb-8 text-center text-sm tracking-[0.2em] text-white/40 uppercase">
                Mag-login muna
              </p>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2 border-white/30 bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-2 border-white/30 bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white"
                />

                {error && (
                  <p className="text-center text-sm text-red-400">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="graffiti-font mt-2 border-2 border-white px-8 py-3 text-sm tracking-[0.3em] text-white uppercase transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-40"
                >
                  {submitting ? "..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
