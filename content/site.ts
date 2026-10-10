// Every visible string on the site lives here. Components never hardcode copy.
// The one exception is the hidden post's text, in content/hidden.ts, so it loads only with it.
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

export const ui = {
  toLight: "Switch to light mode",
  toDark: "Switch to dark mode",
  skip: "Skip to content",
  newTab: "(opens in a new tab)",
} as const;

export const hero = {
  title: "I listen for what doesn't belong.",
  words: ["I", "listen", "for", "what", "doesn't", "belong."],
  lead:
    "I'm Stevanus Paulus, a cybersecurity analyst at BCA, Indonesia's largest private bank. I work where devices meet the network: deciding what gets in, what gets inspected, and what gets stopped.",
  status: "Based in Jakarta. Open to network security roles in Singapore, Australia and Europe.",
  primary: "Email me",
  secondary: "Résumé",
  secondaryMeta: "PDF",
  photo: {
    src: "/media/paulus-at-the-keys.jpg",
    width: 360,
    height: 540,
    alt: "Stevanus playing a keyboard at a live event, beside a singer at the microphone.",
  },
} as const;

type Step = { title: string; body: string };

// The story under the hero: three beats at work, then the same habit at the piano.
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
    {
      title: "After hours, the same ears.",
      body: "At night the timeline is a song in Logic Pro: xylophone, bass, violin and piano at 116 bpm, in 3/4. Same habit. Hear the whole thing first, then look closer.",
    },
    {
      title: "Every note belongs to something.",
      body: "Alone, this note sits outside B major. Under a D#7 it is the third, and it leads straight into G#m9. Context decides what is wrong.",
    },
    {
      title: "Then I play it.",
      body: "On an M-Audio Keystation 49, by ear. My favorite loop, in the song's key: Emaj7, D#7, G#m9, C#/E#, F#m7, B7, then around again.",
    },
  ] satisfies Step[],
  listen: "Listen to It's been a while",
  description:
    "An illustration in six steps: a console of network events where one unusual upload is flagged in amber and contained; the same window turning into the song in Logic Pro, with xylophone, bass, violin and piano tracks at 116 bpm in 3/4, B major; a piano roll where one note looks out of key until its D#7 chord appears around it; and a 49-key MIDI keyboard playing the loop Emaj7, D#7, G#m9, C#/E#, F#m7, B7.",
  scene: {
    securityTitle: "Network events",
    musicTitle: "It's been a while",
    search: "Search events",
    range: "Last 15 minutes",
    sources: "All sources",
    live: "Live",
    volume: "Volume",
    times: ["14:00", "14:02", "14:04", "14:06", "14:08", "14:10", "14:12", "14:14"],
    lanes: ["Web proxy", "Network access", "VPN", "DNS"],
    laneCounts: ["1,284 events", "312 events", "41 events", "2,906 events"],
    columns: ["Source", "Event", "Action"],
    feed: [
      ["Web proxy", "Software update", "Allowed"],
      ["Network access", "Laptop joined HQ Wi-Fi", "Trusted"],
      ["VPN", "Remote login", "Allowed"],
      ["Web proxy", "Video call", "Allowed"],
      ["Network access", "Printer joined a branch", "Trusted"],
      ["Web proxy", "Known bad domain", "Blocked"],
      ["Network access", "Unknown device", "Guest only"],
      ["Web proxy", "Mail sync", "Allowed"],
      ["VPN", "Session timed out", "Closed"],
      ["Web proxy", "Cloud sign-in", "Allowed"],
    ],
    flagged: ["Web proxy", "Unusual upload, 2.3 GB", "Review", "Contained"],
    cardAlert: "Unusual upload",
    cardAlertSub: "2.3 GB to an unknown host",
    cardContained: "Contained",
    cardContainedSub: "Everyone else keeps working",
    tracks: ["Xylophone", "Bass", "Violin", "Piano"],
    chordsLabel: "Chords",
    chords: ["Emaj7", "D#7", "G#m9", "C#/E#", "F#m7", "B7"],
    bar: "bar",
    beat: "beat",
    tempo: "116",
    tempoLabel: "bpm",
    meter: "3/4",
    key: "B major",
    editor: "Xylophone",
    editorSub: "Piano roll",
    outside: "Outside B major",
    belongs: "Belongs to D#7",
  },
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
      title: "Data loss prevention",
      body: "Inspecting what leaves the network, including traffic headed to AI tools, so sensitive data stays where it belongs.",
    },
  ],
  description:
    "An illustration: the keys come loose from a 49-key MIDI keyboard and fall; on the way down the white keys gather into a cloud and the black keys into a padlock at its center, and it locks.",
} as const;

export const notes = {
  title: "Field notes",
  intro: "A few things from the job, told without the parts that should stay inside the bank.",
  items: [
    {
      title: "A cloud edge for 83+ branches",
      body: "Part of the team that moved web security for more than 83 branches onto a cloud security edge, keeping policy behavior consistent while the network underneath kept changing.",
    },
    {
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
  now: "Now",
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
  body: "It's the same habit I bring to traffic: learn what normal sounds like, and give an odd note its context before calling it wrong. Away from the keys I'm an audiophile, which mostly means strong opinions about DACs, amplifiers, and the difference between a clean signal and a loud one.",
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
  caption: "My favorite loop, in the song's key. Play the chords, then the lone G after them. Tap a pad",
  fact: "Fun fact: it's the Just the Two of Us progression with one passing chord. In Japan it's called marusa, and YOASOBI's Yoru ni Kakeru uses it in the chorus.",
  captionKeys: ", or press 1 to 7",
  idleLabel: "Tap a pad",
  found: "That's the whole loop. B7 leads it back to Emaj7.",
  note: {
    name: "G",
    sub: "one note",
    play: "play a single G on top of whatever is ringing",
    outside: "Outside B major",
    belongs: "Belongs to D#7",
    outsideLine: "Alone, G sits outside B major. Play D#7 first, then G.",
    belongsLine: "Under D#7, G is the third (written F double sharp). It belongs.",
  },
  chords: [
    { name: "Emaj7", degree: "IV", label: "E major seven" },
    { name: "D#7", degree: "III", label: "D sharp seven" },
    { name: "G#m9", degree: "vi", label: "G sharp minor nine" },
    { name: "C#/E#", degree: "II", label: "C sharp over E sharp" },
    { name: "F#m7", degree: "v", label: "F sharp minor seven" },
    { name: "B7", degree: "I7", label: "B seven" },
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
