"use client";

export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">

      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-violet-900 to-cyan-900" />

      {/* Blob 1 */}
      <div
        className="
          absolute
          -left-40
          -top-40
          h-96
          w-96
          rounded-full
          bg-indigo-500/30
          blur-3xl
          animate-blob
        "
      />

      {/* Blob 2 */}
      <div
        className="
          absolute
          right-0
          top-1/4
          h-[28rem]
          w-[28rem]
          rounded-full
          bg-violet-500/30
          blur-3xl
          animate-blob
          animation-delay-2000
        "
      />

      {/* Blob 3 */}
      <div
        className="
          absolute
          bottom-0
          left-1/3
          h-[26rem]
          w-[26rem]
          rounded-full
          bg-cyan-500/30
          blur-3xl
          animate-blob
          animation-delay-4000
        "
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10" />

    </div>
  );
}