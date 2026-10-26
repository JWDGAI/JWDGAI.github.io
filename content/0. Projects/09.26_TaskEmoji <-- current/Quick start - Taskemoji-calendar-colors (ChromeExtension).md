---
date: 2026-10-26T17:59
---
# Taskemoji-calendar-colors

A small Chrome extension that **colors your tasks in Google Tasks and Google Calendar** from the emoji in their titles (🟥 🩵 🐅 ...) and makes tasks with a ⭐ bold. It is the companion of the taskemoji Apps Script, which puts those emoji in your titles, but it also works on its own: type a color emoji into any task title and it is colored.
![[Documentation-ChromeExtension-1793037343622.jpeg|550]]
*Illustration: the real extension running on a stand-in page. The twelve colors in Google Tasks (left) and Google Calendar (right)*

## Quick start (2 minutes)

1. **Unzip** this folder somewhere permanent. Chrome loads the extension from there every time, so don't delete it afterwards.
2. Open `chrome://extensions` and turn on **Developer mode** (top right).
3. Click **Load unpacked** and choose the `taskemoji-calendar-colors` folder.
4. Open (or refresh) [Google Tasks](https://tasks.google.com/) or [Google Calendar](https://calendar.google.com/). Add 🟥 at the end of a task title: the task turns red.

It works in desktop Chrome. Other browsers built on Chromium (Vivaldi, Edge, Brave) can load unpacked extensions too, but only Vivaldi and Chrome have been tested. The Google Tasks and Calendar apps on phones and tablets are not affected (but the in-browser rendering can if you also add the extension to your device browser (only tested with Vivaldi browser)).

## What it recognizes

### Twelve colors, two emoji each

Each color has a square or heart and an animal. **Either one sets the color.**

| **color** | **emoji** | **color** | **emoji** | **color** | **emoji** |
| --------- | --------- | --------- | --------- | --------- | --------- |
| green     | 🟩 🦎     | navy blue | 🟦 🫐     | white     | ⬜ 🦢      |
| brown     | 🟫 🐫     | orange    | 🟧 🐅     | black     | ⬛ 🐜      |
| red       | 🟥 🐞     | purple    | 🟪 🦄     | pink      | 🩷 🦩     |
| yellow    | 🟨 🐥     | cyan      | 🩵 🐬     | grey      | 🩶 🐘     |

If a title contains several, **the last one wins**. Only these emoji count: the priority circles (🔴 🟠 🟡 🟢) and the type emoji are not colors.

### Stars

A title containing ⭐ (anywhere in it) gets **bold text**: gold with a thin dark outline in Calendar (so it stays readable on every color), red in Tasks. 🌟 ★ ✨ do not count.

In Google Tasks only the **title** counts. An emoji typed in a task's description is ignored.

## How it looks

- **Google Calendar** (month, week, day and schedule views): the task's chip is filled with its color.
- **Google Tasks** (tasks.google.com, the Tasks view inside Calendar, and the Tasks side panel in Calendar, Gmail and Docs): a colored **bar on the left** plus a very light tint of the same color. While you hover over or focus a row, the tint steps aside so Google's own highlight and buttons look normal; the bar stays.
- **Subtasks** (Google Tasks): the same bar and tint, starting at the subtask's own indent, so subtasks form a staircase under their parent. A subtask with **no color emoji of its own takes its parent's color**; one with its own color keeps it. Calendar does not say which task is a subtask of which, so there a subtask is colored only by its own emoji.

## Using it with the taskemoji script

The extension **never changes your tasks**; it only changes how they look in your browser. The Apps Script is what writes the emoji, so the two fit together:

- type `-o` (square) or `~o` (animal) in a task title and the script turns it into 🟧 or 🐅;
- or put a color emoji in a **list's name**, e.g. `Groceries 🟥`, and the script gives every task in that list the color.

Then the extension paints them. Setup and the full list of codes are in the script's guide (`task-emoji-spec.md`).

## Customize

Everything is in `content.css`. After editing, click the **reload** icon on the extension's card in `chrome://extensions` and refresh the page.

| **To change**                         | **Edit**                                                                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| a color                               | the hex values in that color's group of rules                                                                                                       |
| the Tasks bar width and tint strength | `--tke-bar` and `--tke-tint` on the `:root` line near the top (`0.16` means 16% tint)                                                               |
| subtasks quieter                      | `--tke-sub-bar: 3px` and `--tke-sub-tint: 0.08`                                                                                                     |
| the star colors                       | `--tke-star-cal` (Calendar gold), `--tke-star-halo` (its outline) and `--tke-star-task` (Tasks red); the lighter dark-mode red is on the line below |

To stop subtasks inheriting their parent's color, set `INHERIT_PARENT_COLOR` to `false` near the top of `content.js`.

## Updating

Replace the files in the same folder with the new ones, click **reload** on the extension's card in `chrome://extensions`, and refresh Calendar / Tasks.

## Troubleshooting

- **Nothing is colored.** Refresh the page after installing. Check the extension is switched on in `chrome://extensions`, and that the title really contains one of the emoji in the table (🟢 and 🔴 are priorities, not colors).
- **It worked, then stopped.** Google occasionally redesigns its pages, and the extension reads their structure. Reload the extension and refresh; if it still fails after a Google update, the extension needs an update.
- **A color looks different on another computer.** Each system draws emoji its own way. The extension matches the character, not the drawing, so the color you see on the task is always the same.
- **Navy and black bars are faint in dark mode.** The bars are dark colors on a dark page. The fill in Calendar is not affected.
- **Colors appear in Tasks but not on a subtask in Calendar.** Calendar has no parent information, so subtasks there only use their own emoji.

## Privacy

It runs only on `calendar.google.com` and `tasks.google.com` (including frames of tasks.google.com). It asks for **no permissions**, makes **no network requests**, and stores nothing. It reads the task titles shown on those pages to decide the colors, and does nothing else with them.
