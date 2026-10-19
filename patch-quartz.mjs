// Reapplies two fixes to Quartz plugins so the Explorer sorts posts newest first.
// Run from the project root after installing packages: node patch-quartz.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs"

function patch(file, label, fn) {
  if (!existsSync(file)) {
    console.log(`[patch] skip, not found: ${file}`)
    return
  }
  const before = readFileSync(file, "utf8")
  const after = fn(before)
  if (after === null) {
    console.warn(`[patch] WARNING: could not apply "${label}" to ${file} (plugin code changed?)`)
  } else if (after === before) {
    console.log(`[patch] already patched: ${file}`)
  } else {
    writeFileSync(file, after)
    console.log(`[patch] patched: ${file}`)
  }
}

// 1. Keep dates in contentIndex.json
patch(
  "node_modules/@quartz-community/content-index/dist/index.js",
  "keep dates",
  (src) => {
    if (!/delete \w+\.date;/.test(src)) return null
    return src.replace(/(\/\/ )?delete (\w+)\.date;/g, (m, commented, v) =>
      commented ? m : `// delete ${v}.date;`,
    )
  },
)

// 2. Sort posts by date (newest first) in the Explorer's default sort
const explorerFiles = [
  "node_modules/@quartz-community/explorer/dist/index.js",
  "node_modules/@quartz-community/explorer/dist/components/index.js",
  ".quartz/plugins/explorer/dist/index.js",
  ".quartz/plugins/explorer/dist/components/index.js",
]

for (const file of explorerFiles) {
  patch(file, "date sort", (src) => {
    if (src.includes("data.date ? new Date")) return src
    const re = /sortFn: \((\w+), (\w+)\) => \{/
    if (!re.test(src)) return null
    return src.replace(re, (m, a, b) => `${m}
    if (!${a}.isFolder && !${b}.isFolder) {
      const da = ${a}.data && ${a}.data.date ? new Date(${a}.data.date).getTime() : 0;
      const db = ${b}.data && ${b}.data.date ? new Date(${b}.data.date).getTime() : 0;
      if (da !== db) return db - da;
    }`)
  })
}
