import SiteHeader from "@/components/SiteHeader";
import StatusLine from "@/components/StatusLine";
import Reveal from "@/components/Reveal";

const NAV_LINKS = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#focus", label: "Focus" },
  { href: "#impact", label: "Impact" },
  { href: "#off-duty", label: "Off-duty" },
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

const IMPACT_AREAS = [
  {
    number: "01",
    title: "Make access decisions explainable",
    body: "Translate device posture, identity, and network context into policies that operators can understand, audit, and maintain.",
  },
  {
    number: "02",
    title: "Harden without breaking work",
    body: "Approach policy changes as a balance between risk reduction and a reliable day-to-day experience for the people using the network.",
  },
  {
    number: "03",
    title: "Tune for real traffic",
    body: "Use observed network behavior to refine controls instead of relying on a vendor default as the final answer.",
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
      <SiteHeader links={NAV_LINKS} />

      {/* ---------- Hero ---------- */}
      <section id="top" className="relative mx-auto max-w-6xl px-6 pb-24 pt-20 sm:pb-32 sm:pt-28">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_19rem]">
          <div>
            <div id="top-content" className="reveal flex items-center gap-4">
              <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_5px_rgba(23,105,224,0.12)]" />
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent2">Jakarta · Group IT Security</p>
            </div>
            <h1 className="reveal mt-6 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.065em] text-ink sm:text-7xl lg:text-8xl">
              Stevanus Paulus
            </h1>
            <p className="reveal mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl" style={{ animationDelay: "120ms" }}>
              Cybersecurity analyst who spends office hours reading network traffic like tea leaves, and off hours playing piano without sheet music, chasing better DACs, and losing shelf space to sneakers.
            </p>
            <div className="reveal mt-8" style={{ animationDelay: "220ms" }}><StatusLine /></div>
            <div className="reveal mt-10 flex flex-wrap gap-3" style={{ animationDelay: "300ms" }}>
              <a href="#experience" className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5">View experience</a>
              <a href="#contact" className="liquid-surface rounded-full px-5 py-3 text-sm font-medium text-ink transition-colors hover:text-accent">Get in touch</a>
            </div>
          </div>
          <HeroGraphic />
        </div>
      </section>

      {/* ---------- About ---------- */}
      <Section id="about" eyebrow="01" title="Profile">
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
            <dl className="liquid-surface grid grid-cols-2 gap-x-4 gap-y-6 self-start rounded-3xl p-6 font-mono text-sm">
              {FACTS.map((fact) => (
                <div key={fact.label} className="border-l border-border pl-3">
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
        <ol className="space-y-4">
          {EXPERIENCE.map((item) => (
            <Reveal key={item.title}>
              <li className="liquid-surface grid gap-2 rounded-2xl p-5 sm:grid-cols-[10rem_1fr] sm:gap-6 sm:p-6">
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
        <div className="stagger grid gap-4 sm:grid-cols-3">
          {FOCUS_AREAS.map((item) => (
            <Reveal key={item.tag}>
              <Card tag={item.tag} title={item.title} body={item.body} />
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="impact" eyebrow="04" title="How I work">
        <div className="stagger grid gap-4 md:grid-cols-3">
          {IMPACT_AREAS.map((item) => (
            <Reveal key={item.number}>
              <article className="liquid-surface h-full rounded-2xl p-6">
                <span className="font-mono text-xs text-accent2">{item.number}</span>
                <h3 className="mt-4 font-mono text-base font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- Off-duty ---------- */}
      <Section id="off-duty" eyebrow="05" title="Off-duty">
        <div className="stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((item) => (
            <Reveal key={item.tag}>
              <Card tag={item.tag} title={item.title} body={item.body} />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------- Contact ---------- */}
      <Section id="contact" eyebrow="06" title="Contact">
        <Reveal>
          <div className="liquid-surface rounded-3xl p-6 sm:flex sm:items-end sm:justify-between sm:gap-8 sm:p-9">
            <div>
              <p className="max-w-prose text-base leading-relaxed text-muted sm:text-lg">
                Based in Jakarta, reachable anywhere. Reach out about security
                work, a piano recommendation, or your pick for the next HoloEN
                debut.
              </p>
              <a href="mailto:stevanuspmp@gmail.com" className="mt-5 inline-block font-mono text-sm text-accent transition-colors hover:text-accent2">
                stevanuspmp@gmail.com ↗
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 sm:mt-0 sm:shrink-0">
              <a
                href="mailto:stevanuspmp@gmail.com"
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
                href="https://www.linkedin.com/in/stevanuspmp/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border px-5 py-2.5 font-mono text-sm text-ink transition-colors hover:border-accent hover:text-accent"
              >
                LinkedIn ↗
              </a>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* ---------- Footer ---------- */}
      <footer>
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 font-mono text-[10px] uppercase tracking-[0.12em] text-muted sm:flex-row sm:items-center sm:justify-between">
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
    <section id={id} className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:py-20">
        <div className="mb-8 flex items-baseline gap-3 sm:mb-10">
          <span className="font-mono text-[11px] text-accent">{eyebrow}</span>
          <h2 className="text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">
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
    <div className="liquid-surface group h-full rounded-2xl p-6 hover:-translate-y-1">
      <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-lg bg-bg px-2 font-mono text-xs text-accent2 transition-colors group-hover:text-accent">
        {tag}
      </span>
      <h3 className="mt-5 text-lg font-semibold tracking-[-0.025em] text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function HeroGraphic() {
  return (
    <div className="liquid-surface liquid-card reveal hidden rounded-[2rem] p-6 font-mono lg:block" aria-hidden="true">
      <div className="flex items-center justify-between text-xs text-muted"><span>SYSTEM MAP</span><span className="text-accent">LIVE</span></div>
      <svg viewBox="0 0 220 156" className="mt-5 w-full" fill="none">
        <path d="M26 78H92M128 44H190M128 112H190M110 62V94" stroke="var(--border)" strokeWidth="2" />
        <circle cx="26" cy="78" r="12" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
        <circle cx="110" cy="44" r="12" fill="var(--surface)" stroke="var(--accent-2)" strokeWidth="2" />
        <circle cx="110" cy="112" r="12" fill="var(--surface)" stroke="var(--accent-2)" strokeWidth="2" />
        <circle cx="110" cy="78" r="16" fill="var(--text)" />
        <circle cx="194" cy="44" r="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
        <circle cx="194" cy="112" r="12" fill="var(--surface)" stroke="var(--border)" strokeWidth="2" />
        <path d="M101 78h18M110 69v18" stroke="var(--bg)" strokeWidth="2" />
      </svg>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted">identity → posture → policy → access</p>
    </div>
  );
}
