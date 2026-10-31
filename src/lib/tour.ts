// The "How it works" tour strip: every word it shows lives here, so Tetiana reviews one file
// (release checklist §2). Interim copy rule AC-10 applies: no price, "free", lesson length or
// learning result. tour.test.ts checks this with findPromises and checks each image's size.
export interface TourSlide {
  step: number; // 1..5, display order
  title: string;
  caption: string;
  image: string; // path under public/
  alt: string;
  width: number; // intrinsic pixel size of the image file
  height: number;
}

export const TOUR_HEADING = {
  title: "How it works", // eyebrow
  subline: "From your first message to practice between lessons", // h2
} as const;

// The three facts from the dropped "What lessons look like" block (redesign spec).
export const TOUR_FACTS = [
  "One-to-one on a video call",
  "Your own course in Moodle",
  "Practice app between lessons",
] as const;

export const TOUR_LABELS = {
  previous: "Previous slide",
  next: "Next slide",
} as const;

// Screenshots are 390×844 CSS px captured at 2× pixel ratio.
const W = 780;
const H = 1688;

export const TOUR_SLIDES: readonly TourSlide[] = [
  {
    step: 1,
    title: "Book a trial lesson",
    caption: "Tell Tetiana about yourself, your level and your goals.",
    image: "/tour/1-trial.webp",
    alt: "The trial lesson form, with fields for name, email, English level and goals",
    width: W,
    height: H,
  },
  {
    step: 2,
    title: "Your course space",
    caption: "Lesson materials and homework in Moodle.",
    image: "/tour/2-moodle.webp",
    alt: "A Moodle lesson page with an audio player and a word-matching exercise",
    width: W,
    height: H,
  },
  {
    step: 3,
    title: "Practise new words",
    caption: "Flashcards in the EnglishPusher app, between lessons.",
    image: "/tour/3-flashcards.webp",
    alt: "A B1 vocabulary flashcard in the EnglishPusher app",
    width: W,
    height: H,
  },
  {
    step: 4,
    title: "English for work",
    caption: "C1 vocabulary for work: leadership, innovation and business writing.",
    image: "/tour/4-business.webp",
    alt: "A C1 flashcard from the Writing CEO Communication topic",
    width: W,
    height: H,
  },
  {
    step: 5,
    title: "Check your grammar",
    caption: "Short grammar tests, topic by topic.",
    image: "/tour/5-grammar.webp",
    alt: "A grammar test question in the EnglishPusher grammar app",
    width: W,
    height: H,
  },
];
