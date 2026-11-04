// The rules for what can be saved. Plain functions with no database access,
// so both the server actions and the tests can use them.

export const AFFIRMATION_MAX = 280;
export const NOTE_MAX = 500;
export const TRIGGER_NAME_MAX = 40;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Only ids shaped like a uuid reach the database; anything else is "not found".
export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export type FieldErrors<Field extends string> = Partial<Record<Field, string>>;

export type AffirmationInput = { text: string; triggerId: string; note: string };

export function validateAffirmation(input: AffirmationInput): FieldErrors<keyof AffirmationInput> {
  const errors: FieldErrors<keyof AffirmationInput> = {};

  if (!input.text) {
    errors.text = "Write a few words first. Even one short sentence counts.";
  } else if (input.text.length > AFFIRMATION_MAX) {
    errors.text = `Keep it to ${AFFIRMATION_MAX} characters so it's easy to read in a hard moment. You're at ${input.text.length}.`;
  }

  if (!input.triggerId) {
    errors.triggerId = "Pick the moment this affirmation helps with.";
  }

  if (input.note.length > NOTE_MAX) {
    errors.note = `Keep the note under ${NOTE_MAX} characters. You're at ${input.note.length}.`;
  }

  return errors;
}

export function validateTriggerName(name: string, existingNames: string[] = []): string | undefined {
  if (!name) return "Give this trigger a name, like \"Can't sleep\".";
  if (name.length > TRIGGER_NAME_MAX) return `Keep the name under ${TRIGGER_NAME_MAX} characters.`;

  const lower = name.toLowerCase();
  if (existingNames.some((existing) => existing.toLowerCase() === lower)) {
    return `You already have a trigger called "${name}".`;
  }
}

export function hasErrors(errors: object) {
  return Object.keys(errors).length > 0;
}

// Briefing day from a form: 0 (Sunday) to 6 (Saturday), anything else is refused.
export function parseBriefingDay(value: unknown): number | undefined {
  const day = Number(value);
  return typeof value === "string" && value !== "" && Number.isInteger(day) && day >= 0 && day <= 6
    ? day
    : undefined;
}
