// Every visible string on the site lives here. Components never hardcode copy.
// House rule: no em dash characters anywhere. Use commas, colons or periods.

export const site = {
  name: "Stevanus Paulus",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://aboutspm.vercel.app",
  email: "stevanuspmp@gmail.com",
  linkedin: "https://www.linkedin.com/in/stevanuspmp/",
  resume: "/resume.pdf",
  title: "Stevanus Paulus, cybersecurity analyst",
  description:
    "Cybersecurity analyst in Jakarta working on network access control, web security and detection. Open to network security roles in Singapore, Australia and Europe.",
} as const;

export const nav = [
  { id: "work", label: "Work" },
  { id: "notes", label: "Field notes" },
  { id: "built", label: "Built" },
  { id: "path", label: "Path" },
  { id: "ear", label: "By ear" },
  { id: "contact", label: "Contact" },
] as const;

export const hero = {
  title: "I listen for what doesn't belong.",
  words: ["I", "listen", "for", "what", "doesn't", "belong."],
  lead:
    "I'm Stevanus Paulus, a cybersecurity analyst at BCA, Indonesia's largest private bank. I work where devices meet the network: deciding what gets in, what gets inspected, and what gets stopped.",
  status: "Based in Jakarta. Open to network security roles in Singapore, Australia and Europe.",
  primary: "Email me",
  secondary: "Résumé",
  secondaryMeta: "PDF",
  signalLabel: "anomaly",
  signalHint: "poke the line",
  hud: { live: "listening", flagged: "flagged" },
  signalDescription:
    "A live signal line. Every few seconds a burst breaks the pattern and is flagged as an anomaly.",
} as const;

export type Step = { title: string; body: string };

export const method = {
  title: "How I listen",
  steps: [
    {
      title: "Learn what normal sounds like.",
      body: "Before I change a policy, I watch the traffic: which devices join, when, from where, and what they talk to. Normal has a shape, and every network's is different.",
    },
    {
      title: "Notice what doesn't belong.",
      body: "Most alerts are noise. The ones that matter break the pattern: a device that shouldn't be there, a request that shouldn't leave.",
    },
    {
      title: "Respond without breaking work.",
      body: "Contain what's wrong and keep everyone else working. Then explain the decision in plain words, so it can be audited and maintained.",
    },
  ] satisfies Step[],
  labels: { normal: "normal", anomaly: "doesn't belong", contained: "contained" },
  description:
    "A signal line in three states: a band marking the normal range, a burst breaking out of it, and the burst boxed in and contained while the rest of the line keeps moving.",
} as const;

export const work = {
  title: "What I work on",
  intro:
    "Inside a regulated bank's security stack since 2023, and six years before that as a one-person IT department.",
  rows: [
    {
      title: "Network access control",
      body: "Deciding which devices are trusted to join the network, by identity, posture and behavior, across branches and data centers.",
    },
    {
      title: "Web security at the edge",
      body: "Proxy and secure web gateway policy for a bank-wide fleet, from on-premise appliances to a cloud security edge.",
    },
    {
      title: "Detection and data loss prevention",
      body: "Tuning intrusion prevention against real traffic instead of vendor defaults, and inspecting what leaves, including traffic headed to AI tools.",
    },
  ],
} as const;

export const notes = {
  title: "Field notes",
  scenes: {
    branchesLabel: "branches",
    branchesTotal: "83+",
    lanes: ["requester", "approver", "audit"],
  },
  intro: "A few things from the job, told without the parts that should stay inside the bank.",
  items: [
    {
      scene: "branches",
      title: "A cloud edge for 83+ branches",
      body: "Part of the team that moved web security for more than 83 branches onto a cloud security edge, keeping policy behavior consistent while the network underneath kept changing.",
    },
    {
      scene: "lanes",
      title: "Making process legible",
      body: "Wrote the SOPs, RACI matrices and swimlane flows for how proxy exceptions are requested and approved, so decisions stop living in one person's head.",
    },
  ],
} as const;

export const built = {
  title: "Built after hours",
  items: [
    {
      title: "Hermes",
      body: "A personal AI agent that lives in Discord. Running it taught me more about prompt injection than any paper: an agent that reads files will also read the instructions hidden inside them.",
      stack: "python, llm apis, discord",
    },
    {
      title: "Mission Control",
      body: "A dashboard to watch and steer a small crew of specialised agents: tasks, calendar, memory and docs in one place. Built first for a client who runs a music school.",
      stack: "next.js, typescript",
    },
    {
      title: "Self-audit kit",
      body: "A local-only tool my sister and I use to check our own data exposure, keep encrypted evidence, and see what our laptops talk to. The code is deliberately never published.",
      stack: "flask, argon2, aes-256-gcm, sqlite, mitmproxy",
    },
    {
      title: "Respawn",
      body: "A small resale business for secondhand electronics, run on unit economics I can explain on one page.",
      stack: "",
    },
  ],
} as const;

export const path = {
  title: "Path",
  items: [
    {
      when: "2023 to now",
      role: "Cyber Security Analyst",
      org: "Group IT Security, BCA",
      note: "Network access control, web security, detection.",
    },
    {
      when: "2024",
      role: "CompTIA Security+",
      org: "Certification",
      note: "Valid through 2027. CySA+ in progress.",
    },
    {
      when: "2022",
      role: "Founder and full-stack developer",
      org: "EdooMoo",
      note: "Built a learning platform end to end, from product to operations.",
    },
    {
      when: "2020",
      role: "Co-founder, operations",
      org: "Rooma Living",
      note: "Ran operations and hiring for a furniture startup. It closed; the lessons stayed.",
    },
    {
      when: "2018 to 2023",
      role: "B.Sc. Computer Science",
      org: "BINUS University, Bandung",
      note: "",
    },
    {
      when: "2017 to 2023",
      role: "Sole IT engineer",
      org: "Zalmon Fabric",
      note: "The whole IT department: network, systems, internal apps and support.",
    },
  ],
} as const;

export const ear = {
  title: "By ear",
  lead: "I play piano without sheet music. I hear a chord, find it, then look for the next one.",
  body: "It's the same habit I bring to traffic: learn what normal sounds like, and the wrong note announces itself. Away from the keys I'm an audiophile, which mostly means strong opinions about DACs, amplifiers, and the difference between a clean signal and a loud one.",
  photo: {
    src: "/media/paulus-at-the-keys.jpg",
    width: 360,
    height: 540,
    alt: "Stevanus playing a keyboard at a live event, beside a singer at the microphone.",
  },
  song: {
    title: "It's been a while",
    note: "A song I wrote.",
    src: "/media/its-been-a-while.m4a",
    seconds: 52,
    play: "Play",
    pause: "Pause",
    seek: "Song position",
  },
  tryLabel: "Or play it yourself",
  caption: "The four chords a lot of pop songs are built on. Tap a pad",
  captionKeys: ", or press 1 to 5",
  scopeLabel: "scope",
  idleLabel: "tap a pad",
  found: "You found it: I, V, vi, IV.",
  wrongName: "F#",
  wrongDegree: "?",
  wrongPlay: "play a note that is not in the key",
  wrongLabel: "doesn't belong",
  wrongLine: "That one doesn't belong. F sharp is outside the key of C.",
  chords: [
    { name: "C", degree: "I", label: "C major" },
    { name: "G", degree: "V", label: "G major" },
    { name: "Am", degree: "vi", label: "A minor" },
    { name: "F", degree: "IV", label: "F major" },
  ],
} as const;

export const contact = {
  title: "Say hello.",
  line: "If you're hiring for network or cloud security, I'd like to hear from you.",
  copy: "Copy",
  copied: "Copied",
  linkedin: "LinkedIn",
  resume: "Résumé (PDF)",
} as const;

export const footer = {
  left: "© 2026 Stevanus Paulus. Designed and built in Jakarta.",
  right: "No cookies. No trackers. Strict CSP.",
} as const;

export const notFound = {
  title: "This page doesn't belong.",
  body: "The address you followed doesn't exist here.",
  link: "Back to the homepage",
} as const;
