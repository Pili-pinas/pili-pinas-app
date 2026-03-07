"use client";

import { useState, useRef, useEffect } from "react";
import type { Message, QueryResponse } from "@/lib/types";

async function queryApi(question: string, apiKey: string): Promise<QueryResponse> {
  const res = await fetch("/api/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({ question, top_k: 5 }),
  });
  if (res.status === 401 || res.status === 403) {
    throw new Error("unauthorized");
  }
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}

export default function Chat({ apiKey, onUnauthorized }: { apiKey: string; onUnauthorized: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const result = await queryApi(question, apiKey);
      const answer =
        result.chunks_used === 0
          ? "Hindi mahanap ang sagot sa aming database. / No relevant information found. Try rephrasing your question."
          : result.answer;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer, sources: result.sources },
      ]);
    } catch (err) {
      if (err instanceof Error && err.message === "unauthorized") {
        onUnauthorized();
        return;
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col" style={{ height: "calc(100vh - 120px)" }}>
      {/* Message thread */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <p className="text-center text-white/30 text-sm tracking-widest uppercase mt-16">
            Magtanong tungkol sa pulitiko, batas, at eleksyon
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-zinc-800 text-white"
                  : "border border-white/20 bg-zinc-900 text-white"
              }`}
            >
              <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>

              {/* Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <details className="mt-3 border-t border-white/10 pt-2">
                  <summary className="cursor-pointer text-xs text-white/40 hover:text-white/70 tracking-widest uppercase">
                    📚 {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""}
                  </summary>
                  <ul className="mt-2 space-y-2">
                    {msg.sources.map((src, j) => (
                      <li key={j} className="text-xs text-white/60">
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-white"
                        >
                          {src.title}
                        </a>
                        <span className="ml-1 text-white/30">
                          · {src.source} · {src.date}
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="border border-white/20 bg-zinc-900 rounded px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block h-2 w-2 rounded-full bg-white/40 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 px-4 py-4 flex gap-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tanong mo dito... / Ask a question..."
          disabled={loading}
          className="flex-1 bg-zinc-900 border border-white/20 rounded px-4 py-2 text-sm text-white placeholder-white/30 focus:border-white/60 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="graffiti-font border-2 border-white/30 px-5 py-2 text-xs tracking-widest text-white/60 uppercase transition-all duration-200 hover:border-white hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
