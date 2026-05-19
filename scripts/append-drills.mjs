// One-shot helper: append a drills array to an existing file, validate, write back.
// Usage:  node scripts/append-drills.mjs <target.json> <new-drills.json>
import fs from "node:fs";
import path from "node:path";

const [, , targetPath, newPath] = process.argv;
if (!targetPath || !newPath) {
  console.error("usage: node scripts/append-drills.mjs <target.json> <new-drills.json>");
  process.exit(1);
}

const existing = JSON.parse(fs.readFileSync(targetPath, "utf8"));
const incoming = JSON.parse(fs.readFileSync(newPath, "utf8"));

if (!Array.isArray(existing) || !Array.isArray(incoming)) {
  console.error("both files must be JSON arrays");
  process.exit(1);
}

const ids = new Set(existing.map((d) => d.id));
const dupes = incoming.filter((d) => ids.has(d.id));
if (dupes.length) {
  console.error("duplicate IDs would be created:", dupes.map((d) => d.id).join(", "));
  process.exit(1);
}

for (const d of incoming) {
  if (!d.id || !d.level || !d.prompt || !d.answer || !d.hint || !d.grammarNote) {
    console.error("missing required fields in:", d.id ?? "(no id)");
    process.exit(1);
  }
}

const merged = [...existing, ...incoming];
fs.writeFileSync(targetPath, JSON.stringify(merged, null, 2) + "\n");
console.log(`appended ${incoming.length} → total ${merged.length} in ${path.basename(targetPath)}`);
