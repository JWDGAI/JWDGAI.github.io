---
date: 2026-10-26T17:59
---
# Taskemoji: emoji for Google Tasks

taskemoji is a small script that runs inside **your own Google account**. You write short codes in a task's title, or markers in a list's name, and it turns them into emoji, sorts every list by priority and sets due dates from list names. Priority, type and color then show at a glance on every device that shows Google Tasks.

| **You type**                   | **You get**                   |
| ------------------------------ | ----------------------------- |
| `p1 -tb draft the launch plan` | 🔴 🗄️ draft the launch plan  |
| `buy milk ~o`                  | buy milk 🐅                   |
| a list named `Groceries 🟥`    | every task in it ends with 🟥 |

**Optional companion:** the _taskemoji-calendar-colors_ Chrome extension paints tasks in Google Tasks and Google Calendar with their color (a 🟥 becomes a red bar or chip) and makes ⭐ tasks bold. The script works fine without it. See the extension's own README.

**Contents:** [Quick start](https://claude.ai/chat/3d0f949d-55d9-46ad-aa6f-3a9159f5ec4a#quick-start-about-10-minutes) · [Cheat sheet](https://claude.ai/chat/3d0f949d-55d9-46ad-aa6f-3a9159f5ec4a#cheat-sheet) · [Examples](https://claude.ai/chat/3d0f949d-55d9-46ad-aa6f-3a9159f5ec4a#examples) · [Settings](https://claude.ai/chat/3d0f949d-55d9-46ad-aa6f-3a9159f5ec4a#settings-you-can-change) · [Helper functions](https://claude.ai/chat/3d0f949d-55d9-46ad-aa6f-3a9159f5ec4a#helper-functions) · [Troubleshooting](https://claude.ai/chat/3d0f949d-55d9-46ad-aa6f-3a9159f5ec4a#troubleshooting) · [Reference](https://claude.ai/chat/3d0f949d-55d9-46ad-aa6f-3a9159f5ec4a#reference-the-rules-in-detail)

---

## Quick start (about 10 minutes)

You need a Google account that uses Google Tasks. Nothing is installed on your computer.

1. **Create the project.** Open [script.google.com](https://script.google.com/), click **New project** and name it `taskemoji`. Delete the sample code in `Code.gs`, paste in the whole of `TaskEmojis.gs`, and save.
2. **Add the Tasks service.** In the left sidebar, click **+** next to **Services**, choose **Google Tasks API** and click **Add**. Keep its identifier as `Tasks` (the script calls it by that name).
3. **Set your time zone.** Near the top of the script, change `const TIME_ZONE = 'Europe/Paris';` to yours, for example `'America/New_York'` or `'Asia/Tokyo'` ([list of names](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)). It decides when the schedule's day and night bands apply.
4. **Authorize it.** In the toolbar choose the function `processTasks` and click **Run**. Google asks for permission to manage your Google Tasks; approve it. If it says "Google hasn't verified this app", that is expected for your own script: click **Advanced**, then **Go to taskemoji (unsafe)**, then **Allow**. When the run finishes, the **Execution log** ends with a line like `Run summary: 3 write(s), 29 read request(s), 12 s`.
5. **Start the schedule.** Run `createTimeTrigger` once, then `createSortTrigger` once. Open **Triggers** (the clock icon): you should see exactly two, `scheduledProcessTasks` (every minute) and `sortAllLists` (every hour).
6. **Try it.** In Google Tasks create a task called `test p1 -tb -g`. Within a minute or two it becomes `🔴 🗄️ test 🟩`.

That is the whole setup. The rest of this page is for when you want more.

### Recommended: stop the weekly re-authorization

By default Google lets a personal script's permission lapse after **7 days**, and the script then quietly stops until you approve it again. Linking the script to your own Google Cloud project and _publishing_ its consent screen avoids that. It is free, and no review by Google is needed for personal use (you will just see the "unverified app" screen when you approve it).

1. In the [Google Cloud console](https://console.cloud.google.com/) create a project (any name) and note its **project number**.
2. **APIs & Services → Library:** find **Google Tasks API** and click **Enable**.
3. **OAuth consent screen:** choose the user type **External**, fill in an app name and your email, and set the publishing status to **In production** (not _Testing_). Google may ask for an app home page and a privacy-policy link; for a personal tool, any page you control will do.
4. Back in Apps Script, open **Project Settings** (the gear icon) → **Google Cloud Platform (GCP) Project** → **Change project**, and paste the project number.
5. Run `processTasks` once more and approve the permission again.

Google moves these menus around from time to time. What matters is the end state: the **Tasks API is enabled**, the consent screen is **External** and **In production**, and your Apps Script project is **linked** to that Cloud project.

### How often it runs

One cheap check runs every minute, and the `SCHEDULE` table at the top decides whether that check becomes a real run. By default (in your `TIME_ZONE`): every 20 minutes from 00:00 to 08:00, **every minute** from 08:00 to 22:00, and every 10 minutes from 22:00 to 24:00.

Google limits how much trigger time a script may use per day (about **90 minutes** on a regular Google account, 6 hours on Google Workspace) and how many Tasks API requests it may make (50,000 a day). The default favors fast reactions, so if you have many lists, slow it down:

| **Time one run takes (see `Run summary`)** | **Every minute by day**       | **Every 10 minutes by day** |
| ------------------------------------------ | ----------------------------- | --------------------------- |
| about 3 s (a few lists)                    | about 44 min/day: fine        | about 6 min/day             |
| about 25 s (around 30 lists)               | about 6 h/day: over the limit | about 50 min/day: fine      |

To change it, edit the `every` value of the 08:00 to 22:00 band, then run `createTimeTrigger` again. More detail: [Run schedule](https://claude.ai/chat/3d0f949d-55d9-46ad-aa6f-3a9159f5ec4a#run-schedule).

---

## Cheat sheet

### In a task's title

Type the code anywhere in the title, standing alone (a space, or the start of the title, before it). Codes are not case sensitive. The script moves the emoji into fixed places:

```
[priority][type] your text [color]          (a ⭐ stays wherever you put it)
```

**Priority and star**

| **Type**            | **Result**                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `p1` `p2` `p3` `p4` | 🔴 🟠 🟡 🟢. They can be combined (`p1 p2` gives 🔴🟠). Every list is sorted by priority, p1 on top. |
| `-s`                | ⭐ right where you typed it                                                                           |
| `s_` · `_s`         | ⭐ at the start · at the end                                                                          |

**Type** (what kind of task it is; several can be combined)

| **Code** | **Emoji** | **Type**                       |
| -------- | --------- | ------------------------------ |
| `-tb`    | 🗄️       | backlog                        |
| `-th`    | ⚙️        | maintenance (MOC)              |
| `-to`    | 📍        | open loop, specific place/time |
| `-tt`    | 🕰️       | explore if time                |
| `-ti`    | 💡        | idea, someday                  |
| `-tr`    | 📌        | reference                      |
| `-tg`    | 🏸        | toy project (game)             |
| `-te`    | 📅        | events                         |
| `-tap`   | 🕢        | appointment                    |
| `-tm`    | 🗃️       | milestones                     |
| `-tf`    | 𝝨        | formula                        |
| `-ta`    | 💎        | artefact                       |
| `-tar`   | 🏟️       | arena                          |
| `-td`    | ❓         | decisions                      |
| `-tp`    | 💭        | to ponder                      |
| `-ts`    | 📏        | standards                      |
| `-tx`    | 🔍        | to explore                     |

**Color** (one per task, always at the end). `-code` gives the square or heart, `~code` gives the animal.

| **Code** | **Color** | **`-code`** | **`~code`** |
| -------- | --------- | ----------- | ----------- |
| `g`      | green     | 🟩          | 🦎          |
| `br`     | brown     | 🟫          | 🐫          |
| `r`      | red       | 🟥          | 🐞          |
| `n`      | navy blue | 🟦          | 🫐          |
| `o`      | orange    | 🟧          | 🐅          |
| `v`      | purple    | 🟪          | 🦄          |
| `y`      | yellow    | 🟨          | 🐥          |
| `w`      | white     | ⬜           | 🦢          |
| `b`      | black     | ⬛           | 🐜          |
| `p`      | pink      | 🩷          | 🦩          |
| `c`      | cyan      | 🩵          | 🐬          |
| `gr`     | grey      | 🩶          | 🐘          |

To change a color, just type another code: `-g` on a task that already ends in 🟧 makes it 🟩. If you type several color codes, the first one wins.

### In a list's name

Markers in the **name of a list** apply to every task in that list. Write them anywhere in the name.

| **Put this in the list name**                                           | **What the tasks of the list get**                                                                                                                                    |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **a color emoji on its own**, e.g. `Groceries 🟥`                       | that color at the end of the title. **No `+` needed.** Any of the 24 color emoji above works (🟥 🟩 🩵 🐅 🐘 and so on).                                              |
| `+🔥` · `🔥+`                                                           | 🔥 added at the start · at the end                                                                                                                                    |
| `++🔥` · `🔥++`                                                         | the same, for tasks **and** subtasks. `_+🔥` · `🔥_+`: subtasks only                                                                                                  |
| `-+🔥` · `🔥-+`                                                         | **replace** what other markers added at the start · at the end with this one                                                                                          |
| `+🔴` · `+📅` and so on                                                 | a priority or type emoji goes to its own place in the title, whichever form you use                                                                                   |
| `--` · `-_` · `_-`                                                      | clear the emoji that markers added at the start and end · only the start · only the end (priority, type and color are never cleared)                                  |
| `d🎉` `w🎉` `m🎉` `y🎉` (also `🎉d` and so on)                          | a repeating emoji: one more 🎉 each day, week, month or year (see [Reference](https://claude.ai/chat/3d0f949d-55d9-46ad-aa6f-3a9159f5ec4a#memory-for-periodic-emoji)) |
| `Today` · `Tomorrow` · `Monday`...`Sunday` · `This Week` · `This Month` | set the due date, but only ever earlier, never later than a date the task already has                                                                                 |
| `⬇️`                                                                    | reverse the sort (p4 on top)                                                                                                                                          |
| `t🥸`                                                                   | treat 🥸 as a type, in this list only                                                                                                                                 |

**Good to know**

- A bare color works like `+🟥`: it colors **parent tasks**. Use `++🟥` to color subtasks too (or `_+🟥` for subtasks only).
- **Only color emoji work bare.** A bare 🔥, 🔴 or 📅 in a list name does nothing, it is just part of the name. Use a `+` for those.
- **One color per list.** If a name holds different colors, the first one wins. A loser written with a `+` is removed from the name; a loser written bare is left alone and simply ignored. A color that is already in the name is never repeated.
- Because a bare color emoji now counts, don't use the 24 color emoji as decoration in list names unless you want that color.
- The script never changes a list's name, except to remove a losing `+` color as described above.

---

## Examples

**In a task's title**

| **You type in a task**         | **You get**                  |
| ------------------------------ | ---------------------------- |
| `p1 -tb draft the launch plan` | 🔴 🗄️ draft the launch plan |
| `call the bank p2 -tap`        | 🟠 🕢 call the bank          |
| `buy milk ~o`                  | buy milk 🐅                  |
| `read the paper -gr -s`        | read the paper ⭐️ 🩶         |
| `team sync -te p3`             | 🟡 📅 team sync              |
| `derive the formula -tf p1`    | 🔴 𝝨 derive the formula     |
| `stadium visit -tar ~c`        | 🏟️ stadium visit 🐬         |
| `ship it p1 p2`                | 🔴🟠 ship it                 |
| `pay rent -r s_`               | ⭐️ pay rent 🟥               |

**In a list's name** (shown for a task called `buy milk`)

| **List name**     | **Task `buy milk` becomes** | **A subtask `buy milk` becomes** |
| ----------------- | --------------------------- | -------------------------------- |
| `Groceries 🟥`    | buy milk 🟥                 | buy milk                         |
| `🩵 Work`         | buy milk 🩵                 | buy milk                         |
| `Home +🏠`        | 🏠 buy milk                 | buy milk                         |
| `Errands ✅+`      | buy milk ✅                  | buy milk                         |
| `Reading 🟪 +📚`  | 📚 buy milk 🟪              | buy milk                         |
| `Meetings +📅 🟦` | 📅 buy milk 🟦              | buy milk                         |
| `Projects +🔴`    | 🔴 buy milk                 | buy milk                         |
| `Mixed 🟥 ++⭐`    | ⭐ buy milk 🟥               | ⭐ buy milk                       |

With a list called `Today 🟥`, every task also gets today as its due date.

---

## Settings you can change

All of them are constants at the top of `TaskEmojis.gs`.

| **Setting**           | **Default**                             | **What it does**                                                                                                    |
| --------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `TIME_ZONE`           | `'Europe/Paris'`                        | Your time zone. **Change it.** The schedule's bands use it.                                                         |
| `SCHEDULE`            | night 20 min, day 1 min, evening 10 min | How often real runs happen in each part of the day. After editing, run `createTimeTrigger` again.                   |
| `CHECK_EVERY_MINUTES` | `1`                                     | How often the cheap check fires. Must be 1, 5, 10, 15 or 30, and no larger than the smallest `every` in `SCHEDULE`. |
| `SORT_EVERY_HOURS`    | `1`                                     | How often lists are re-sorted. After editing, run `createSortTrigger` again.                                        |
| `MAX_WRITES_PER_RUN`  | `50`                                    | A safety cap on changes per run. When it is reached the run stops and the next one carries on.                      |
| `PRIORITY_RULES`      | `p1`..`p4` → 🔴 🟠 🟡 🟢                | The priority codes and their emoji.                                                                                 |
| `PERIOD_CAPS`         | d 7, w 5, m 12, y 10                    | The most repeats a repeating emoji can show.                                                                        |
| `REVERSE_ORDER_MARK`  | `⬇️`                                    | The list-name marker that reverses the sort.                                                                        |

---

## Helper functions

Pick a function in the toolbar's dropdown and click **Run**.

| **Function**                                 | **What it does**                                                                                                                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `processTasks`                               | Runs everything once, right now. Never blocked by the schedule. Use it to test after an edit.                                                                                                            |
| `scheduledProcessTasks`                      | What the every-minute trigger calls. It decides whether to run `processTasks` now.                                                                                                                       |
| `sortAllLists`                               | Sorts every list by priority (the hourly trigger calls it).                                                                                                                                              |
| `createTimeTrigger` · `createSortTrigger`    | Create the two triggers. Run once, and again after you change the schedule.                                                                                                                              |
| `diagnosticPeriodic`                         | Read-only. Shows why a repeating emoji has not appeared yet. Put part of a list name in the string inside the function, save, run.                                                                       |
| `backdateFirstSeen`                          | Pretends the script first saw a list's tasks N days ago, to test repeating emoji. Edit the list name and the number of days inside, save, run.                                                           |
| `repairListPositions('part of a list name')` | One-time fix for a list that will not sort (usually after a bulk paste). The Run button cannot pass an argument, so add a wrapper: `function fixInbox() { repairListPositions('Inbox'); }` and run that. |

---

## Troubleshooting

- **Nothing happens.** Open **Triggers**: there should be `scheduledProcessTasks` and `sortAllLists`. Open **Executions** to see errors. Run `processTasks` by hand and read the log.
- **It worked, then stopped after about a week.** The permission lapsed. Run `processTasks` and approve again, and do the [[Quick start - Taskemoji-script (Google Script)#Recommended stop the weekly re-authorization|recommanded step]] so it does not happen again.
- **"Exceeded maximum execution time", or a quota message.** It is using too much trigger time. Lower the frequency (see [[Quick start - Taskemoji-script (Google Script)#How often it runs|How often it runs]]).
- **"Self-imposed write limit reached".** Normal. It is the safety cap; the next run carries on.
- **A code in a title is ignored.** It must stand alone: `-tb` works, `x-tb` does not. Repeating emoji (`w☠️`) only work in a **list's** name and must be glued to the letter, with no space.
- **A bare color in a list name did nothing.** Only the 24 color emoji work bare. Check the emoji is one of them (🟢 is a _priority_, not a color) and that the name does not already contain an earlier, different color.
- **An old emoji stays on my tasks after I changed the list name.** Markers add emoji; they do not remove earlier ones by themselves. Use `-+` to replace, or `--` to clear.
- **The list will not sort.** Run `repairListPositions` (see above) once.
- **An emoji looks different on my phone.** Every system draws animal emoji in its own colors, which is why each color also has a plain square or heart. The script and the extension match the character, not how it is drawn.
- **Privacy.** The script reads and edits only your Google Tasks, inside your own account. It remembers when it first saw each task in the script's own property store. Nothing is sent anywhere else.