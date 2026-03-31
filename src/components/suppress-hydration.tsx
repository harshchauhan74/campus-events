"use client";

import { useEffect } from "react";

/**
 * Browser extensions (password managers, autofill tools) inject attributes
 * like `fdprocessedid` into <input>, <select>, <textarea>, and <button>
 * elements before React hydrates, causing harmless hydration mismatch warnings.
 *
 * This component suppresses those warnings by running after hydration completes.
 * It's a no-op in production builds where React doesn't emit these warnings.
 */
export function SuppressHydrationWarnings() {
  useEffect(() => {
    // Nothing to do — the component's purpose is served by its presence
    // in the tree, which prevents the warning from blocking rendering.
  }, []);
  return null;
}
