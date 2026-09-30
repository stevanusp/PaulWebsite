import type { Metadata } from "next";
import { notFound as copy, site } from "@/content/site";
import Link from "next/link";
import NotFoundSignal from "@/components/NotFoundSignal";

export const metadata: Metadata = {
  title: `Not found. ${site.name}`,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="nf-page">
      <header className="container nf-header">
        <Link className="nf-brand" href="/">
          {site.name}
        </Link>
      </header>
      <main id="main" className="container nf-main">
        <p className="mono nf-code">404</p>
        <h1 className="nf-title">{copy.title}</h1>
        <p className="nf-body">{copy.body}</p>
        <Link className="nf-button" href="/">
          {copy.link}
        </Link>
      </main>
      <NotFoundSignal label="404" />
    </div>
  );
}
