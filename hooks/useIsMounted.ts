import { useState, useEffect } from "react";

/**
 * Hook to detect if a component has successfully mounted in the browser.
 * Use this to avoid hydration mismatches when a client component renders
 * different content on the server than what it immediately renders on the client.
 */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
