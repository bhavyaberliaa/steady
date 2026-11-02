import { describe, expect, it } from "vitest";
import { getDashboardStats } from "@/lib/dashboard";
import { makeAffirmation, makeTrigger, makeUser, star } from "./helpers";

// PLAN.md, test 2: the dashboard numbers are counted correctly.
describe("dashboard stats", () => {
  it("counts total, starred and the top trigger", async () => {
    // Given a user with 3 affirmations under "Before a presentation"
    // and 1 under "Can't sleep", 2 of them starred
    const user = await makeUser("stats@steady.test");
    const sleep = await makeTrigger(user.id, "Can't sleep", "🌙");
    const talk = await makeTrigger(user.id, "Before a presentation", "🎤");
    const a1 = await makeAffirmation(user.id, talk.id, "I know this material.");
    await makeAffirmation(user.id, talk.id, "Nobody expects perfection.");
    await makeAffirmation(user.id, talk.id, "Breathe out slowly.");
    const a4 = await makeAffirmation(user.id, sleep.id, "Rest still counts.");
    await star(user.id, a1.id);
    await star(user.id, a4.id);

    // ...and another user whose rows must not be counted
    const other = await makeUser("other@steady.test");
    const otherTrigger = await makeTrigger(other.id, "Can't sleep");
    const otherAffirmation = await makeAffirmation(other.id, otherTrigger.id, "Not yours.");
    await star(other.id, otherAffirmation.id);

    // When the dashboard stats are calculated
    const stats = await getDashboardStats(user.id);

    // Then total = 4, starred = 2, top trigger = "Before a presentation"
    expect(stats.total).toBe(4);
    expect(stats.starred).toBe(2);
    expect(stats.topTrigger?.name).toBe("Before a presentation");
    // ...and the chart gets one bar per trigger with the right counts
    expect(stats.perTrigger.map((t) => [t.name, t.count])).toEqual([
      ["Can't sleep", 1],
      ["Before a presentation", 3],
    ]);
  });
});
