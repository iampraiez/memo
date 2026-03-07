// Rule B + E: This page is the offline fallback for document requests.
// next-pwa precaches this page and serves it when:
//   1. The user is offline, AND
//   2. The requested page is not already in the 'pages' cache (NetworkFirst strategy).
// Referenced by: fallbacks: { document: '/_offline' } in next.config.js

export default function OfflinePage() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#0f0f13",
          color: "#e4e4e7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "2rem" }}>
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📡</div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
              color: "#a5b4fc",
            }}
          >
            You&apos;re offline
          </h1>
          <p
            style={{
              color: "#a1a1aa",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            Memory Lane couldn&apos;t load this page. Check your connection and try again — your
            previously visited pages are still available.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#6366f1",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              padding: "0.75rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
