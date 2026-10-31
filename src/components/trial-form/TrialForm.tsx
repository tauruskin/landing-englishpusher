// Copied from app-englishpusher: src/shared/trialForm/TrialForm.tsx
// (a copy, not a shared package — a HubSpot field change goes into both repos).
// Landing changes: the answers are owned by the parent (TrialDialog keeps them across openings),
// Send follows planSend() from src/lib/trialSend.ts, and the send goes to the live form only on the
// published host (formIdFor) with the entry address as pageUri. What a result shows and records
// comes from outcomeOf(): the send-failed banner also links LinkedIn and records trial_form_error.
// Every visible string comes from FORM_COPY (src/lib/formCopy.ts), which is checked for AC-10.
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import confetti from "canvas-confetti";
import { Loader2 } from "lucide-react";
import { GOALS, INSTAGRAM_URL, LEVELS, LINKEDIN_URL, type TrialFormValues } from "../../lib/options.ts";
import { pushEvent } from "../../lib/events.ts";
import type { TrialFormErrors } from "../../lib/validate.ts";
import { readEntryAddress, readHutk, submitTrialForm, type SubmitResult } from "../../lib/hubspot.ts";
import { PORTAL_ID, formIdFor } from "../../lib/site.ts";
import { outcomeOf, planSend } from "../../lib/trialSend.ts";
import { FORM_COPY } from "../../lib/formCopy.ts";

// ---------------------------------------------------------------------------
// TrialForm — the "Book a trial lesson" form inside the TrialDialog window.
// Name and email are required; level, goals, messenger and message are
// optional. generate_lead is recorded only after HubSpot confirms the send.
// ---------------------------------------------------------------------------

type Status = "idle" | "sending" | "error" | "done";

const labelClass = "text-sm font-semibold text-neutral-800";

const inputClass = [
  "w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-base text-neutral-900 sm:text-[15px]",
  "placeholder:text-neutral-400 transition-colors",
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20",
].join(" ");

const pillClass = (active: boolean) =>
  [
    "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40",
    active
      ? "border-brand bg-brand text-white shadow-sm"
      : "border-neutral-200 bg-white text-neutral-600 hover:border-brand/50 hover:text-brand",
  ].join(" ");

function Field({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-brand">
            {" "}
            *
          </span>
        )}
        {hint && <span className="font-normal text-neutral-400"> {hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const linkClass = "font-semibold underline";

export type TrialFormProps = {
  values: TrialFormValues;
  onChange: (values: TrialFormValues) => void;
  /** The thank-you's Close button. */
  onClose: () => void;
  /** A thank-you was shown: the next opening of the window starts empty (AC-03). */
  onSent: () => void;
};

export default function TrialForm({ values, onChange, onClose, onSent }: TrialFormProps) {
  const [errors, setErrors] = useState<TrialFormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [honeypot, setHoneypot] = useState("");
  const doneHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "done") doneHeading.current?.focus();
  }, [status]);

  const set = <K extends keyof TrialFormValues>(key: K, value: TrialFormValues[K]) => {
    onChange({ ...values, [key]: value });
    if (key in errors) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleGoal = (goal: string) =>
    set("goals", values.goals.includes(goal) ? values.goals.filter((g) => g !== goal) : [...values.goals, goal]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    const plan = planSend(values, honeypot);
    setErrors(plan.action === "invalid" ? plan.errors : {});
    if (plan.action === "invalid") {
      setStatus("idle"); // hides a send-failed banner from an earlier attempt; records nothing
      document.getElementById(plan.focusId)?.focus();
      return;
    }
    if (plan.action === "trapped") {
      show("trapped"); // a bot filled the hidden field: pretend it worked, send nothing
      return;
    }
    setStatus("sending");
    const result: SubmitResult = await submitTrialForm({
      portalId: PORTAL_ID,
      formId: formIdFor(window.location.hostname),
      values,
      pageUri: readEntryAddress(window),
      pageName: document.title,
      hutk: readHutk(document.cookie),
    });
    show(result);
  };

  const show = (result: SubmitResult | "trapped") => {
    const outcome = outcomeOf(result);
    setStatus(outcome.view);
    for (const event of outcome.events) pushEvent(window as { dataLayer?: unknown[] }, event);
    if (outcome.emptyNextOpening) onSent();
    if (outcome.view === "done") celebrate();
  };

  if (status === "done") {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-6 text-center">
        <img src="/teacher-celebrate.png" alt="" className="h-40 w-auto select-none" draggable={false} />
        <h2
          ref={doneHeading}
          tabIndex={-1}
          className="break-words font-display text-2xl font-bold text-neutral-900 outline-none"
        >
          {FORM_COPY.thankYou.heading(values.firstname.trim())}
        </h2>
        <p className="text-[15px] text-neutral-600">{FORM_COPY.thankYou.line}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand/90"
        >
          {FORM_COPY.thankYou.close}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 font-body">
      {/* Header: avatar sticks out above the card's top edge */}
      <div className="flex flex-col items-center pt-12 text-center">
        <img
          src="/teacher-trial.png"
          alt={FORM_COPY.avatarAlt}
          className="pointer-events-none absolute -top-14 left-1/2 h-28 w-auto -translate-x-1/2 select-none drop-shadow-md"
          draggable={false}
        />
        <h2 className="font-display text-2xl font-bold leading-tight text-neutral-900">
          {FORM_COPY.headline}
        </h2>
        <p className="mt-1.5 text-[15px] text-neutral-600">
          {FORM_COPY.subline}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={FORM_COPY.fields.firstname} htmlFor="tf-firstname" required error={errors.firstname}>
          <input
            id="tf-firstname"
            name="firstname"
            autoComplete="given-name"
            value={values.firstname}
            onChange={(e) => set("firstname", e.target.value)}
            maxLength={100}
            aria-required="true"
            aria-invalid={!!errors.firstname}
            aria-describedby={errors.firstname ? "tf-firstname-error" : undefined}
            className={inputClass}
          />
        </Field>
        <Field label={FORM_COPY.fields.email} htmlFor="tf-email" required error={errors.email}>
          <input
            id="tf-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            maxLength={254}
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "tf-email-error" : undefined}
            className={inputClass}
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>{FORM_COPY.fields.level}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {LEVELS.map((level) => {
            const active = values.level === level.value;
            return (
              <button
                key={level.value}
                type="button"
                aria-pressed={active}
                onClick={() => set("level", active ? "" : level.value)}
                className={pillClass(active)}
              >
                {level.short}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className={labelClass}>
          {FORM_COPY.fields.goals} <span className="font-normal text-neutral-400">{FORM_COPY.fields.goalsHint}</span>
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {GOALS.map((goal) => {
            const active = values.goals.includes(goal.value);
            return (
              <button
                key={goal.value}
                type="button"
                aria-pressed={active}
                onClick={() => toggleGoal(goal.value)}
                className={pillClass(active)}
              >
                <span aria-hidden="true">{goal.emoji}</span> {goal.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field label={FORM_COPY.fields.messenger} htmlFor="tf-messenger" hint={FORM_COPY.fields.optionalHint}>
        <input
          id="tf-messenger"
          name="messenger"
          autoComplete="off"
          maxLength={100}
          placeholder={FORM_COPY.fields.messengerPlaceholder}
          value={values.messenger}
          onChange={(e) => set("messenger", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label={FORM_COPY.fields.message} htmlFor="tf-message" hint={FORM_COPY.fields.optionalHint}>
        <textarea
          id="tf-message"
          name="message"
          rows={3}
          maxLength={2000}
          placeholder={FORM_COPY.fields.messagePlaceholder}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {/* Honeypot: hidden from people, bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          {FORM_COPY.fields.trap}
          <input
            name="company_url"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      {status === "error" && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {FORM_COPY.sendFailed.before}{" "}
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {FORM_COPY.sendFailed.instagram}
          </a>{" "}
          {FORM_COPY.sendFailed.or}{" "}
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {FORM_COPY.sendFailed.linkedin}
          </a>
          {FORM_COPY.sendFailed.after}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        aria-busy={status === "sending"}
        className={[
          "flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3",
          "text-[15px] font-semibold text-white shadow-sm transition-colors hover:bg-brand/90 disabled:opacity-70",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
        ].join(" ")}
      >
        {status === "sending" && <Loader2 size={18} className="animate-spin" />}
        {FORM_COPY.submit}
      </button>
    </form>
  );
}

function celebrate() {
  try {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#f07c1a", "#fbbf24", "#60a5fa"],
      disableForReducedMotion: true,
    });
  } catch {
    /* decoration only */
  }
}
