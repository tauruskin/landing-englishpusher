// Every visible or spoken string of the trial form (TrialForm.tsx, TrialDialog.tsx), in one place. This is Interim copy:
// Tetiana approves it before the page is published, and formCopy.test.ts checks it against the
// "Interim copy makes no promises" rule (AC-10), because the built-page check cannot see the form.
export const FORM_COPY = {
  dialog: { label: "Book a trial lesson", close: "Close" }, // screen-reader labels of TrialDialog
  avatarAlt: "Tutor Tetiana waving",
  headline: "Book a trial lesson with Tetiana",
  subline: "Tell me a little about yourself and I'll get back to you soon.",
  fields: {
    firstname: "First name",
    email: "Email",
    level: "Your English level",
    goals: "What's your goal?",
    goalsHint: "(choose any)",
    messenger: "Telegram, Viber or phone",
    messengerPlaceholder: "@username or +380…",
    message: "Message",
    messagePlaceholder: "Anything I should know? Preferred time, topics…",
    optionalHint: "(optional)",
    trap: "Website",
  },
  submit: "Book a trial lesson",
  sendFailed: {
    before: "Sorry, your request did not go through. Please try again or write to me on",
    instagram: "Instagram",
    or: "or",
    linkedin: "LinkedIn",
    after: ".",
  },
  thankYou: {
    heading: (firstname: string) => `Thank you, ${firstname}! 🎉`,
    line: "I'll contact you soon.",
    close: "Close",
  },
} as const;
