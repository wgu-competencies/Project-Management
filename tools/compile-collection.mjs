#!/usr/bin/env node
/**
 * Compile collection.json from:
 * - collection.meta.json (collection-level metadata)
 * - skills/*.json (canonical skill definitions)
 * Option A: skill files are source of truth; collection.json is a build artifact.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import process from "node:process";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_META = path.join(REPO_ROOT, "collection.meta.json");
const DEFAULT_SKILLS_DIR = path.join(REPO_ROOT, "skills");
const DEFAULT_OUT = path.join(REPO_ROOT, "skills-collection.json");

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === "ENOENT") die(`ERROR: Missing file: ${filePath}`);
    if (err.name === "SyntaxError") die(`ERROR: Invalid JSON in ${filePath}: ${err.message}`);
    die(`ERROR: Failed reading ${filePath}: ${err.message}`);
  }
}

function writeText(filePath, text) {
  fs.writeFileSync(filePath, text, "utf8");
}

function readTextOrEmpty(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (err) {
    if (err.code === "ENOENT") return "";
    die(`ERROR: Failed reading ${filePath}: ${err.message}`);
  }
}

function stableStringify(obj) {
  // Keep deterministic output:
  // - 2-space indentation
  // - keep key order as in objects we construct (do not sort keys globally)
  return JSON.stringify(obj, null, 2) + "\n";
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function listJsonFiles(dirPath) {
  if (!fs.existsSync(dirPath)) die(`ERROR: skills directory does not exist: ${dirPath}`);
  const results = [];

  function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile() && ent.name.toLowerCase().endsWith(".json")) results.push(full);
    }
  }

  walk(dirPath);
  results.sort((a, b) => a.localeCompare(b));
  if (results.length === 0) die(`ERROR: No skill JSON files found under: ${dirPath}`);
  return results;
}

function validateMeta(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    die("ERROR: collection.meta.json must contain a JSON object");
  }
  const required = ["@context", "id", "type", "name", "description", "author"];
  const missing = required.filter((k) => !(k in meta));
  if (missing.length) die(`ERROR: collection.meta.json missing keys: ${missing.join(", ")}`);
  if (meta.type !== "Collection") die("ERROR: collection.meta.json 'type' must be 'Collection'");
}

function validateSkill(skill, skillPath, collectionId) {
  if (!skill || typeof skill !== "object" || Array.isArray(skill)) {
    die(`ERROR: ${skillPath} must contain a JSON object (one skill)`);
  }
  
  // Check for 'id' field
  if (!("id" in skill)) {
    die(`ERROR: ${skillPath} missing keys: id`);
  }
  
  // Accept both 'type' and '@type' (JSON-LD format)
  const typeValue = skill.type || skill["@type"];
  if (!typeValue) {
    die(`ERROR: ${skillPath} missing keys: type or @type`);
  }

  if (typeValue !== "RichSkillDescriptor") {
    die(`ERROR: ${skillPath} has type=${JSON.stringify(typeValue)}; expected "RichSkillDescriptor"`);
  }

  if ("isMemberOf" in skill && skill.isMemberOf !== collectionId) {
    die(
      `ERROR: ${skillPath} has isMemberOf=${JSON.stringify(skill.isMemberOf)} but expected ${JSON.stringify(
        collectionId
      )}`
    );
  }
}

function normalizeSkill(skill, { collectionId, collectionAuthor }) {
  // Shallow copy (do not mutate source)
  const s = { ...skill };

  // Ensure membership pointer exists in compiled artifact
  if (!("isMemberOf" in s)) s.isMemberOf = collectionId;

  // Default author to collection author if missing
  if (!("author" in s)) s.author = collectionAuthor;

  return s;
}

function parseArgs(argv) {
  const args = {
    meta: DEFAULT_META,
    skillsDir: DEFAULT_SKILLS_DIR,
    out: DEFAULT_OUT,
    sortBy: "id", // "id" | "skillName"
    mode: null, // "write" | "check"
  };

  for (let i = 2; i < argv.length; i++) {
    const tok = argv[i];
    if (tok === "--meta") args.meta = argv[++i];
    else if (tok === "--skills-dir") args.skillsDir = argv[++i];
    else if (tok === "--out") args.out = argv[++i];
    else if (tok === "--sort-by") args.sortBy = argv[++i];
    else if (tok === "--write") args.mode = "write";
    else if (tok === "--check") args.mode = "check";
    else if (tok === "--help" || tok === "-h") {
      console.log(`
Usage:
  node tools/compile-collection.mjs --write
  node tools/compile-collection.mjs --check

Options:
  --meta <path>        Path to collection.meta.json (default: ${DEFAULT_META})
  --skills-dir <dir>   Directory of skill JSON files (default: ${DEFAULT_SKILLS_DIR})
  --out <path>         Output path for compiled skills-collection.json (default: ${DEFAULT_OUT})
  --sort-by <key>      id | skillName (default: id)
  --write              Write compiled skills-collection.json
  --check              Exit non-zero if skills-collection.json is out of date
`);
      process.exit(0);
    } else {
      die(`ERROR: Unknown argument: ${tok}`);
    }
  }

  if (!args.mode) die("ERROR: Must specify exactly one of --write or --check");
  if (!["id", "skillName"].includes(args.sortBy)) die('ERROR: --sort-by must be "id" or "skillName"');

  return args;
}

function compile({ metaPath, skillsDir, sortBy }) {
  const meta = readJson(metaPath);
  validateMeta(meta);

  const collectionId = meta.id;
  const collectionAuthor = meta.author;

  const skillFiles = listJsonFiles(skillsDir);

  const skills = skillFiles.map((fp) => {
    const data = readJson(fp);
    validateSkill(data, fp, collectionId);
    return normalizeSkill(data, { collectionId, collectionAuthor });
  });

  skills.sort((a, b) => {
    const aKey = String(a?.[sortBy] ?? "").toLowerCase();
    const bKey = String(b?.[sortBy] ?? "").toLowerCase();
    if (aKey !== bKey) return aKey.localeCompare(bKey);

    const aId = String(a?.id ?? "").toLowerCase();
    const bId = String(b?.id ?? "").toLowerCase();
    return aId.localeCompare(bId);
  });

  const compiled = { ...meta, skills };
  const text = stableStringify(compiled);
  const hash = sha256(text);

  return { compiled, text, hash };
}

function main() {
  const args = parseArgs(process.argv);

  const metaPath = path.resolve(args.meta);
  const skillsDir = path.resolve(args.skillsDir);
  const outPath = path.resolve(args.out);

  const { text: newText } = compile({ metaPath, skillsDir, sortBy: args.sortBy });
  const oldText = readTextOrEmpty(outPath);

  if (args.mode === "write") {
    writeText(outPath, newText);
    console.log(`WROTE: ${outPath}`);
    return;
  }

  // check
  if (oldText !== newText) {
    console.error("ERROR: skills-collection.json is out of date.\n");
    console.error("Run:\n  node tools/compile-collection.mjs --write\n");
    process.exit(1);
  }

  console.log("OK: skills-collection.json is up to date.");
}

main();