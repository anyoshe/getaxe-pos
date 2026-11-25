"use client";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-900 to-cyan-950" />

      {/* Soft blobs — lighter motion on mobile via CSS size only */}
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl sm:h-96 sm:w-96 sm:animate-blob" />
      <div className="absolute right-0 top-1/4 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl sm:h-[28rem] sm:w-[28rem] sm:animate-blob sm:[animation-delay:2s]" />
      <div className="absolute bottom-0 left-1/3 hidden h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl sm:block sm:h-[26rem] sm:w-[26rem] sm:animate-blob sm:[animation-delay:4s]" />

      <div className="absolute inset-0 bg-black/15" />
    </div>
  );
}
