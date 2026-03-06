export default function Contact() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black">
      {/* Brick wall texture */}
      <div className="brick-wall absolute inset-0 opacity-[0.06]" />

      {/* Paint splatters */}
      <div className="paint-splatter top-[10%] left-[15%] h-40 w-40" />
      <div className="paint-splatter top-[60%] right-[10%] h-64 w-64" />

      {/* Diagonal spray paint streak */}
      <div className="spray-streak absolute top-0 right-0 h-full w-full opacity-[0.03]" />

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center">
        <h1 className="graffiti-font graffiti-title text-[clamp(2rem,8vw,6rem)] leading-tight tracking-wide text-white">
          Contact Us
        </h1>

        <p className="graffiti-font graffiti-subtitle mt-10 text-lg tracking-[0.2em] text-white/40 uppercase sm:mt-12 sm:text-xl">
          Makipag-ugnayan sa amin
        </p>

        <div className="graffiti-subtitle mt-16 flex flex-col items-center gap-4" style={{ animationDelay: '0.9s' }}>
          <a
            href="https://www.facebook.com/profile.php?id=61584937257530"
            target="_blank"
            rel="noopener noreferrer"
            className="graffiti-font flex items-center gap-3 rounded-none border-2 border-white/30 px-8 py-4 text-xl text-white tracking-widest uppercase transition-all duration-200 hover:border-white hover:bg-white hover:text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </a>
        </div>

        <a
          href="/"
          className="graffiti-font graffiti-subtitle absolute bottom-10 text-sm tracking-[0.3em] text-white/30 uppercase transition-colors hover:text-white/60"
          style={{ animationDelay: '1.2s' }}
        >
          ← Back
        </a>
      </main>
    </div>
  );
}
