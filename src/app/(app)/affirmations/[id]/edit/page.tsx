import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AffirmationForm } from "../../affirmation-form";
import { getMyAffirmation, getMyTriggers } from "../../data";

export default async function EditAffirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const [affirmation, triggers] = await Promise.all([
    getMyAffirmation(user.id, id),
    getMyTriggers(user.id),
  ]);
  if (!affirmation) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit affirmation</h1>
      <div className="rounded-3xl border border-border bg-surface p-6">
        <AffirmationForm triggers={triggers} existing={affirmation} />
      </div>
    </div>
  );
}
