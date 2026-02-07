export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black">
      {/* Brick wall texture - subtle grid lines */}
      <div className="brick-wall absolute inset-0 opacity-[0.06]" />

      {/* Paint splatters */}
      <div className="paint-splatter top-[10%] left-[15%] h-40 w-40" />
      <div className="paint-splatter top-[60%] right-[10%] h-64 w-64" />
      <div className="paint-splatter bottom-[15%] left-[40%] h-32 w-32" />

      {/* Diagonal spray paint streak */}
      <div className="spray-streak absolute top-0 right-0 h-full w-full opacity-[0.03]" />

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        {/* Main graffiti title */}
        <h2 className="graffiti-font graffiti-title text-[clamp(2rem,8vw,8rem)] leading-tight tracking-wide text-white">
          <span className="block whitespace-nowrap">Gawa ng Pilipino,</span>
          <span className="relative block whitespace-nowrap">
            Para sa Pilipino
            {/* Underline spray effect */}
            <span className="spray-underline absolute -bottom-2 left-0 h-[3px] w-full bg-white opacity-60 sm:-bottom-4 sm:h-[5px]" />
          </span>
        </h2>

        {/* Tagline */}
        <p className="graffiti-font graffiti-subtitle mt-10 text-lg tracking-[0.3em] text-white/40 uppercase sm:mt-16 sm:text-xl">
          Pili-Pinas
        </p>

        {/* Drip elements from title */}
        <div className="pointer-events-none absolute top-[55%] left-[20%] hidden sm:block">
          <div className="drip-slow w-[2px] bg-white/20" />
        </div>
        <div className="pointer-events-none absolute top-[58%] right-[25%] hidden sm:block">
          <div className="drip-slower w-[2px] bg-white/15" />
        </div>
      </main>
    </div>
  );
}
