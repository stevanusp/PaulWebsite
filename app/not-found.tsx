import type { Metadata } from "next";
import { notFound as copy, site } from "@/content/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Not found. ${site.name}`,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="nf-page">
      <main id="main" className="nf-main">
        <p className="nf-code">404</p>
        <h1 className="nf-title sheen">{copy.title}</h1>
        <p className="nf-body">{copy.body}</p>
        <Link className="pill pill-solid" href="/">
          {copy.link}
        </Link>
      </main>
    </div>
  );
}
