"use client";

import { useEffect } from "react";
import { site } from "@/content/site";

// A note for the people who open DevTools on a security analyst's site.
export default function ConsoleNote() {
  useEffect(() => {
    const w = window as Window & { __paulusNote?: boolean };
    if (w.__paulusNote) return;
    w.__paulusNote = true;
    console.log(
      "%cHi. If you're reading the console, you're probably checking the headers too.",
      "font: 600 14px/1.5 ui-sans-serif, system-ui, sans-serif;",
    );
    console.log(
      `%cNo cookies, no trackers, a hash-based CSP. Say hello: ${site.email}`,
      "font: 13px/1.5 ui-monospace, Menlo, monospace; color: #8a9097;",
    );
  }, []);
  return null;
}
