import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { buildPlanPrompt, finalizePlan, PlanSchema, SYSTEM_PROMPT, type Plan, type PlanAffirmation } from "./plan";
import type { WeekDay } from "./week";

export type PlanResult = { ok: true; plan: Plan } | { ok: false; error: string };

export function aiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Asks Claude for 3 priorities and a calm note, as checked JSON.
export async function askClaudeForPlan(days: WeekDay[], affirmations: PlanAffirmation[]): Promise<PlanResult> {
  if (!aiConfigured()) {
    return { ok: false, error: "The AI helper isn't set up on this site yet (missing ANTHROPIC_API_KEY)." };
  }

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "medium", format: betaZodOutputFormat(PlanSchema) },
      // If a safety check declines, let Anthropic retry on its recommended fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildPlanPrompt(days, affirmations) }],
    });

    if (response.stop_reason === "refusal") {
      return { ok: false, error: "Claude couldn't help with this week. Please try again." };
    }
    const plan = response.parsed_output ? finalizePlan(response.parsed_output, affirmations) : undefined;
    if (!plan) return { ok: false, error: "Claude's answer came back incomplete. Please try again." };
    return { ok: true, plan };
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Prioritize: Anthropic rejected the API key", error.message);
      return { ok: false, error: "The AI helper's key isn't working. Check ANTHROPIC_API_KEY in Vercel." };
    }
    if (error instanceof Anthropic.RateLimitError) {
      return { ok: false, error: "The AI helper is busy right now. Please try again in a minute." };
    }
    console.error("Prioritize: Claude request failed", error);
    return { ok: false, error: "Couldn't reach Claude right now. Please try again in a minute." };
  }
}
