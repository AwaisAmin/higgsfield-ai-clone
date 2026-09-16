import type { Metadata } from "next";

import { Studio } from "@/components/generate/studio";
import { requireCurrentUser } from "@/lib/auth";
import { toGenerationView } from "@/lib/generation-view";
import { listGenerations } from "@/lib/generations";

export const metadata: Metadata = {
  title: "Video",
  description: "Generate video from a prompt, with effects presets.",
};

export default async function VideoPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>;
}) {
  const user = await requireCurrentUser();
  const [{ items }, { preset }] = await Promise.all([
    listGenerations(user.id, { limit: 24, kind: "VIDEO" }),
    searchParams,
  ]);

  return (
    <Studio
      kind="VIDEO"
      initialItems={items.map(toGenerationView)}
      initialCredits={user.credits}
      initialPreset={preset ?? null}
    />
  );
}
