/**
 * One-off backfill.
 *
 * The capture hook never ran in session 03737485: Claude Code snapshots hook
 * configuration at session start, and that session began before
 * .claude/settings.json existed -- the file was created *during* that session's
 * first turn. The turns themselves survive in full in Claude Code's own
 * transcript, so they are recovered from there rather than lost.
 *
 * Extraction matches the live hook (.claude/hooks/capture.js): only `text`
 * blocks from the trailing run of assistant entries before the next human
 * prompt are kept. Thinking, tool calls, tool results, intermediate narration
 * and subagent sidechains are dropped. Timestamps and model names come verbatim
 * from the transcript. Nothing is invented.
 *
 * One wrinkle this transcript forced: a `claude -c` subprocess launched during
 * turn 1 wrote its own turn into the SAME transcript file, interleaved with the
 * outer turn's entries. Segmenting purely by "next human prompt" therefore
 * mis-assigns both turns -- the outer turn picks up the subprocess's synthetic
 * "No response requested." marker, and the subprocess's prompt steals the outer
 * turn's real response. The two streams are separable by `entrypoint`:
 * "cli" is the interactive session, "sdk-cli" is the headless subprocess. Each
 * stream is segmented independently and the results merged by timestamp.
 *
 * Usage: node scripts/backfill-from-transcript.mjs <session-id> [--write]
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const SESSION = process.argv[2];
const WRITE = process.argv.includes("--write");
if (!SESSION) {
  console.error("usage: node scripts/backfill-from-transcript.mjs <session-id> [--write]");
  process.exit(1);
}

const PROJECT_DIR = "C:/Users/Lenovo/.claude/projects/D--Dev-higgsfield-ai";
const LOG_DIR = ".agent-logs";
const PROJECT = "higgsfield-ai";
/** The turn that the hook did capture live, from the `claude -c` subprocess. */
const LIVE_CAPTURED_STREAM = "sdk-cli";

const author = execFileSync("git", ["config", "user.name"], { encoding: "utf8" }).trim();

const all = readFileSync(join(PROJECT_DIR, `${SESSION}.jsonl`), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => {
    try {
      return JSON.parse(l);
    } catch {
      return null;
    }
  })
  .filter((o) => o && !o.isSidechain);

const textOf = (e) => {
  const c = e?.message?.content;
  if (typeof c === "string") return c;
  if (!Array.isArray(c)) return "";
  return c
    .filter((b) => b?.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n");
};
const hasToolUse = (e) => {
  const c = e?.message?.content;
  return Array.isArray(c) && c.some((b) => b?.type === "tool_use");
};
const isToolResult = (e) => {
  const c = e?.message?.content;
  return Array.isArray(c) && c.some((b) => b?.type === "tool_result");
};
/** Placeholder rows the runtime writes (e.g. "No response requested."). */
const isSynthetic = (e) => e?.message?.model === "<synthetic>";

function turnsFor(entries, stream) {
  const promptIdx = [];
  entries.forEach((e, i) => {
    if (e.type !== "user" || e.isMeta) return;
    if (isToolResult(e) || !textOf(e).trim()) return;
    promptIdx.push(i);
  });

  return promptIdx.map((idx, n) => {
    const to = promptIdx[n + 1] ?? entries.length;
    const parts = [];
    let model = null;
    let ts = null;
    for (let i = to - 1; i > idx; i--) {
      const e = entries[i];
      if (e.type === "user") break;
      if (e.type !== "assistant" || isSynthetic(e)) continue;
      if (hasToolUse(e)) break;
      const t = textOf(e);
      if (t.trim()) {
        parts.unshift(t.trim());
        ts = e.timestamp;
      }
      if (!model && e.message?.model) model = e.message.model;
    }
    // Prompts carry no model; use the one that answered them.
    return {
      stream,
      promptText: textOf(entries[idx]).trim(),
      promptTime: entries[idx].timestamp,
      responseText: parts.join("\n\n").trim(),
      responseTime: ts,
      model: model ?? "unknown",
    };
  });
}

const streams = [...new Set(all.map((e) => e.entrypoint).filter(Boolean))];
const turns = streams
  .flatMap((s) => turnsFor(all.filter((e) => e.entrypoint === s), s))
  .sort((a, b) => a.promptTime.localeCompare(b.promptTime));

console.log(`session ${SESSION}`);
console.log(`streams: ${streams.join(", ")}`);
console.log(`human turns: ${turns.length}\n`);
turns.forEach((t, i) => {
  console.log(
    `${String(i + 1).padStart(2)}. ${t.promptTime}  [${t.stream}]  ` +
      `prompt ${String(t.promptText.length).padStart(5)}ch  ` +
      `response ${String(t.responseText.length).padStart(5)}ch  ${t.model}`,
  );
  console.log(`    ${JSON.stringify(t.promptText.slice(0, 64))}`);
});

if (!WRITE) {
  console.log("\n(dry run — pass --write to emit the log file)");
  process.exit(0);
}

// An in-flight turn has no final response yet and must not be invented.
const complete = turns.filter((t) => t.responseText);
const skipped = turns.length - complete.length;

const short = SESSION.slice(0, 8);
const first = complete[0].promptTime;
const last = complete.reduce((m, t) => (t.responseTime > m ? t.responseTime : m), "");

const out = [
  "---",
  `session_id: ${SESSION}`,
  `date: ${first.slice(0, 10)}`,
  `author: ${author}`,
  `model: ${complete[0].model}`,
  "tool: claude-code",
  `project: ${PROJECT}`,
  `total_exchanges: ${complete.length}`,
  `first_prompt_time: ${first}`,
  `last_prompt_time: ${last}`,
  "---",
  "",
  `# Session Log - ${first.slice(0, 10)}`,
  "",
  `Session: \`${short}\` | Project: \`${PROJECT}\` | Author: \`${author}\``,
  "",
  "> **Backfilled 2026-09-16.** The capture hook never fired in this session.",
  "> Claude Code reads hook configuration at session start, and this session",
  "> started before `.claude/settings.json` existed — the config was written",
  "> *during* this session's first turn, so the session itself was never",
  "> hooked. Entries marked `backfilled: true` were recovered afterwards from",
  "> Claude Code's own transcript at",
  `> \`~/.claude/projects/D--Dev-higgsfield-ai/${SESSION}.jsonl\``,
  "> using the same extraction rules as the live hook. Prompts, responses,",
  "> timestamps and model names are verbatim from that transcript.",
  ">",
  "> The one entry without the marker was captured live by the hook: it came",
  "> from a `claude -c` subprocess that ran inside turn 1 and reported the same",
  "> session id. Its response (04:22:50) therefore predates turn 1's own",
  "> response (04:30:17) — the two turns genuinely overlapped. Entries are",
  "> ordered by prompt time.",
  "",
  "---",
  "",
  "",
];

complete.forEach((t, i) => {
  const n = i + 1;
  const marker = t.stream === LIVE_CAPTURED_STREAM ? [] : ["backfilled: true"];
  out.push(
    `[LOG_ENTRY type=PROMPT num=${n} session=${short}]`,
    `timestamp: ${t.promptTime}`,
    `model: ${t.model}`,
    ...marker,
    "",
    t.promptText,
    "",
    "",
    `[LOG_ENTRY type=RESPONSE num=${n} session=${short}]`,
    `timestamp: ${t.responseTime}`,
    `model: ${t.model}`,
    ...marker,
    "",
    t.responseText,
    "",
    "",
  );
});

// Replace the session's existing log rather than leaving a duplicate beside it.
const existing = readdirSync(LOG_DIR).find((f) => f.endsWith(`_${short}.md`));
const stamp = first.slice(0, 19).replace("T", "_").replaceAll(":", "-");
const target = join(LOG_DIR, existing ?? `${stamp}_${short}.md`);

writeFileSync(target, out.join("\n"));
console.log(`\nwrote ${target}`);
console.log(`  ${complete.length} complete turns, ${skipped} in-flight turn(s) skipped`);
