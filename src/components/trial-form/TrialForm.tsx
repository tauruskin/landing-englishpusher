// Copied from app-englishpusher: src/shared/trialForm/TrialForm.tsx
// (a copy, not a shared package — a HubSpot field change goes into both repos).
// Landing changes: the answers are owned by the parent (TrialDialog keeps them across openings),
// Send follows planSend() from src/lib/trialSend.ts, and the send goes to the live form only on the
// published host (formIdFor) with the entry address as pageUri.
import { useState, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { GOALS, LEVELS, type TrialFormValues } from "../../lib/options.ts";
import type { TrialFormErrors } from "../../lib/validate.ts";
import { readEntryAddress, readHutk, submitTrialForm, type SubmitResult } from "../../lib/hubspot.ts";
import { PORTAL_ID, formIdFor } from "../../lib/site.ts";
import { planSend } from "../../lib/trialSend.ts";

// ---------------------------------------------------------------------------
// TrialForm — the "Book a trial lesson" form inside the TrialDialog window.
// Name and email are required; level, goals, messenger and message are
// optional.
// ---------------------------------------------------------------------------

type Status = "idle" | "sending";

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

export type TrialFormProps = {
  values: TrialFormValues;
  onChange: (values: TrialFormValues) => void;
  /** The CRM answered (or the send failed / timed out). */
  onResult?: (result: SubmitResult) => void;
  /** The hidden trap field was filled: nothing was sent. */
  onTrapped?: () => void;
};

export default function TrialForm({ values, onChange, onResult, onTrapped }: TrialFormProps) {
  const [errors, setErrors] = useState<TrialFormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [honeypot, setHoneypot] = useState("");

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
      document.getElementById(plan.focusId)?.focus();
      return;
    }
    if (plan.action === "trapped") {
      onTrapped?.(); // a bot filled the hidden field: pretend it worked, send nothing
      return;
    }
    setStatus("sending");
    const result = await submitTrialForm({
      portalId: PORTAL_ID,
      formId: formIdFor(window.location.hostname),
      values,
      pageUri: readEntryAddress(window),
      pageName: document.title,
      hutk: readHutk(document.cookie),
    });
    setStatus("idle");
    onResult?.(result);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 font-body">
      {/* Header: avatar sticks out above the card's top edge */}
      <div className="flex flex-col items-center pt-12 text-center">
        <img
          src="/teacher-trial.png"
          alt="Tutor Tetiana waving"
          className="pointer-events-none absolute -top-14 left-1/2 h-28 w-auto -translate-x-1/2 select-none drop-shadow-md"
          draggable={false}
        />
        <h2 className="font-display text-2xl font-bold leading-tight text-neutral-900">
          Book a trial lesson with Tetiana
        </h2>
        <p className="mt-1.5 text-[15px] text-neutral-600">
          Tell me a little about yourself and I'll get back to you soon.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="tf-firstname" required error={errors.firstname}>
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
        <Field label="Email" htmlFor="tf-email" required error={errors.email}>
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
        <legend className={labelClass}>Your English level</legend>
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
          What's your goal? <span className="font-normal text-neutral-400">(choose any)</span>
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

      <Field label="Telegram, Viber or phone" htmlFor="tf-messenger" hint="(optional)">
        <input
          id="tf-messenger"
          name="messenger"
          autoComplete="off"
          maxLength={100}
          placeholder="@username or +380…"
          value={values.messenger}
          onChange={(e) => set("messenger", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Message" htmlFor="tf-message" hint="(optional)">
        <textarea
          id="tf-message"
          name="message"
          rows={3}
          maxLength={2000}
          placeholder="Anything I should know? Preferred time, topics…"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          className={`${inputClass} resize-none`}
        />
      </Field>

      {/* Honeypot: hidden from people, bots fill it in */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input
            name="company_url"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

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
        Book a trial lesson
      </button>
    </form>
  );
}
