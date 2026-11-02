import { describe, expect, it } from "vitest";
import { getMyAffirmation, listMyAffirmations } from "@/app/(app)/affirmations/data";
import { getDashboardStats } from "@/lib/dashboard";
import { makeAffirmation, makeTrigger, makeUser } from "./helpers";

// PLAN.md, test 1: one user's affirmations never show up for another user.
describe("data isolation", () => {
  it("User B's list is empty and never contains User A's affirmation", async () => {
    // Given User A has written "I have handled hard weeks before"
    const userA = await makeUser("a@steady.test");
    const triggerA = await makeTrigger(userA.id, "Before a presentation", "🎤");
    const secret = await makeAffirmation(userA.id, triggerA.id, "I have handled hard weeks before");
    // ...and User B has a brand-new account
    const userB = await makeUser("b@steady.test");

    // When User B loads their affirmations list
    const listForB = await listMyAffirmations(userB.id);

    // Then the list is empty and A's affirmation is not returned
    expect(listForB).toEqual([]);
    expect(listForB.map((a) => a.text)).not.toContain("I have handled hard weeks before");

    // Even searching for A's words, or asking for A's id directly, finds nothing
    expect(await listMyAffirmations(userB.id, { q: "hard weeks" })).toEqual([]);
    expect(await getMyAffirmation(userB.id, secret.id)).toBeUndefined();
    expect((await getDashboardStats(userB.id)).total).toBe(0);

    // (And A still sees it, so the test isn't passing just because nothing loads.)
    expect((await listMyAffirmations(userA.id)).map((a) => a.text)).toEqual([
      "I have handled hard weeks before",
    ]);
  });
});
