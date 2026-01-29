#!/usr/bin/env node
/**
 * Sync skills and collection to docs/public for GitHub Pages serving
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(REPO_ROOT, "skills");
const COLLECTION_FILE = path.join(REPO_ROOT, "collection.json");
const DOCS_PUBLIC = path.join(REPO_ROOT, "docs", "public");
const DOCS_SKILLS = path.join(DOCS_PUBLIC, "skills");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copySkillFiles() {
  ensureDir(DOCS_SKILLS);
  
  const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith(".json"));
  let count = 0;
  
  for (const file of files) {
    const src = path.join(SKILLS_DIR, file);
    const dest = path.join(DOCS_SKILLS, file);
    fs.copyFileSync(src, dest);
    count++;
  }
  
  console.log(`✓ Copied ${count} skill files to docs/public/skills/`);
}

function copyCollection() {
  ensureDir(DOCS_PUBLIC);
  
  const dest = path.join(DOCS_PUBLIC, "collection.json");
  fs.copyFileSync(COLLECTION_FILE, dest);
  
  console.log(`✓ Copied collection.json to docs/public/`);
}

function main() {
  console.log("Syncing files to docs/public for GitHub Pages...\n");
  
  copySkillFiles();
  copyCollection();
  
  console.log("\n✓ Sync complete!");
}

main();
