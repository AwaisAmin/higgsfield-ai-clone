#!/usr/bin/env node
/**
 * .agent-logs capture hook for Claude Code.
 *
 * Wired in .claude/settings.json to two lifecycle events:
 *   UserPromptSubmit -> node .claude/hooks/capture.js prompt
 *   Stop             -> node .claude/hooks/capture.js stop
 *
 * Both events deliver a JSON payload on stdin. UserPromptSubmit carries the
 * verbatim prompt; Stop carries transcript_path, which we read to pull out the
 * final assistant text for that turn. Thinking blocks, tool_use blocks,
 * tool_result turns and subagent sidechains are all dropped -- the brief wants
 * the prompt and the final response, nothing in between.
 *
 * Log entries are strictly append-only. Two things outside the entry bodies do
 * get rewritten: the frontmatter counters, and a first-prompt model placeholder
 * (see backfillModel). Both are deliberately blind to entry content, because
 * captured text in this repo legitimately contains strings like the model
 * placeholder and the LOG_ENTRY markers themselves -- a naive grep or replace
 * would corrupt the very log it is maintaining.
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const MODE = process.argv[2]; // "prompt" | "stop"
const ROOT = path.resolve(__dirname, "..", "..");
const LOG_DIR = path.join(ROOT, ".agent-logs");
const STATE_DIR = path.join(ROOT, ".claude", ".capture-state");
const PROJECT = path.basename(ROOT);
const MODEL_UNKNOWN = "unknown";

function readStdin() {
  try {
    return fs.readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function gitAuthor() {
  try {
    return (
      execFileSync("git", ["config", "user.name"], {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim() || "unknown"
    );
  } catch {
    return "unknown";
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/* ---------------------------------------------------------------- state --
 * Entry numbering lives in a sidecar file rather than being recounted by
 * grepping the log. A response that quotes a LOG_ENTRY marker -- which happens
 * constantly in this project -- would otherwise inflate the count and
 * desynchronise prompts from responses.
 */

function statePath(sessionId) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  return path.join(STATE_DIR, sessionId + ".json");
}

function loadState(sessionId) {
  try {
    return JSON.parse(fs.readFileSync(statePath(sessionId), "utf8"));
  } catch {
    return { file: null, prompts: 0, responses: 0, modelPatch: [] };
  }
}

function saveState(sessionId, state) {
  fs.writeFileSync(statePath(sessionId), JSON.stringify(state, null, 2));
}

/* ----------------------------------------------------------- transcript -- */

function readTranscript(p) {
  if (!p || !fs.existsSync(p)) return [];
  const out = [];
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      const o = JSON.parse(line);
      if (o.isSidechain) continue; // subagent traffic is not this turn's answer
      out.push(o);
    } catch {
      /* a partially flushed final line is normal while the session is live */
    }
  }
  return out;
}

function textBlocks(entry) {
  const content = entry && entry.message ? entry.message.content : null;
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content
    .filter((b) => b && b.type === "text" && typeof b.text === "string")
    .map((b) => b.text)
    .join("\n");
}

function hasToolUse(entry) {
  const content = entry && entry.message ? entry.message.content : null;
  return Array.isArray(content) && content.some((b) => b && b.type === "tool_use");
}

/**
 * The final response is the run of trailing assistant entries after the last
 * user entry (a real prompt, or a tool_result closing the last tool call).
 * Walking backwards and stopping there drops every intermediate narration the
 * model emitted between tool calls.
 */
function finalResponse(entries) {
  const parts = [];
  let model = null;
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.type === "user") break;
    if (e.type !== "assistant") continue; // attachment / system / last-prompt
    if (hasToolUse(e)) break;
    const t = textBlocks(e);
    if (t.trim()) parts.unshift(t.trim());
    if (!model && e.message && e.message.model) model = e.message.model;
  }
  return { text: parts.join("\n\n").trim(), model: model };
}

/**
 * Stop can fire a few hundred ms before the closing assistant message is
 * flushed to the transcript, which silently yields an empty response. Re-read
 * until the text lands, then give up gracefully rather than blocking forever.
 */
function awaitFinalResponse(transcriptPath, tries, waitMs) {
  tries = tries || 30;
  waitMs = waitMs || 200;
  let last = { text: "", model: null };
  for (let i = 0; i < tries; i++) {
    const entries = readTranscript(transcriptPath);
    last = finalResponse(entries);
    if (last.text) return { text: last.text, model: last.model, entries: entries };
    sleep(waitMs);
  }
  const entries = readTranscript(transcriptPath);
  return { text: last.text, model: last.model, entries: entries };
}

function latestModel(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e && e.message && e.message.model) return e.message.model;
  }
  return null;
}

function lastUserPrompt(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (e.type !== "user" || e.isMeta) continue;
    const t = textBlocks(e);
    if (t.trim()) return t.trim();
  }
  return "";
}

/* ------------------------------------------------------------ log file -- */

function newLogPath(sessionId, now) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const short = sessionId.slice(0, 8);
  const stamp = now.toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-");
  return path.join(LOG_DIR, stamp + "_" + short + ".md");
}

function frontmatter(sessionId, model, iso) {
  const short = sessionId.slice(0, 8);
  const author = gitAuthor();
  return [
    "---",
    "session_id: " + sessionId,
    "date: " + iso.slice(0, 10),
    "author: " + author,
    "model: " + model,
    "tool: claude-code",
    "project: " + PROJECT,
    "total_exchanges: 0",
    "first_prompt_time: " + iso,
    "last_prompt_time: " + iso,
    "---",
    "",
    "# Session Log - " + iso.slice(0, 10),
    "",
    "Session: `" + short + "` | Project: `" + PROJECT + "` | Author: `" + author + "`",
    "",
    "---",
    "",
    "",
  ].join("\n");
}

/** Append text, returning the byte offset the text was written at. */
function appendAt(file, text) {
  const offset = fs.existsSync(file) ? fs.statSync(file).size : 0;
  fs.appendFileSync(file, text);
  return offset;
}

/** Byte offset of the model value inside a just-written chunk. */
function modelValueOffset(base, text) {
  const marker = "model: " + MODEL_UNKNOWN;
  const idx = text.indexOf(marker);
  if (idx < 0) return null;
  return base + Buffer.byteLength(text.slice(0, idx) + "model: ", "utf8");
}

/**
 * The first prompt of a session is logged before any assistant message exists,
 * so the model is not yet knowable. Rather than string-replacing the
 * placeholder across the file -- captured text contains that word -- we
 * remember the exact byte offsets written and splice only those, verifying the
 * bytes still match before touching anything.
 */
function backfillModel(file, offsets, model) {
  if (!offsets || !offsets.length || model === MODEL_UNKNOWN) return;
  let buf = fs.readFileSync(file);
  const token = Buffer.from(MODEL_UNKNOWN, "utf8");
  const repl = Buffer.from(model, "utf8");
  let patched = false;
  const ordered = offsets.slice().sort((a, b) => b - a);
  for (const off of ordered) {
    if (buf.slice(off, off + token.length).equals(token)) {
      buf = Buffer.concat([buf.slice(0, off), repl, buf.slice(off + token.length)]);
      patched = true;
    }
  }
  if (patched) fs.writeFileSync(file, buf);
}

/** Only the frontmatter block is touched; entry bodies are never rewritten. */
function bumpFrontmatter(file, exchanges, iso) {
  const body = fs.readFileSync(file, "utf8");
  const end = body.indexOf("\n---\n", 4); // close of the opening frontmatter
  if (end < 0) return;
  const head = body
    .slice(0, end)
    .replace(/^total_exchanges: .*$/m, "total_exchanges: " + exchanges)
    .replace(/^last_prompt_time: .*$/m, "last_prompt_time: " + iso);
  fs.writeFileSync(file, head + body.slice(end));
}

/* ---------------------------------------------------------------- main -- */

function main() {
  let payload = {};
  try {
    payload = JSON.parse(readStdin());
  } catch (e) {
    return; // nothing usable on stdin
  }

  const sessionId = payload.session_id || payload.sessionId;
  if (!sessionId) return;
  // A Stop hook re-firing after it blocked would double-log the same turn.
  if (MODE === "stop" && payload.stop_hook_active) return;

  const now = new Date();
  const iso = now.toISOString();
  const short = sessionId.slice(0, 8);
  const state = loadState(sessionId);
  if (!state.modelPatch) state.modelPatch = [];

  if (MODE === "prompt") {
    const entries = readTranscript(payload.transcript_path);
    const prompt = String(payload.prompt == null ? "" : payload.prompt).trim() || lastUserPrompt(entries);
    if (!prompt) return;

    const model = latestModel(entries) || MODEL_UNKNOWN;

    if (!state.file || !fs.existsSync(state.file)) {
      state.file = newLogPath(sessionId, now);
      const head = frontmatter(sessionId, model, iso);
      const base = appendAt(state.file, head);
      if (model === MODEL_UNKNOWN) {
        const off = modelValueOffset(base, head);
        if (off !== null) state.modelPatch.push(off);
      }
    }

    const num = state.prompts + 1;
    const entry =
      "[LOG_ENTRY type=PROMPT num=" + num + " session=" + short + "]\n" +
      "timestamp: " + iso + "\n" +
      "model: " + model + "\n\n" +
      prompt + "\n\n\n";
    const base = appendAt(state.file, entry);
    if (model === MODEL_UNKNOWN) {
      const off = modelValueOffset(base, entry);
      if (off !== null) state.modelPatch.push(off);
    }

    state.prompts = num;
    saveState(sessionId, state);
    bumpFrontmatter(state.file, state.prompts, iso);
    return;
  }

  if (MODE === "stop") {
    if (!state.file || !fs.existsSync(state.file)) return;
    if (state.responses >= state.prompts) return; // no turn outstanding

    const settled = awaitFinalResponse(payload.transcript_path);
    const resolved = settled.model || latestModel(settled.entries) || MODEL_UNKNOWN;

    backfillModel(state.file, state.modelPatch, resolved);
    state.modelPatch = [];

    appendAt(
      state.file,
      "[LOG_ENTRY type=RESPONSE num=" + state.prompts + " session=" + short + "]\n" +
        "timestamp: " + iso + "\n" +
        "model: " + resolved + "\n\n" +
        (settled.text || "(no text response captured for this turn)") + "\n\n\n"
    );

    state.responses = state.prompts;
    saveState(sessionId, state);
    bumpFrontmatter(state.file, state.prompts, iso);
  }
}

main();
