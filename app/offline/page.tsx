// PWA offline fallback document — served by the service worker when:
//   1. The user is offline, AND
//   2. The requested page is not in the 'pages' cache.
// Referenced by: fallbacks: { document: '/offline' } in next.config.js
// NOTE: Must NOT be in a directory starting with '_' (reserved by Next.js)

"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="animate-bounce text-6xl">📡</div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">
          You&apos;re Offline
        </h1>
        <p className="text-lg leading-relaxed text-neutral-400">
          Memory Lane couldn&apos;t connect to the sanctuary. Check your connection or explore your
          cached memories.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="shadow-primary-900/20 bg-primary-600 hover:bg-primary-700 rounded-2xl px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Re-establish Connection
        </button>
      </div>
    </div>
  );
}
