// Every word the redesigned landing page shows outside the trial form and the tour (redesign
// spec, "Copy"). Tetiana approves this file before publishing (release checklist §2). Interim copy
// rule AC-10 applies: no price, "free", lesson length or learning result — landingCopy.test.ts
// checks it with findPromises. Tile values are the trial form's GOALS values (options.ts).
import type { GOALS } from "./options.ts";

export type GoalValue = (typeof GOALS)[number]["value"];

export interface GoalTile {
  value: GoalValue;
  label: string; // on the tile and in the floating bar
  line: string;
  chat?: readonly [string, string]; // IT English only: a two-line code-review exchange
}

export const HERO = {
  badge: "One-to-one lessons, online",
  title: "English lessons with",
  titleHighlight: "Tetiana",
  subline: "Individual English lessons for adults and IT professionals.",
  goalsLink: "What do you want English for?",
  tags: ["General English", "English for IT", "Business English"],
} as const;

export const MARQUEE = ["General English", "Business English", "English for IT", "One-to-one", "Online"] as const;

const TILES: readonly GoalTile[] = [
  {
    value: "it_english",
    label: "IT English",
    line: "Stand-ups, code reviews, tickets and calls with your team.",
    chat: ["Can we sync on the PR before the release?", "Sure, I'll leave my comments by noon."],
  },
  { value: "work_business", label: "Work & business", line: "Emails, meetings and presentations." },
  { value: "speaking", label: "Speaking practice", line: "Talk more, in a calm one-to-one setting." },
  { value: "travel", label: "Travel", line: "Airports, hotels, directions and small talk." },
  { value: "everyday_life", label: "Everyday life", line: "Shops, doctors, neighbours, films and news." },
  { value: "other", label: "Something else", line: "Tell Tetiana what you need." },
];

export const PICKER = {
  eyebrow: "Who it's for",
  title: "What do you want English for?",
  subline: "Pick everything that fits. Tetiana builds the lessons around it.",
  chosenLabel: "Your goals:",
  tiles: TILES,
} as const;

export const MEET = {
  eyebrow: "Meet Tetiana",
  title: "Hi, I'm Tetiana",
  paragraph:
    "I teach English one-to-one, online, to adults and IT professionals. Between our lessons you'll find video lessons, quizzes and exercises on the EnglishPusher website, plus flashcards and grammar tests in the app.",
  ring: "ENGLISHPUSHER · ENGLISH WITH TETIANA · ONE-TO-ONE · ONLINE · ",
  instagram: "Instagram",
  linkedin: "LinkedIn",
} as const;

export const CTA = {
  title: "Start with a trial lesson",
  line: "Tell Tetiana a little about yourself. She will get in touch to arrange a time.",
} as const;

export const FOOTER = {
  line: "English lessons with Tetiana Pushkar",
  instagram: "Instagram",
  linkedin: "LinkedIn",
} as const;

// Transparent WebP mascots in public/, about 2× their display width (Task 3 converts them).
export const MASCOTS = {
  wave: { src: "/mascot-wave.webp", width: 760, height: 714 },
  thinking: { src: "/mascot-thinking.webp", width: 300, height: 325 },
  celebrate: { src: "/mascot-celebrate.webp", width: 620, height: 665 },
} as const;

export function allLandingText(): string[] {
  return [
    HERO.badge,
    HERO.title,
    HERO.titleHighlight,
    HERO.subline,
    HERO.goalsLink,
    ...HERO.tags,
    ...MARQUEE,
    PICKER.eyebrow,
    PICKER.title,
    PICKER.subline,
    PICKER.chosenLabel,
    ...PICKER.tiles.flatMap((tile) => [tile.label, tile.line, ...(tile.chat ?? [])]),
    MEET.eyebrow,
    MEET.title,
    MEET.paragraph,
    MEET.ring,
    MEET.instagram,
    MEET.linkedin,
    CTA.title,
    CTA.line,
    FOOTER.line,
    FOOTER.instagram,
    FOOTER.linkedin,
  ];
}
