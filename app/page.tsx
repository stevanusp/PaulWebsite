import ThemeToggle from "@/components/ThemeToggle";
import MobileNav from "@/components/MobileNav";
import StatusLine from "@/components/StatusLine";
import Reveal from "@/components/Reveal";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#focus", label: "Focus" },
  { href: "#off-duty", label: "Off-duty" },
  { href: "#writing", label: "Writing" },
  { href: "#contact", label: "Contact" },
];

const FACTS = [
  { label: "LOCATION", value: "Jakarta, ID" },
  { label: "FOCUS", value: "NAC · Cisco Secure Access · Proxy" },
  { label: "CERT", value: "CompTIA Security+ (CySA+ in progress)" },
  { label: "EDU", value: "B.Sc. Computer Science" },
];

// TODO: replace these placeholder years with your real timeline.
const EXPERIENCE = [
  {
    period: "2024 — Present",
    title: "Cybersecurity Specialist, Group IT Security",
    org: "PT Bank Central Asia (BCA)",
    body: "Working on Network Access Control (Forescout) and Cisco Secure Access, with supporting responsibility for IPS and proxy infrastructure.",
  },
  {
    period: "2024",
    title: "CompTIA Security+",
    org: "Certification",
    body: "Currently working toward CySA+ through internal BCA training.",
  },
  {
    period: "2019 — 2023",
    title: "B.Sc. Computer Science",
    org: "BINUS University, Bandung",
    body: "Foundation in networking, systems, and software that led into a security-focused career.",
  },
];

const FOCUS_AREAS = [
  {
    tag: "NAC",
    title: "Network Access Control",
    body: "Deploying and tuning Forescout so only trusted, compliant devices ever touch the network — policy work that's more triage than checklist.",
  },
  {
    tag: "CSA",
    title: "Secure Access",
    body: "Migrating and hardening Cisco Secure Access from Umbrella, keeping policy enforcement consistent as the edge keeps moving.",
  },
  {
    tag: "IPS",
    title: "IPS & Proxy",
    body: "Keeping intrusion prevention and web proxy layers tuned against real traffic patterns, not just the vendor's default ruleset.",
  },
];

const MODULES = [
  {
    tag: "PN",
    title: "Piano, by ear",
    body: "No sheet music — just pattern-matching chords until something clicks into place.",
  },
  {
    tag: "AU",
    title: "Audiophile gear",
    body: "Collecting opinions on DACs and amps almost as much as the gear itself.",
  },
  {
    tag: "SN",
    title: "Sneakers",
    body: "A shelf that outgrew its shelf about two pairs ago.",
  },
  {
    tag: "GM",
    title: "Gaming",
    body: "Xbox Series X and a ROG Ally X, mostly running Overwatch 2 and Forza Horizon.",
  },
  {
    tag: "HL",
    title: "Hololive",
    body: "HoloEN enjoyer, running on borrowed sleep whenever there's a debut.",
  },
  {
    tag: "PD",
    title: "Podcasts",
    body: "Mental health and politics shows, usually on the Jakarta–Bandung drive.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* ---------- Nav ---------- */}
      <header className="sticky top-0 z-20 border-b border-border bg-bg">
        <div className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <a href="#top" className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight text-ink">
            <span className="flex h-7 w-7 items-center justify-center rounded-md border border-accent text-accent">
              P
            </span>
            spm<span className="text-accent">.sys</span>
          </a>
          <nav className="hidden gap-6 font-mono text-xs uppercase tracking-wide text-muted sm:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-accent">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <MobileNav links={NAV_LINKS} />
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section id="top" className="mx-auto max-w-5xl px-6 pt-20 pb-24 sm:pt-28 sm:pb-32">
        <div id="top-content" className="reveal flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-accent font-mono text-2xl font-semibold text-accent sm:h-16 sm:w-16 sm:text-3xl">
            P
          </span>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent2">
            Jakarta · Group IT Security
          </p>
        </div>
        <h1 className="reveal mt-6 font-mono text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-7xl">
         Stevanus Paulus
        </h1>
        <p
          className="reveal mt-6 max-w-prose text-lg leading-relaxed text-muted sm:text-xl"
          style={{ animationDelay: "120ms" }}
        >
          Cybersecurity analyst who spends office hours reading network traffic
          like tea leaves, and off hours playing piano without sheet music,
          chasing better DACs, and losing shelf space to sneakers.
        </p>
        <div className="reveal mt-8" style={{ animationDelay: "220ms" }}>
          <StatusLine />
        </div>
        <div className="reveal mt-10 flex flex-wrap gap-4" style={{ animationDelay: "300ms" }}>
          <a
            href="#experience"
            className="rounded-full bg-ink px-5 py-2.5 font-mono text-sm text-bg transition-opacity hover:opacity-85"
          >
            View experience
          </a>
          <a
            href="#contact"
            className="rounded-full border border-border px-5 py-2.5 font-mono text-sm text-ink transition-colors hover:border-accent hover:text-accent"
          >
            Say hi
          </a>
        </div>
      </section>

      {/* ---------- About ---------- */}
      <Section id="about" eyebrow="01" title="About">
        <div className="grid gap-10 sm:grid-cols-[1.3fr_1fr]">
          <Reveal className="space-y-4 text-base leading-relaxed text-muted sm:text-lg">
            <p>
              I analyze and defend network access at PT Bank Central Asia&apos;s
              Group IT Security division — currently deep in NAC (Forescout)
              and Cisco Secure Access, with proxy and IPS work on the side.
              Security+ certified, working toward CySA+.
            </p>
            <p>
              Off the clock I&apos;m usually at a keyboard that isn&apos;t a
              computer&apos;s, comparing headphone amps I don&apos;t strictly
              need, or a few episodes deep into a Hololive VOD.
            </p>
          </Reveal>
          <Reveal>
            <dl className="space-y-4 self-start rounded-lg border border-border bg-surface p-5 font-mono text-sm">
              {FACTS.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-xs uppercase tracking-wide text-accent2">{fact.label}</dt>
                  <dd className="mt-1 text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </Section>

      {/* ---------- Experience ---------- */}
      <Section id="experience" eyebrow="02" title="Experience">
        <ol className="space-y-8">
          {EXPERIENCE.map((item) => (
            <Reveal key={item.title}>
              <li className="grid gap-2 border-l-2 border-border pl-6 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <span className="font-mono text-xs uppercase tracking-wide text-accent2">
                  {item.period}
                </span>
                <div>
                  <h3 className="font-mono text-base font-semibold text-ink">{item.title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{item.org}</p>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">{item.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </Section>

      {/* ---------- Focus ---------- */}
      <Section id="focus" eyebrow="03" title="Focus">
        <div className="stagger grid gap-5 sm:grid-cols-3">
          {FOCUS_AREAS.map((item) => (
            <Reveal key={item.tag}>
              <Card tag={item.tag} title={item.title} body={item.body} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- Off-duty ---------- */}
      <Section id="off-duty" eyebrow="04" title="Off-duty">
        <div className="stagger grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((item) => (
            <Reveal key={item.tag}>
              <Card tag={item.tag} title={item.title} body={item.body} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- Writing ---------- */}
      <Section id="writing" eyebrow="05" title="Writing">
        <Reveal>
          <blockquote className="rounded-lg border border-border bg-surface p-8 sm:p-10">
            <p className="max-w-prose text-lg leading-relaxed text-ink sm:text-xl">
              I write, mostly for myself — verses that borrow their structure
              from the rap I grew up on, saying things a status update never
              could.
            </p>
            <p className="mt-4 font-mono text-sm text-muted">Ask if you want to read one.</p>
          </blockquote>
        </Reveal>
      </Section>

      {/* ---------- Contact ---------- */}
      <Section id="contact" eyebrow="06" title="Contact">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-prose text-base leading-relaxed text-muted sm:text-lg">
              Based in Jakarta, reachable anywhere. Reach out about security
              work, a piano recommendation, or your pick for the next HoloEN
              debut.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:hello@paulus.dev"
                className="rounded-full bg-ink px-5 py-2.5 font-mono text-sm text-bg transition-opacity hover:opacity-85"
              >
                Email me
              </a>
              <a
                href="/resume.pdf"
                className="rounded-full border border-border px-5 py-2.5 font-mono text-sm text-ink transition-colors hover:border-accent hover:text-accent"
              >
                Résumé
              </a>
              <a
                href="https://linkedin.com/in/your-handle"
                className="rounded-full border border-border px-5 py-2.5 font-mono text-sm text-ink transition-colors hover:border-accent hover:text-accent"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/your-handle"
                className="rounded-full border border-border px-5 py-2.5 font-mono text-sm text-ink transition-colors hover:border-accent hover:text-accent"
              >
                GitHub
              </a>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-8 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Stevanus Paulus. Built with Next.js &amp; Tailwind.</p>
          <p>Toggle the sky above ↑</p>
        </div>
      </footer>
    </main>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 border-t border-border">
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="mb-10 flex items-baseline gap-3">
          <span className="font-mono text-xs text-accent2">{eyebrow}</span>
          <h2 className="font-mono text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Card({ tag, title, body }: { tag: string; title: string; body: string }) {
  return (
    <div className="group h-full rounded-lg border border-border bg-surface p-6 transition-colors hover:border-accent">
      <span className="inline-flex h-8 w-10 items-center justify-center rounded border border-border font-mono text-xs text-accent2 transition-colors group-hover:border-accent group-hover:text-accent">
        {tag}
      </span>
      <h3 className="mt-4 font-mono text-base font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}
