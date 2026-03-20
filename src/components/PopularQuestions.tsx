"use client";

import { useState, useEffect } from "react";
import type { PopularQuestion } from "@/lib/types";

interface Props {
  apiKey: string;
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export default function PopularQuestions({ apiKey, onSelect, disabled }: Props) {
  const [questions, setQuestions] = useState<PopularQuestion[]>([]);

  useEffect(() => {
    fetch("/api/popular", {
      headers: { "X-API-Key": apiKey },
    })
      .then((res) => (res.ok ? res.json() : { questions: [] }))
      .then((data: { questions: PopularQuestion[] }) => setQuestions(Array.isArray(data.questions) ? data.questions : []))
      .catch(() => {});
  }, [apiKey]);
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center max-w-lg">
      {questions.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(item.question)}
          disabled={disabled}
          className="graffiti-font border border-white/40 px-3 py-2 text-xs text-white/70 tracking-wide hover:border-white hover:text-white hover:bg-white/5 transition-all duration-200 disabled:opacity-30"
        >
          {item.question}
        </button>
      ))}
    </div>
  );
}
