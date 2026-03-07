import Chat from "@/components/Chat";
import Link from "next/link";

export const metadata = { title: "Pili-Pinas — Tanong Mo!" };

export default function ChatPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-black">
      {/* Brick wall texture */}
      <div className="brick-wall absolute inset-0 opacity-[0.06]" />

      {/* Paint splatters */}
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
        <div className="w-16" />
      </header>

      {/* Chat */}
      <div className="relative z-10 flex flex-1 flex-col px-0">
        <Chat />
      </div>
    </div>
  );
}
