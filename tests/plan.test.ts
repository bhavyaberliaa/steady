import { describe, expect, it } from "vitest";
import { buildPlanPrompt, finalizePlan, isValidOrder, TITLE_MAX, type PlanAffirmation } from "@/lib/plan";
import type { WeekDay } from "@/lib/week";

// Extra checks for feature 10 (not one of the two required tests).

const mine: PlanAffirmation[] = [
  { id: "11111111-1111-4111-8111-111111111111", text: "I know this material.", starred: false, triggerName: "Before a presentation" },
  { id: "22222222-2222-4222-8222-222222222222", text: "This wave will pass.", starred: true, triggerName: "Can't sleep" },
];
const three = [
  { title: "Prepare the demo", why: "It's Wednesday at 3pm." },
  { title: "Protect sleep", why: "Two late nights." },
  { title: "Call Mom", why: "Her birthday is Friday." },
];

describe("checking Claude's plan", () => {
  it("keeps a good answer and the affirmation Claude picked", () => {
    const plan = finalizePlan({ priorities: three, calm_note: "One thing at a time.", affirmation_id: mine[0].id }, mine);
    expect(plan).toEqual({ priorities: three, calmNote: "One thing at a time.", affirmationId: mine[0].id });
  });

  it("never quotes an affirmation that isn't yours: falls back to your starred one", () => {
    const forged = "99999999-9999-4999-8999-999999999999";
    const plan = finalizePlan({ priorities: three, calm_note: "Breathe.", affirmation_id: forged }, mine);
    expect(plan?.affirmationId).toBe(mine[1].id);
  });

  it("works with no affirmations at all", () => {
    expect(finalizePlan({ priorities: three, calm_note: "Breathe.", affirmation_id: "" }, [])?.affirmationId).toBeNull();
  });

  it("refuses answers with fewer than 3 priorities or no note, and trims extra ones", () => {
    expect(finalizePlan({ priorities: three.slice(0, 2), calm_note: "Hi", affirmation_id: "" }, mine)).toBeUndefined();
    expect(finalizePlan({ priorities: three, calm_note: "   ", affirmation_id: "" }, mine)).toBeUndefined();
    const four = [...three, { title: "Extra", why: "x" }];
    expect(finalizePlan({ priorities: four, calm_note: "Hi", affirmation_id: "" }, mine)?.priorities).toHaveLength(3);
  });

  it("shortens very long titles", () => {
    const long = [{ title: "x".repeat(300), why: "y" }, ...three.slice(1)];
    const plan = finalizePlan({ priorities: long, calm_note: "Hi", affirmation_id: "" }, mine)!;
    expect(plan.priorities[0].title.length).toBeLessThanOrEqual(TITLE_MAX);
  });
});

describe("reordering", () => {
  it("accepts only 0, 1, 2 rearranged", () => {
    expect(isValidOrder([2, 0, 1])).toBe(true);
    for (const bad of [[0, 1], [0, 0, 1], [0, 1, 3], ["0", "1", "2"], "012", null, [0, 1, 2, 3]]) {
      expect(isValidOrder(bad)).toBe(false);
    }
  });
});

describe("what we send Claude", () => {
  it("includes each day's events and the affirmation ids, wrapped as data", () => {
    const days: WeekDay[] = [
      { date: "2026-11-04", label: "Wednesday, Nov 4", isToday: true, events: [{ id: "1", title: "Demo", time: "3:00 PM – 3:30 PM", location: "Room 204" }] },
      { date: "2026-11-05", label: "Thursday, Nov 5", isToday: false, events: [] },
    ];
    const prompt = buildPlanPrompt(days, mine);
    expect(prompt).toContain("<calendar>");
    expect(prompt).toContain("Wednesday, Nov 4 (today)\n  - 3:00 PM – 3:30 PM: Demo (Room 204)");
    expect(prompt).toContain("Thursday, Nov 5\n  - (nothing scheduled)");
    expect(prompt).toContain(`id=${mine[1].id} ★starred [Can't sleep] This wave will pass.`);
  });
});
