---
date: 2026-10-06T16:38
---
**Priority, type and color for Google Tasks, with a few typed characters.**
## Abstract: what does it do

Google Tasks is simple, and a little too plain: no priorities, no categories, no colors. taskemoji adds them. You type a short code in a task's title (or a marker in a list's name) and it becomes an emoji, so priority, type and color show at a glance on every device. It also sorts each list by priority, sets due dates from list names and, in desktop Chrome, paints your tasks with their color.

| **You type**                   | **You get**                                            |
| ------------------------------ | ------------------------------------------------------ |
| `p1 -tb draft the launch plan` | 🔴 🗄️ draft the launch plan                           |
| `buy milk ~o`                  | buy milk 🐅                                            |
| a list named `Groceries 🟥`    | every task in it ends with 🟥, and shows red in Chrome |
![[README-1793041465785.jpeg|A few tasks as written by the script and painted by the extension]]
_The script writes the emoji (🔴 🗄️ 🟦 ...). The extension turns them into colors, a bar for each task in Tasks and a chip in Calendar._

### Why two parts?

taskemoji is a **Google script** plus a **Chrome extension**, because each one can do something the other cannot:

- **The script writes the emoji.** It runs on Google's servers, in your own account, around the clock, and puts plain emoji in your task titles. Titles sync everywhere, so `🔴 🗄️` shows up on your phone, in Gmail and in Calendar. It also sorts and sets due dates. But it can only write text: Google Tasks has no color field, and Calendar cannot color tasks, so a script can never make anything _colored_.
- **The extension paints.** It changes how Google Tasks and Google Calendar _look_ in desktop Chrome: colored bars and chips, bold stars. It cannot do the script's job, because it only runs while a Chrome tab is open and never changes your data.
- **Each works alone.** Script only: emoji everywhere, no colors. Extension only: type a color emoji or a ⭐ by hand and it is painted. Together: type `-o`, get 🐅, see an orange task.

It also keeps permissions small. Only the script can touch your tasks (you approve it once); the extension asks for no permission at all.

## Taskemoji Script

A Google Apps Script that lives in your own Google account: free, no server, set up in about 10 minutes. It checks your lists every minute or so and rewrites titles.

**What it does**

- turns codes in a task title into emoji: **priority** (`p1` to `p4`), **type** (17 kinds, such as `-tb` backlog or `-te` event), **color** (12 colors, `-o` for a square, `~o` for an animal) and **star** (`-s`)
- applies **markers in a list's name** to every task of that list: a color emoji on its own, `+🔥` to add an emoji, and more
- **sorts** every list by priority, p1 on top
- sets **due dates** from list names (`Today`, `Friday`, `This Week`) and can grow a **repeating emoji** (`w🎉` adds one 🎉 per week)

**In a task's title**

| **You type**                   | **You get**                  |
| ------------------------------ | ---------------------------- |
| `p1 -tb draft the launch plan` | 🔴 🗄️ draft the launch plan |
| `call the bank p2 -tap`        | 🟠 🕢 call the bank          |
| `buy milk -o`                  | buy milk 🟧                  |
| `buy milk ~o`                  | buy milk 🐅                  |
| `read the paper -gr -s`        | read the paper ⭐️ 🩶         |

**In a list's name** (shown for a task called `buy milk`)

| **List name**    | **Task becomes** |
| ---------------- | ---------------- |
| `Groceries 🟥`   | buy milk 🟥      |
| `Home +🏠`       | 🏠 buy milk      |
| `Errands ✅+`     | buy milk ✅       |
| `Reading 🟪 +📚` | 📚 buy milk 🟪   |

**Set up:** paste `TaskEmojis.gs` into a new project at [script.google.com](https://script.google.com/), add the _Google Tasks API_ service, run `processTasks` once to approve it, then run `createTimeTrigger` and `createSortTrigger`. Full steps, every code and more examples are in **`task-emoji-spec.md`**.

➡ **See also:** [[Quick start - Taskemoji-script (Google Script)]] and [[Taskemoji-script - Detailed Doc]]

## Taskemoji Chrome Extension

A small extension for desktop Chrome that paints tasks from the emoji in their titles. It changes how pages look, never your tasks.

- **Google Calendar:** the task's chip is filled with its color.
- **Google Tasks:** a colored bar on the left with a light tint. A **subtask** is indented and takes its parent's color.
- **Stars:** a ⭐ in a title makes it bold (gold in Calendar, red in Tasks).

Twelve colors, each set by a square or heart **or** by an animal/fruit:

| 🟩 🦎 green  | 🟫 🐫 brown  | 🟥 🐞 red    | 🟦 🫐 navy |
| ------------ | ------------ | ------------ | ---------- |
| 🟧 🐅 orange | 🟪 🦄 purple | 🟨 🐥 yellow | ⬜ 🦢 white |
| ⬛ 🐜 black   | 🩷 🦩 pink   | 🩵 🐬 cyan   | 🩶 🐘 grey |

**Install:** unzip `taskemoji-calendar-colors`, open `chrome://extensions`, turn on _Developer mode_, click _Load unpacked_ and pick the folder. Details are in its own `README.md`.

It runs only on `calendar.google.com` and `tasks.google.com`, asks for no permissions, makes no network requests and stores nothing.
➡ **See also:** [[Quick start - Taskemoji-calendar-colors (ChromeExtension)]]

## Demo Video

#TODO
