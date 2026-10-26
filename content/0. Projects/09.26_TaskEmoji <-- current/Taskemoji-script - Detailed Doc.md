---
date: 2026-10-26T19:11
---
## Reference: the rules in detail

Please refer to [[Quick start - Taskemoji-script (Google Script)]] for a quick intro to the google script aspect of the tool.

### Title structure

```
[Priority][Type][Prepend-repeated][Prepend-single] MAIN TEXT [Append-single][Append-repeated][Color]
```

- **Priority**: from `p1`-`p4` in the text → 🔴🟠🟡🟢, concatenated, duplicates allowed (`p1 p1` → `🔴🔴`)
- **Type**: see "Types" below — protected from all clear operations
- **Prepend/Append-repeated**: from the `d`/`w`/`m`/`y` periodic list markers
- **Prepend/Append-single**: from list-level `+{emoji}` / `{emoji}+` markers — the _only_ blocks wiped by `--` / `-_` / `_-`
- **In-place emojis** (the star, via `-s`) sit wherever they occur inside MAIN TEXT and are always preserved
- **Color**: single slot at the very end, always overwritten (never stacked), protected from clear operations

Priority, Type, periodic (repeated), color, and any in-place emoji are always preserved by clear operators. Only the single prepend/append blocks (list-added, non-repeating) get wiped.

### Types

The seventeen built-in types are in the [[Quick start - Taskemoji-script (Google Script)#Cheat sheet|cheat sheet]]. They behave like priority: several can be combined (they concatenate, duplicates allowed) and they are protected from every clear operator. They are triggered by typed codes anywhere in a task's title, the same mechanism as color codes, and sit in the Type block right after Priority.

Custom types: `t{emoji}` (e.g. `t☠️`, no dash) in a **list's title only** treats `{emoji}` as a type for the tasks in that list. It is purely local and nothing is remembered globally: the same emoji used as `+{emoji}` on another list stays an ordinary generic marker there. `t{emoji}` in a _task's_ title is not supported (once consumed, nothing would remember it was a type). The dash on the seventeen built-in codes exists to make task-title conversions deliberate and less prone to accidental triggering.

Notes on the newest types:

- **Longest code first.** `-tap` and `-tar` begin like `-ta` (artefact), and `-tp` is ponder. Codes are matched whole, so each gives only its own emoji, and `-tape` or `-target` are left as plain text.
- **𝝨 (formula) is not an emoji.** It is U+1D768, MATHEMATICAL SANS-SERIF BOLD CAPITAL SIGMA, a letter. The script treats it as a _marker symbol_ (`SYMBOL_MARKERS`), and it behaves exactly like a type emoji everywhere: `+𝝨` / `𝝨+` / `-+𝝨` in a list name, sorting into the Type block ahead of plain markers, `--` keeping it, being refused as a periodic emoji. Only this one code point is special: the ordinary Greek Σ, or a sigma in the middle of a sentence, is plain text.
- **Changed meanings.** `-te` (events) used to give 🕢 and now gives 📅; 🕢 now means _appointment_ (`-tap`). `-tf` used to give 🗂️ (feature) and now gives 𝝨 (formula), and 🗂️ is no longer a type. Titles already converted keep their emoji: a task that holds 🕢 reads as an appointment from now on, retyping `-te` on it adds 📅 next to the 🕢 (types accumulate), and a task that holds 🗂️ keeps it as an ordinary emoji.

Note: there are no gear markers any more. The gear exists only as the `-th` maintenance Type. The old in-place `-h`, the prepend `h_` and the append `_h` were removed, and `-tg` now means toy project (🏸), not maintenance. Codes that no longer exist (`-h`, `h_`, `_h`, `-tn`) are left as plain text when typed. Titles already converted keep their emoji, but a task still holding an _unprocessed_ old `-tg` or `-tp` would be read with its new meaning.

### List title markers

**Unified principle:** the marker grammar below is generic — it works the same regardless of which emoji follows it. What changes is _which block_ the emoji lands in, based on whether the emoji is itself a recognized priority/color/type emoji, or just an arbitrary one:

- Priority emoji (🔴🟠🟡🟢) → routed into the **Priority** block, multi-value (concatenates, duplicates allowed — `+🔴 +🟢` gives `🔴🟢` in Priority)
- Color emoji (any of the 24 color emoji) → routed into the **Color** slot, single-value. **A color emoji written bare, with no `+` around it, counts as `+{emoji}`** (parents only). If the name holds several _different_ colors, the **first one wins** from the very first run and the others are ignored. A losing marker written with a `+` is also physically removed from the list's own title (an actual rename via the API); a losing **bare** one is left in place, because it may be decoration, and simply has no effect. Two identical color markers collapse harmlessly. (An earlier version applied every color in turn, so the _last_ one won on the first run and the first one only after the rename.)
- Type emoji (the 17 built-ins, or any emoji declared via `t{emoji}` in that same list's title) → routed into the **Type** block, multi-value like priority.
- Any other emoji → the plain non-repeating prepend/append block (`+🌳 +⏰` gives `🌳⏰`). Marker text stays visible in the list title permanently, no collision handling — multiple different arbitrary emoji just accumulate.

**Scope dimension:** in addition to position (prepend vs. append) and operation (add vs. reset), there's a third axis — which tasks in the list are affected:

| **Marker**                 | **Position** | **Operation** | **Scope**                         |
| -------------------------- | ------------ | ------------- | --------------------------------- |
| `{color emoji}` on its own | prepend      | add           | parents only (same as `+{emoji}`) |
| `+{emoji}`                 | prepend      | add           | parents only                      |
| `-+{emoji}`                | prepend      | reset         | parents only                      |
| `++{emoji}`                | prepend      | add           | parents **and** subtasks          |
| `_+{emoji}`                | prepend      | add           | **subtasks only**                 |
| `{emoji}+`                 | append       | add           | parents only                      |
| `{emoji}-+`                | append       | reset         | parents only                      |
| `{emoji}++`                | append       | add           | parents **and** subtasks          |
| `{emoji}_+`                | append       | add           | subtasks only                     |

Reset scoped to parents+subtasks or subtasks-only (e.g. a hypothetical `-++{emoji}` or `_-+{emoji}`) is **⛔ deferred, not built** — confirmed low priority for now.

| **Marker**                                                      | **Effect**                                                                                 |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `--`                                                            | Clear prepend-single **and** append-single blocks (priority/type/periodic/color untouched) |
| `-_`                                                            | Clear prepend-single block only                                                            |
| `_-`                                                            | Clear append-single block only                                                             |
| `d{emoji}`                                                      | Prepend `{emoji}` daily (cap 7 accumulated)                                                |
| `d2{emoji}`                                                     | Prepend `{emoji}` every 2 days                                                             |
| `w{emoji}`                                                      | Prepend `{emoji}` weekly (cap 5)                                                           |
| `m{emoji}`                                                      | Prepend `{emoji}` monthly (cap 12)                                                         |
| `y{emoji}`                                                      | Prepend `{emoji}` yearly (cap 10)                                                          |
| `{emoji}d` / `{emoji}d2` / `{emoji}w` / `{emoji}m` / `{emoji}y` | Append versions of the above                                                               |

Periodic reference point: "days since the script first saw this task," tracked in Apps Script's PropertiesService (see below) since the Tasks API has no creation-date field. Month/year lengths are fixed approximations (30 / 365 days), not true calendar months/years, so long-running monthly/yearly counters will drift slightly — a known, accepted simplification.

### Emoji matching ignores the invisible "show as emoji" character

Some emoji (⬜ ⬛ ⚙️ 🗄️ 🕰️ 🗃️ 🗂️ ...) can be written with or without an invisible character (U+FE0F, the "variation selector"). Keyboards and emoji pickers add it to some emoji and not to others, so the same emoji can arrive either way, e.g. `+⬛` and `+⬛️` in a list name.

- Every comparison against the reserved emoji (priority, type, color) ignores that character, so `+⬛️` is a color marker exactly like `+⬛`, `+🗄` is a type marker exactly like `+🗄️`, and `d⬛️` is refused as a periodic emoji exactly like `d⬛`.
- A reserved emoji is written into the title in the table's own form (what `-b`, `-tb` ... write), however the marker was typed.
- A color marker is "already applied" only when the color slot (the end of the title) holds that color. A copy of the same square left at the START of a title (a previous version of the script added the square there as an ordinary emoji when the marker carried the invisible character) is moved into the slot the next time the marker runs. Other leading emoji, including squares of a different color, are left alone.

### Memory for periodic emoji

Uses `PropertiesService.getScriptProperties()` as a simple key-value store. The first time the script ever sees a task, it stores `seen_<listId>:<taskId> → today's timestamp` and never overwrites it. Every run recomputes `daysElapsed = today − firstSeen`, divides by the period length, and floors it to get how many repeats to show (capped per the table above).

**Periodic emoji are state, not an action — the script is idempotent.** Each run first strips whatever periodic emoji the previous run left behind (it knows which emoji those are because the _list title_ declares them), runs the normal pipeline on the clean title, then writes back exactly the right number of copies. Running the script once or fifty times on the same day gives the same title, and a steady-state run makes no write at all.

**Placement** follows the title-structure diagram: the repeated-prepend block sits right after Priority and Type (before the plain prepend block), and the repeated-append block sits right before Color (after the plain append block). e.g. `🔴 🗄️ 🎉🎉🎉 🔥 launch 🧩 🥳🥳 🟩`. The `--` / `-_` / `_-` clear operators never touch it.

Notes:

- A periodic emoji can't also be a priority, type or color emoji (e.g. `d🔴`); such markers are ignored so they can't collide with those blocks.
- If you delete the periodic marker from the list title, the emoji already written stay as static leftovers, since nothing identifies them any more.
- **The clock starts when the script first processes a task, not when the task was created** (Google Tasks exposes no creation date). A task that already existed starts at 0 like any other, and nothing appears until one full period has passed since then (a task the script first saw today has 0 repeats under `d🎉`, and shows its first `w☠️` a week later).
- Periodic markers only work in a **list's** title, with the emoji glued to the letter and no space: `w☠️` or `☠️w`, not `w ☠️`. Typed in a task's title they do nothing.
- `diagnosticPeriodic()` (read-only) shows, per task, when the script first saw it and what the markers give today. `backdateFirstSeen()` pretends the script first saw a list's tasks N days ago, to test immediately or to start old tasks' clocks earlier. Edit the list-name string (and the number of days) inside the small wrapper, then run it.

### Due-date auto-assignment

A list title containing one of these keywords (case-insensitive) affects every task in that list:

| **Keyword**       | **Target date**                                                                                                |
| ----------------- | -------------------------------------------------------------------------------------------------------------- |
| `Today`           | today                                                                                                          |
| `Tomorrow`        | tomorrow                                                                                                       |
| `Monday`…`Sunday` | the next occurrence of that weekday — **if today already is that weekday, it counts as today**, not 7 days out |
| `This Week`       | this week's Sunday                                                                                             |
| `This Month`      | the last day of the current month                                                                              |

**Rule: pull the due date earlier, never push it later.** If the task has no due date, it gets set to the target date above. If it already has a due date that is _later_ than the target date, it gets pulled in to match the target date. If the existing due date is already the same as or earlier than the target date, it's left untouched. In other words: `new due date = min(existing due date, keyword-derived date)`.

- Example: task due tomorrow, moved into a `Today`-marked list → due date updates to today.
- Example: task due end-of-month, moved into a `Tomorrow`-marked list (and tomorrow is earlier than month-end) → due date updates to tomorrow.
- Example: task already due today, sitting in a `This Month`-marked list → untouched (today is already earlier than month-end).

If a list title contains more than one keyword (e.g. both "Today" and "Monday"), precedence is `Today > Tomorrow > named weekday > This Week > This Month` (most immediate wins).

### Sorting

Tasks reorder by priority (p1 on top) **by default, in every list**, on their own hourly trigger (`sortAllLists`). It is separate from the main decoration trigger (`scheduledProcessTasks`) because `move` has proven far more rate-limit-sensitive than `patch`. A `⬇️` in the **list's own name** reverses the sort (p4 on top).

### Color emoji, in detail

Twelve colors, each with two emoji, a square or heart and an animal (the table is in the [[Quick start - Taskemoji-script (Google Script)#Cheat sheet|cheat sheet]]). A task has at most one color emoji, in the Color slot at the very end of its title.

- **A typed code always decides the color, from any position.** Typing `-g` after a color that is already at the end of the title (`buy milk 🟧 -g`) recolors it. An earlier version dropped the new code in that case, and also when an in-place star `-s` followed the color.
- **All 24 emoji are color emoji.** They live in the Color slot; a list marker such as `+🐅`, `🦩+` or the bare `🦩` is routed there too; they are refused as periodic emoji (`d🐘` is ignored); and a `--` clear keeps them. Two _different_ colors in one list name collide: the first wins, including a square and an animal of the same color (`+🟧 +🐅`).
- **Codes match whole.** `-code` and `~code` are not case sensitive and only trigger when they stand alone (`-cat` and `~gray` are left alone). Every `-`-prefixed code (color, type, star) only triggers when preceded by whitespace or the start of the title, so `data-to-viz.com` is not corrupted by the `-to` type code.
- **Why animals.** Systems draw animal emoji in their own colors (a sauropod, a butterfly and a jellyfish each looked different from one system to the next), so the animals kept are the ones whose color stays recognizable. The plain square or heart is always the reliable choice.
- **Every color emoji is a single character.** (Black's animal was briefly 🐦‍⬛, a _joined_ emoji, and was replaced by the ant 🐜 to keep this simple. A title that still contains 🐦‍⬛ keeps it as a plain emoji, and retyping `~b` gives 🐜.) The emoji tokenizer treats any joined sequence (👩‍💻, 🏳️‍🌈, 🐦‍⬛ ...) as one emoji, so these are never split in two. A plain 🐦 is not a color.

### Not built yet: parent-task title markers

Spec'd but not yet built into the script — typed into a parent task's own title, would control its subtasks:

| **Marker** | **Effect**                                      |
| ---------- | ----------------------------------------------- |
| `+{emoji}` | Prepend `{emoji}` to this parent's **subtasks** |
| `{emoji}+` | Append `{emoji}` to this parent's **subtasks**  |

Intended behavior when built: the literal marker text stays visible in the parent's own title (not stripped, same as list titles). If a list-level `++`/`{emoji}++` rule and a parent's own `+{emoji}` rule both apply to the same subtasks, both should stack. Same emoji-identity routing as list markers would apply here too.

Subtask = a task whose Tasks-API resource has a `parent` field pointing at another task in the same list. Google Tasks only supports one level of nesting.

### Run schedule

Apps Script can't fire a trigger at an exact minute, only every 1/5/10/15/30 minutes at a phase it chooses. So there is **one cheap check trigger** (`scheduledProcessTasks`, every `CHECK_EVERY_MINUTES`, currently 1), and the `SCHEDULE` table at the top of the script decides whether a check becomes a real run of `processTasks`. A skipped check makes no Tasks API calls.

Current schedule (local time, `TIME_ZONE = 'Europe/Paris'`):

| **Band**      | **Cadence**  | **Real runs land at** |
| ------------- | ------------ | --------------------- |
| 00:00 – 08:00 | every 20 min | :00, :20, :40         |
| 08:00 – 22:00 | every minute | every minute          |
| 22:00 – 24:00 | every 10 min | :00, :10, :20 …       |

That is 876 runs/day. Runs are aligned to the clock: the first check inside each slot runs, so a run happens at the mark or within a check interval after it. Each slot runs at most once, and a run that fails still claims its slot, so there is no retry storm. `from` is inclusive, `to` exclusive (`'24:00'` = midnight), the first matching band wins, and minutes outside every band do not run at all. `CHECK_EVERY_MINUTES` must be 1, 5, 10, 15 or 30 and no larger than the smallest `every`.

- **No overlapping runs:** a script lock stops a new run starting while the previous one is still active (runs take ~25 s or more). A check blocked by the lock does not claim its slot, so it simply retries on the next check.
- Running `processTasks()` by hand is never gated or blocked by the lock.
- After changing the schedule or `CHECK_EVERY_MINUTES`, run `createTimeTrigger()` once. It deletes every old trigger that calls `processTasks` or `scheduledProcessTasks` and creates the check trigger. The Triggers page should then show exactly two: `scheduledProcessTasks` and `sortAllLists`.
- Check that `TIME_ZONE` matches where you are, otherwise the bands apply at the wrong local hours.
- The hourly `sortAllLists` trigger is separate and is not affected by `SCHEDULE`.
- Each run's log ends with `Run summary: N write(s), N read request(s), N s`. A no-change run on ~28 lists is ~29 read requests and ~25 s.

**Cost against Google's limits** (assuming ~26 s and 29 requests per no-change run, plus the hourly sort):

| **Daytime cadence**   | **Runs/day** | **Requests/day (limit 50,000)** | **Trigger time/day** |
| --------------------- | ------------ | ------------------------------- | -------------------- |
| every 1 min (current) | 876          | ~26,100 (52%)                   | ~6.5 h               |
| every 2 min           | 456          | ~13,900 (28%)                   | ~3.5 h               |
| every 5 min           | 204          | ~6,600 (13%)                    | ~1.7 h               |

Apps Script caps total trigger runtime at **90 min/day on a regular Google account and 6 h/day on Workspace**. Running every minute by day exceeds both, so it will be cut off partway through the day unless runs get much cheaper. Look at the `Run summary` seconds to see your real per-run time; the table scales linearly with it.

### Known engineering constraints

- `move` (used for sorting) is far more rate-limit-sensitive than `patch`. Both `processTasks` and `sortAllLists` self-limit to a capped number of writes per run and log a summary; a run may stop early and let the next scheduled run continue rather than erroring out.
- Task lists are fetched with pagination, so lists larger than one API page are fully seen.
- A list whose tasks have degenerate/duplicate `position` values (usually from an old bulk paste/import) can resist sorting; `repairListPositions('list name fragment')` exists as a one-time fix for this.