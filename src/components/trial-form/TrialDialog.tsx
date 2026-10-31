// Modal shell copied from app-englishpusher: src/shared/TrialLessonForm.tsx (backdrop press that
// starts and ends on it, close button, Escape, scroll lock, form kept mounted between openings).
// Landing changes (ADR-0002): no button of its own — the page's plain <a href="#trial-lesson">
// links open it (on load, on hashchange, and by intercepting their clicks once hydrated); closing
// removes the hash; Tab is trapped inside; the page behind is inert; focus returns to the link
// that opened the window, or to the first Book link. The rules live in src/lib/dialog.ts.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import TrialForm from "./TrialForm.tsx";
import { EMPTY_VALUES, type TrialFormValues } from "../../lib/options.ts";
import { goalsAfterOpening, mergeGoals } from "../../lib/goals.ts";
import { pushEvent } from "../../lib/events.ts";
import { FORM_COPY } from "../../lib/formCopy.ts";
import {
  CLOSED,
  TRIAL_HASH,
  dialogStep,
  shouldOpenOnHash,
  urlWithoutHash,
  type DialogAction,
  type DialogState,
} from "../../lib/dialog.ts";

const LINK_SELECTOR = `a[href="${TRIAL_HASH}"]`;
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([tabindex='-1'])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function TrialDialog() {
  const [open, setOpen] = useState(false);
  // The form is mounted on first open and then kept (only hidden), so typed answers and a send in
  // progress survive closing. Answers live only in this component's memory (sad §8 Privacy).
  const [mounted, setMounted] = useState(false);
  const [values, setValues] = useState<TrialFormValues>(EMPTY_VALUES);
  const [formKey, setFormKey] = useState(0);
  const state = useRef<DialogState>(CLOSED);
  const opener = useRef<HTMLElement | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  // A click only closes the window when it both started and ended on the backdrop (a
  // text-selection drag out of an input must not close it).
  const pressedOnBackdrop = useRef(false);
  // Goals picked on the page, kept until the next opening so a form reset does not drop them.
  const pickedGoals = useRef<string[]>([]);

  const dispatch = useCallback((action: DialogAction) => {
    const step = dialogStep(state.current, action);
    state.current = step.state;
    if (step.resetForm) {
      const picked = pickedGoals.current;
      setValues({ ...EMPTY_VALUES, goals: goalsAfterOpening([], picked, true) });
      setFormKey((k) => k + 1);
    }
    if (action === "open") pickedGoals.current = [];
    for (const event of step.events) pushEvent(window as { dataLayer?: unknown[] }, event);
    if (step.state.open) setMounted(true);
    setOpen(step.state.open);
  }, []);

  const openWindow = useCallback(
    (from: HTMLElement | null) => {
      if (!state.current.open) opener.current = from;
      dispatch("open");
    },
    [dispatch],
  );

  const closeWindow = useCallback(() => {
    if (!state.current.open) return;
    dispatch("close");
    if (shouldOpenOnHash(window.location.hash)) {
      window.history.replaceState(window.history.state, "", urlWithoutHash(window.location.href));
    }
  }, [dispatch]);

  // Open on a #trial-lesson address (on load and on hashchange) and on clicks on the Book links.
  useEffect(() => {
    if (shouldOpenOnHash(window.location.hash)) openWindow(null);
    const onHashChange = () => {
      if (shouldOpenOnHash(window.location.hash)) openWindow(null);
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.(LINK_SELECTOR);
      if (!(link instanceof HTMLElement)) return;
      e.preventDefault();
      openWindow(link);
    };
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
    };
  }, [openWindow]);

  // Goals picked in the page's goal picker (redesign spec): tick them in the form. The picker sets
  // window.__pendingTrialGoals (read once on mount, for a click before hydration) and dispatches
  // a "trial:goals" event (for clicks after hydration).
  useEffect(() => {
    const page = window as Window & { __pendingTrialGoals?: unknown };
    const addGoals = (goals: unknown) => {
      if (!Array.isArray(goals)) return;
      const picked = goals.filter((goal): goal is string => typeof goal === "string");
      setValues((v) => ({ ...v, goals: mergeGoals(v.goals, picked) }));
    };
    addGoals(page.__pendingTrialGoals);
    delete page.__pendingTrialGoals;
    const onGoals = (e: Event) => {
      const goals = (e as CustomEvent<{ goals?: unknown }>).detail?.goals;
      // Kept for the opening that follows this event, which may reset the form first.
      if (Array.isArray(goals)) pickedGoals.current = goals.filter((g): g is string => typeof g === "string");
      addGoals(goals);
      delete page.__pendingTrialGoals;
    };
    window.addEventListener("trial:goals", onGoals);
    return () => window.removeEventListener("trial:goals", onGoals);
  }, []);

  // While open: Escape closes, Tab stays inside, the page behind is inert and does not scroll, focus
  // goes to the first field. On close: undo all that, then return focus to the opener.
  useEffect(() => {
    if (!open) return;
    const root = windowRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeWindow();
        return;
      }
      if (e.key !== "Tab" || !root) return;
      const items = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0,
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !root.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !root.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    const madeInert: HTMLElement[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el instanceof HTMLElement && root && !el.contains(root) && !el.inert) {
        el.inert = true;
        madeInert.push(el);
      }
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    (document.getElementById("tf-firstname") ?? root)?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      for (const el of madeInert) el.inert = false;
      document.body.style.overflow = previousOverflow;
      const target = opener.current?.isConnected
        ? opener.current
        : document.querySelector<HTMLElement>(LINK_SELECTOR);
      target?.focus();
    };
  }, [open, closeWindow]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 overflow-y-auto bg-black/50 ${open ? "block" : "hidden"}`}
      role="dialog"
      aria-modal="true"
      aria-label={FORM_COPY.dialog.label}
    >
      <div
        className="flex min-h-full items-center justify-center px-4 pb-6 pt-20"
        onPointerDown={(e) => {
          pressedOnBackdrop.current = e.target === e.currentTarget;
        }}
        onClick={(e) => {
          if (pressedOnBackdrop.current && e.target === e.currentTarget) closeWindow();
        }}
      >
        <div
          ref={windowRef}
          tabIndex={-1}
          className="relative w-full max-w-[520px] rounded-3xl bg-white px-5 pb-6 pt-4 shadow-xl outline-none sm:px-8"
        >
          <button
            type="button"
            onClick={closeWindow}
            aria-label={FORM_COPY.dialog.close}
            className="absolute right-3 top-3 z-10 rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
          >
            <X size={20} />
          </button>
          <TrialForm
            key={formKey}
            values={values}
            onChange={setValues}
            onClose={closeWindow}
            onSent={() => dispatch("sent")}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
