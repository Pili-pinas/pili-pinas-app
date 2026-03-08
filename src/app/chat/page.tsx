"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Chat from "@/components/Chat";

const AUTH_URL = "https://rag-pipeline-91ct.vercel.app";
const STORAGE_KEY = "apiKey";

type Tab = "login" | "token";

export default function ChatPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<Tab>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Token form state
  const [token, setToken] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setApiKey(stored);
    setReady(true);
  }, []);

  function switchTab(next: Tab) {
    setTab(next);
    setError("");
  }

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

  function handleTokenSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;
    localStorage.setItem(STORAGE_KEY, trimmed);
    setApiKey(trimmed);
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
    setEmail("");
    setPassword("");
    setToken("");
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
              {/* Tabs */}
              <div className="mb-8 grid grid-cols-2 gap-3">
                <button
                  role="tab"
                  aria-selected={tab === "login"}
                  onClick={() => switchTab("login")}
                  className={`graffiti-font border-2 py-3 text-sm tracking-[0.25em] uppercase transition-all duration-200 ${
                    tab === "login"
                      ? "border-white bg-white text-black"
                      : "border-white/30 text-white/40 hover:border-white/60 hover:text-white/70"
                  }`}
                >
                  Login
                </button>
                <button
                  role="tab"
                  aria-selected={tab === "token"}
                  onClick={() => switchTab("token")}
                  className={`graffiti-font border-2 py-3 text-sm tracking-[0.25em] uppercase transition-all duration-200 ${
                    tab === "token"
                      ? "border-white bg-white text-black"
                      : "border-white/30 text-white/40 hover:border-white/60 hover:text-white/70"
                  }`}
                >
                  Token
                </button>
              </div>

              {/* Login form */}
              {tab === "login" && (
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
              )}

              {/* Token form */}
              {tab === "token" && (
                <form onSubmit={handleTokenSubmit} className="flex flex-col gap-4">
                  <input
                    type="text"
                    placeholder="Paste your API token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="border-2 border-white/30 bg-transparent px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white"
                  />
                  <button
                    type="submit"
                    disabled={!token.trim()}
                    className="graffiti-font mt-2 border-2 border-white px-8 py-3 text-sm tracking-[0.3em] text-white uppercase transition-all duration-200 hover:bg-white hover:text-black disabled:opacity-40"
                  >
                    Use Token
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
