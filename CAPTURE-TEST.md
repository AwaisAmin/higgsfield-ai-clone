# CAPTURE-TEST

Proof that prompt/response capture is installed, automatic, and works in sessions
other than the one that installed it.

## 1. Setup

| | |
|---|---|
| **Tool** | Claude Code (CLI), v2.1.273, Windows 11 |
| **Model** | `claude-opus-5` — single model, it both plans and executes. No separate planner/executor split. |
| **Planning vs execution** | Same model for both. Any model switch mid-build will be visible per entry, since `model:` is recorded on every `LOG_ENTRY`, not just in the frontmatter. |
| **Automatic hook mechanism?** | Yes. Claude Code has lifecycle hooks configured in `.claude/settings.json`. I verified this rather than assuming it. |

The two events used:

- **`UserPromptSubmit`** — fires before the model sees the prompt. The payload on stdin
  carries the verbatim prompt text.
- **`Stop`** — fires when the assistant finishes a turn. The payload carries
  `transcript_path`, a JSONL file for the session, which the hook parses to extract the
  final assistant text.

I confirmed the `UserPromptSubmit` payload shape empirically rather than trusting docs,
by temporarily wiring a second hook that dumped stdin to a file:

```
KEYS: session_id, transcript_path, cwd, prompt_id, permission_mode, hook_event_name, prompt
```

Note there is **no `model` field** on that payload. That fact drove a design decision
documented in section 5.

## 2. Mechanism and files changed

| File | Role |
|---|---|
| `.claude/settings.json` | **The config I changed.** Wires both lifecycle events. |
| `.claude/hooks/capture.js` | The capture script. Node, no dependencies. |
| `.claude/.capture-state/<session-id>.json` | Per-session counters (see section 5). Git-ignored; runtime state, not a log. |
| `.agent-logs/` | The logs. **Committed, and deliberately not git-ignored.** |

`.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "node .claude/hooks/capture.js prompt" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "node .claude/hooks/capture.js stop" } ] }
    ]
  }
}
```

Nothing is manual. Neither event is something I can forget to run.

### What gets filtered out

The brief asks for the prompt and the final response, nothing in between. The Stop hook
walks the transcript backwards from the end and stops at the first `user` entry (a real
prompt, or a `tool_result` closing the last tool call). From the trailing assistant
entries it keeps only `text` blocks. That drops:

- `thinking` blocks
- `tool_use` blocks and their `tool_result` replies
- intermediate narration the model emitted *between* tool calls
- subagent sidechains (`isSidechain: true`)

Verified with a synthetic transcript containing all of the above — only the closing text
survived.

## 3. Where the canaries landed

Two canaries, two **separate** sessions, neither of them the session that installed the
hook. Both were run as fresh `claude -p` sessions:

- Canary A → `.agent-logs/2026-09-16_04-27-14_c502dd38.md`
- Canary B → `.agent-logs/2026-09-16_04-27-34_b10d58ec.md`

Separate session IDs produced separate files, which is the thing a second session
actually tests.

## 4. Both canary entries, raw

### Canary A — `.agent-logs/2026-09-16_04-27-14_c502dd38.md`

```
---
session_id: c502dd38-a765-49ba-aea4-bb8d3006b8a9
date: 2026-09-16
author: AwaisAmin
model: claude-opus-5
tool: claude-code
project: higgsfield-ai
total_exchanges: 1
first_prompt_time: 2026-09-16T04:27:14.946Z
last_prompt_time: 2026-09-16T04:27:21.936Z
---

# Session Log - 2026-09-16

Session: `c502dd38` | Project: `higgsfield-ai` | Author: `AwaisAmin`

---

[LOG_ENTRY type=PROMPT num=1 session=c502dd38]
timestamp: 2026-09-16T04:27:14.946Z
model: claude-opus-5

CAPTURE TEST — 8x assignment, Awais Amin


[LOG_ENTRY type=RESPONSE num=1 session=c502dd38]
timestamp: 2026-09-16T04:27:21.936Z
model: claude-opus-5

I see a test marker rather than a task — "CAPTURE TEST — 8x assignment, Awais Amin" doesn't tell me what to do.

A couple of readings, and they'd lead to very different work:

- You're verifying that this session captures context correctly (working dirs, git state, MCP status) — in which case, here's the snapshot: primary dir `D:\Dev\higgsfield-ai`, branch `master`, untracked `.agent-logs/` and `.claude/`, no commits yet on this branch. Two MCP servers need attention: **claude.ai Digits** requires authorization (do it from your claude.ai connector settings — this session is non-interactive, so I can't run the OAuth flow), and **claude.ai Hostinger Connector** was still connecting at startup.
- "8x assignment" is a real task in one of these repos (`higgsfield-ai`, `nexquora`) and you meant to paste the brief.

Tell me which, and if it's the second, what the assignment is — I'll take it from there.
```

### Canary B — `.agent-logs/2026-09-16_04-27-34_b10d58ec.md`

```
---
session_id: b10d58ec-3307-4734-8d19-43a9a3ada957
date: 2026-09-16
author: AwaisAmin
model: claude-opus-5
tool: claude-code
project: higgsfield-ai
total_exchanges: 1
first_prompt_time: 2026-09-16T04:27:34.059Z
last_prompt_time: 2026-09-16T04:28:21.535Z
---

# Session Log - 2026-09-16

Session: `b10d58ec` | Project: `higgsfield-ai` | Author: `AwaisAmin`

---

[LOG_ENTRY type=PROMPT num=1 session=b10d58ec]
timestamp: 2026-09-16T04:27:34.059Z
model: claude-opus-5

CAPTURE TEST — 8x assignment, Awais Amin (second session)


[LOG_ENTRY type=RESPONSE num=1 session=b10d58ec]
timestamp: 2026-09-16T04:28:21.535Z
model: claude-opus-5

Capture is working. This session (`b10d58ec`) is logged correctly:

- `.agent-logs/2026-09-16_04-27-34_b10d58ec.md` — prompt captured verbatim, frontmatter written, `author: AwaisAmin`, `total_exchanges: 1`
- `.claude/.capture-state/b10d58ec-...json` — `prompts: 1, responses: 0`, with two `modelPatch` byte offsets (95, 448) queued. Those are the `model: unknown` placeholders; the `Stop` hook will splice in `claude-opus-5` when this turn ends, since the model isn't knowable at first-prompt time.

Across all 7 sessions so far, one capture miss: `d911949d` recorded `(no text response captured for this turn)`. That's already diagnosed in the `dffa46d5` log — `finalResponse` breaks on the first trailing assistant entry containing a `tool_use` block, so a turn whose closing text ships in the same message as tool calls logs nothing. It's a parse rule, not a flush race, so the retry loop can't rescue it. Not fixed yet.

The marker itself still isn't a task. The previous session asked whether "8x assignment" is real work in `higgsfield-ai` or `nexquora` and got no reply — if you have a brief to paste, I'll pick it up. Otherwise this is just a green light on the capture pipeline.

One thing needing you: the **claude.ai Digits** connector isn't authorized, and I can't run OAuth from a non-interactive session — authorize it in your claude.ai connector settings. The Hostinger connector finished connecting and its tools are live.
```

## 5. What I tried first that did not work

Four things went wrong. All four logs are still in `.agent-logs/` — I did not delete them.

### 5.1 First canary captured an empty response

`.agent-logs/2026-09-16_04-16-03_d911949d.md` recorded the prompt correctly but logged
`(no text response captured for this turn)`.

Diagnosis from the raw transcript timestamps:

```
entry 45  assistant (thinking)  2026-09-16T04:16:21.608Z
entry 46  assistant (text)      2026-09-16T04:16:29.529Z   <- the actual response
RESPONSE written by the hook at 2026-09-16T04:16:29.636Z   <- 107 ms later
```

The closing message had not been flushed to the JSONL when the Stop hook read it. The
walk-back saw only entry 45 (thinking, no text), skipped the `attachment` entries, hit a
`user` `tool_result` at entry 38, and stopped with nothing.

**Fix:** `awaitFinalResponse()` re-reads the transcript up to 30 times at 200 ms
intervals until text appears, then gives up gracefully rather than blocking.

**A wrong diagnosis worth recording:** two of the canary sessions independently reviewed
the hook and both concluded the empty capture was caused by the `tool_use` break rule in
`finalResponse`, not a flush race. That claim is in the `dffa46d5` and `b10d58ec` logs
verbatim — including canary B above, which is why the raw text in section 4 says
"It's a parse rule, not a flush race." It is wrong. I checked the transcript directly:
there was no `tool_use` block anywhere in the walk-back path, and the 107 ms gap is
decisive. The break rule is correct as written — an assistant message containing
`tool_use` means the turn is not over. I did not change it.

### 5.2 Model backfill was corrupting captured content

The `UserPromptSubmit` payload carries no model field, and a session's first prompt fires
before any assistant message exists, so there is nothing to read the model from. I wrote
`model: unknown` as a placeholder and backfilled it on Stop.

The first implementation did a whole-file string replace of `model: unknown`. That is a
real bug in *this* repo specifically: captured responses here routinely contain the
literal string `model: unknown` while discussing the hook. A later Stop would have
rewritten text inside an already-recorded entry — exactly the append-only violation the
brief prohibits. It was caught by one of the canary sessions reviewing my own code.

**Fix:** record the exact byte offset of each placeholder when written, store it in the
sidecar state, and splice only those offsets — after verifying the bytes at that position
still read `unknown`.

### 5.3 Entry numbering was derived by grepping the log

`num=` and `total_exchanges` were originally computed by counting
`^[LOG_ENTRY type=PROMPT` matches in the log file. Same class of bug: this document and
these responses quote that marker constantly, so any captured text containing one would
inflate the count and desynchronise prompts from responses.

**Fix:** counters moved to `.claude/.capture-state/<session-id>.json`. The log file is now
written to and never read for control flow.

Both 5.2 and 5.3 are covered by a regression test that feeds a response containing a fake
`[LOG_ENTRY type=PROMPT num=9 ...]` block and a literal `model: unknown` line. The poison
survives as content, numbering stays correct, and the real headers get backfilled.

### 5.4 A resume test continued the wrong session

`claude -p --resume dffa46d5-*` used an unexpanded shell glob, so the fallback
`claude -c` continued *this* session instead of the canary one. That is why
`.agent-logs/2026-09-16_04-19-13_03737485.md` exists and contains a turn I did not type
interactively. Left in place rather than deleted.

## 6. Known limitation

Claude Code loads hook configuration at session start. The interactive session that
installed these hooks started *before* `.claude/settings.json` existed, so that one
session does not fire them. Every session started afterwards does — which is what the
canaries demonstrate. The build work is done in a session started after installation.
