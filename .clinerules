

## Repository Info
- Project lives in **`jakkaj/videospeeder`**. Use this for GitHub operations.
- **General Rule:** When tests fail, add debug output before guessing. Clean up once fixed.
- **IMPORTANT:** Some tasks have detailed guides—**always consult** them.

---

## Following Plans
1. Follow plan phases; tick tasks off when complete.
2. Do **not** mark a task complete until its tests pass.

### Plan Structure
- Store plans in `docs/plans/<folder‑with‑issue‑number>`.
- Ask for an issue number if none is given.
- Use numbered *phases* and *tasks* (e.g. *Phase 1*, *Task 1.1*).
- Provide a checklist (`- [ ]` / `- [x]`).
- Finish with overall success criteria.

---

## Running Commands
- Use **`make`** (see `Makefile`).

---

## GitHub Integration
- Work through the **`github` MCP server**. Always pull the issue first (`get_issue`) and push updates with `update_issue`.
- Keep the GitHub issue body and your local plan in sync; add a one‑line comment for every meaningful change.

### Branch → PR → Main Flow
- Name branches `issue-<issue>-phase-<phase>`.
- Push the branch and open a PR against `main`; CI runs automatically.
- Merge via **squash** once reviews and all checks pass, then delete the branch.

### CI Debug Rule
1. Read the workflow logs.
2. Add targeted debug output to the failing tests or scripts.
3. Make tests resilient to environment quirks (OS, Node version, etc.).

### Commit & Release
- Follow **Conventional Commits** (`feat`, `fix`, `docs`, `chore`, etc.).
- Add `!` or a `BREAKING CHANGE:` footer for majors; reference issues in the footer (`Fixes #123`).
- Semantic‑release auto‑bumps versions and pushes Docker images—no manual versioning.

# Memory and knowledge base

> **Purpose**  Keep memory lean and *useful* by recording only the non‑obvious, searchable decisions that spare future agents from trawling the whole code‑base and explain **what we were thinking at the time**.

### Substantive ≠ Trivial
- **Substantive** = new modules, public interfaces, config keys, cross‑cutting patterns, performance decisions, tests that codify behaviour, *reasons* for choosing an approach.
- **Trivial** = renames, style fixes, comments, minor refactors, one‑line bug‑fixes that don’t change intent.

### MANDATORY RETRIEVAL WORKFLOW
1. **Start of every task:** search memory for related concepts.
2. **Before each implementation step:** verify understanding with memory.
3. **Before answering questions:** check memory first.

### MANDATORY UPDATE WORKFLOW — **run only if change is Substantive**
1. After implementing a new feature **or a change that alters behaviour, public API, configuration, or architecture.**
2. After learning major code‑base structure.
3. After discovering an inconsistency **that requires design clarification or a lasting workaround.** Record the *resolution*, not every mismatch.
4. After deciding a design trade‑off (why A over B).

#### UPDATE CHECKLIST
Tick *at least one*; otherwise **skip memory update**.
- [ ] Introduces or retires a concept/component?
- [ ] Changes external behaviour or configuration?
- [ ] Documents *why* we chose this approach?

#### UPDATE ACTIONS (when checklist passes)
- Max **3 observations** per update → summarise.
- Create/Update entities for components/concepts.
- Add atomic factual observations (≤ 15 words).
- Delete outdated observations when info changes.
- Link related entities with descriptive relations.
- Avoid duplicates (search first).
- Finish thinking with: `Memory updated: …`.

---

## File Change Tracking  (REQUIRED)

### MANDATORY WORKFLOW
1. Before modifying a file: search memory by file name.
2. **After committing** a substantive change (one or more files):
   - If file absent in memory: create a `SourceFile` entity.
   - Create a `FileChange` entity with descriptive name + observations.
   - Link `FileChange` ↔ `SourceFile` (bidirectional).
   - If change relates to a plan, link to `Plan` entity.
3. When creating a plan: add a `Plan` entity; update status when complete.

### GUIDELINES
- Track only **substantive** changes (see definition).
- Keep file paths accurate; use present tense.
- Update `SourceFile` when file purpose changes.

---

## Examples
✔️ **Added `logging.py`** – centralises log‑level config; default via `LOGLEVEL` env var.

✔️ **Switched audio backend to FFmpeg** for hardware acceleration; decision: lower latency than PyAudio.

❌ **Renamed** `process_chunk` → `handle_chunk` → *skip* (trivial).
