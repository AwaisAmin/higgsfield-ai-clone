import type { Metadata } from "next";

import { ImageStudio } from "@/components/generate/image-studio";
import { requireCurrentUser } from "@/lib/auth";
import { toGenerationView } from "@/lib/generation-view";
import { listGenerations } from "@/lib/generations";

export const metadata: Metadata = {
  title: "Image",
  description: "Generate images from a prompt.",
};

export default async function ImagePage() {
  // Safe to require: /ai/* is behind the middleware.
  const user = await requireCurrentUser();
  const { items } = await listGenerations(user.id, { limit: 24 });

  return (
    <ImageStudio
      initialItems={items.map(toGenerationView)}
      initialCredits={user.credits}
    />
  );
}
