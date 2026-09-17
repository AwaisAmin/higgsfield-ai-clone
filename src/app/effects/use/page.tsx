import { redirect } from "next/navigation";

/**
 * The live site links its nav "Effects" entry at /effects/use. That gallery is
 * real here and lives at /effects, so this forwards rather than showing a
 * placeholder for something that exists.
 */
export default function EffectsUsePage() {
  redirect("/effects");
}
