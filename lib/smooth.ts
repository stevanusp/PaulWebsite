// The page's smooth scroll, shared so other parts can pause it (the hidden page stops it while it
// is open, so the page behind cannot move).

import type Lenis from "lenis";

let page: Lenis | null = null;

export const setPageScroll = (lenis: Lenis | null) => {
  page = lenis;
};

/** The page's Lenis instance, or null when smooth scrolling is off. */
export const pageScroll = () => page;
