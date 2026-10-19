// Adds a `date:` property to every Markdown note that doesn't have one,
// using the file's creation date (or last modified date if unavailable).
//
// Preview (changes nothing):  node add-dates.mjs content
// Apply the changes:          node add-dates.mjs content --write
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import { join } from "node:path"

const root = process.argv[2] || "content"
const write = process.argv.includes("--write")

const pad = (n) => String(n).padStart(2, "0")
const format = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue // skip .obsidian, .trash, etc.
    const path = join(dir, name)
    const st = statSync(path)
    if (st.isDirectory()) walk(path)
    else if (name.endsWith(".md")) handle(path, st)
  }
}

function handle(path, st) {
  const text = readFileSync(path, "utf8")
  const nl = text.includes("\r\n") ? "\r\n" : "\n"
  const created = st.birthtimeMs > 0 ? st.birthtime : st.mtime
  const line = `date: ${format(created)}`

  let updated
  if (text.startsWith("---" + nl)) {
    const end = text.indexOf(nl + "---", 3)
    if (end === -1) return console.log(`skip (unclosed frontmatter): ${path}`)
    const frontmatter = text.slice(0, end)
    if (/^date\s*:/m.test(frontmatter)) return // already has a date
    updated = "---" + nl + line + nl + text.slice(3 + nl.length)
  } else {
    updated = "---" + nl + line + nl + "---" + nl + nl + text
  }

  console.log(`${write ? "added" : "would add"} ${line}  ->  ${path}`)
  if (write) writeFileSync(path, updated)
}

walk(root)
if (!write) console.log("\nPreview only. Run again with --write to apply.")
