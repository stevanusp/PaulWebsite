"use client";

import { useEffect, useState } from "react";
import MobileNav from "@/components/MobileNav";
import ThemeToggle from "@/components/ThemeToggle";

type Link = { href: string; label: string };

export default function SiteHeader({ links }: { links: Link[] }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const updateHeader = () => setCompact(window.scrollY > 28);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className={`site-header ${compact ? "is-compact" : ""}`}>
      <div className="site-header-inner">
        <a href="#top" className="brand-mark" aria-label="Stevanus Paulus — home">
          <span className="brand-monogram">P</span>
          <span className="brand-name">Stevanus Paulus</span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <MobileNav links={links} />
        </div>
      </div>
    </header>
  );
}
