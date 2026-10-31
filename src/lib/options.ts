// Copied from app-englishpusher: src/shared/trialForm/options.ts
// (a copy, not a shared package — a HubSpot field change goes into both repos).
// Landing addition: LINKEDIN_URL (footer and send-failed message).
// ---------------------------------------------------------------------------
// Choices in the trial lesson form and the values HubSpot expects for them.
// english_level is an existing HubSpot dropdown: values must match its option
// text exactly (EN DASH). learning_goals is a HubSpot checkbox property with
// these internal values.
// ---------------------------------------------------------------------------

export const LEVELS = [
  { short: "A1", value: "A1 – Beginner" },
  { short: "A2", value: "A2 – Elementary" },
  { short: "B1", value: "B1 – Intermediate" },
  { short: "B2", value: "B2 – Upper-Intermediate" },
  { short: "C1", value: "C1 – Advanced" },
  { short: "Not sure", value: "Not sure" },
] as const;

export const GOALS = [
  { emoji: "🗣", label: "Speaking confidence", value: "speaking" },
  { emoji: "💼", label: "Work / Business", value: "work_business" },
  { emoji: "💻", label: "IT English", value: "it_english" },
  { emoji: "✈️", label: "Travel", value: "travel" },
  { emoji: "🏠", label: "Everyday life", value: "everyday_life" },
  { emoji: "✨", label: "Other", value: "other" },
] as const;

export const INSTAGRAM_URL = "https://www.instagram.com/teti_push_english";
export const LINKEDIN_URL = "https://www.linkedin.com/in/tanya-pushkar/";

export type TrialFormValues = {
  firstname: string;
  email: string;
  level: string; // a LEVELS value, or "" when not chosen
  goals: string[]; // GOALS values
  messenger: string;
  message: string;
};

export const EMPTY_VALUES: TrialFormValues = {
  firstname: "",
  email: "",
  level: "",
  goals: [],
  messenger: "",
  message: "",
};
