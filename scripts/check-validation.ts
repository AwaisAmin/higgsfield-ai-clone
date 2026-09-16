import { generateRequestSchema, listGenerationsSchema } from "../src/lib/validation";
import { creditsFor, DEFAULT_MODEL, MAX_PROMPT_LENGTH } from "../src/lib/credits";

let failures = 0;
const check = (label: string, ok: boolean, detail = "") => {
  console.log(`  ${ok ? "OK  " : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

const ok = (v: unknown) => generateRequestSchema.safeParse(v).success;

check("cost is 4 credits/image", creditsFor(DEFAULT_MODEL) === 4, `${creditsFor(DEFAULT_MODEL)}`);
check("valid prompt accepted", ok({ prompt: "a cat" }));
check("empty prompt rejected", !ok({ prompt: "" }));
check("whitespace-only prompt rejected", !ok({ prompt: "   \n\t " }));
check("missing prompt rejected", !ok({}));
check(`prompt of exactly ${MAX_PROMPT_LENGTH} accepted`, ok({ prompt: "x".repeat(MAX_PROMPT_LENGTH) }));
check(`prompt of ${MAX_PROMPT_LENGTH + 1} rejected`, !ok({ prompt: "x".repeat(MAX_PROMPT_LENGTH + 1) }));
check("unknown model rejected", !ok({ prompt: "a cat", model: "fal-ai/sdxl" }));
check("unknown aspect ratio rejected", !ok({ prompt: "a cat", aspectRatio: "7:3" }));

const defaults = generateRequestSchema.parse({ prompt: "  a cat  " });
check("prompt trimmed", defaults.prompt === "a cat", JSON.stringify(defaults.prompt));
check("aspectRatio defaults to 1:1", defaults.aspectRatio === "1:1", defaults.aspectRatio);
check("model defaults to flux/schnell", defaults.model === DEFAULT_MODEL, defaults.model);

check("limit defaults to 20", listGenerationsSchema.parse({}).limit === 20);
check("limit coerced from string", listGenerationsSchema.parse({ limit: "5" }).limit === 5);
check("limit over 50 rejected", !listGenerationsSchema.safeParse({ limit: 51 }).success);

console.log(failures === 0 ? "\nALL VALIDATION CHECKS PASSED" : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
