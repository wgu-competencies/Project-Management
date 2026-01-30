#!/usr/bin/env node
/**
 * Compile competencies-collection.json from:
 * - competencies.meta.json (collection-level metadata)
 * - competencies/*.json (canonical competency definitions)
 * Option A: competency files are source of truth; competencies-collection.json is a build artifact.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import process from "node:process";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_META = path.join(REPO_ROOT, "competencies.meta.json");
const DEFAULT_COMPETENCIES_DIR = path.join(REPO_ROOT, "competencies");
const DEFAULT_OUT = path.join(REPO_ROOT, "competencies-collection.json");

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
  if (!fs.existsSync(dirPath)) die(`ERROR: competencies directory does not exist: ${dirPath}`);
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
  if (results.length === 0) die(`ERROR: No competency JSON files found under: ${dirPath}`);
  return results;
}

function validateMeta(meta) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
    die("ERROR: competencies.meta.json must contain a JSON object");
  }
  const required = ["@context", "@id", "@type"];
  const missing = required.filter((k) => !(k in meta));
  if (missing.length) die(`ERROR: competencies.meta.json missing keys: ${missing.join(", ")}`);
  if (meta["@type"] !== "ceterms:Collection") die("ERROR: competencies.meta.json '@type' must be 'ceterms:Collection'");
}

function validateCompetency(competency, competencyPath, collectionId) {
  if (!competency || typeof competency !== "object" || Array.isArray(competency)) {
    die(`ERROR: ${competencyPath} must contain a JSON object (one competency)`);
  }
  
  // Check for '@id' field (CTDL format)
  if (!("@id" in competency)) {
    die(`ERROR: ${competencyPath} missing keys: @id`);
  }
  
  // Check for '@type' (CTDL format)
  const typeValue = competency["@type"];
  if (!typeValue) {
    die(`ERROR: ${competencyPath} missing keys: @type`);
  }

  if (typeValue !== "ceterms:Competency") {
    die(`ERROR: ${competencyPath} has @type=${JSON.stringify(typeValue)}; expected "ceterms:Competency"`);
  }
}

function normalizeCompetency(competency, { collectionId, collectionAuthor }) {
  // Shallow copy (do not mutate source)
  const c = { ...competency };

  // CTDL competencies are already complete - no normalization needed

  return c;
}

function parseArgs(argv) {
  const args = {
    meta: DEFAULT_META,
    competenciesDir: DEFAULT_COMPETENCIES_DIR,
    out: DEFAULT_OUT,
    sortBy: "id", // "id" | "name"
    mode: null, // "write" | "check"
  };

  for (let i = 2; i < argv.length; i++) {
    const tok = argv[i];
    if (tok === "--meta") args.meta = argv[++i];
    else if (tok === "--competencies-dir") args.competenciesDir = argv[++i];
    else if (tok === "--out") args.out = argv[++i];
    else if (tok === "--sort-by") args.sortBy = argv[++i];
    else if (tok === "--write") args.mode = "write";
    else if (tok === "--check") args.mode = "check";
    else if (tok === "--help" || tok === "-h") {
      console.log(`
Usage:
  node tools/compile-competencies.mjs --write
  node tools/compile-competencies.mjs --check

Options:
  --meta <path>              Path to competencies.meta.json (default: ${DEFAULT_META})
  --competencies-dir <dir>   Directory of competency JSON files (default: ${DEFAULT_COMPETENCIES_DIR})
  --out <path>               Output path for compiled competencies-collection.json (default: ${DEFAULT_OUT})
  --sort-by <key>            id | name (default: id)
  --write                    Write compiled competencies-collection.json
  --check                    Exit non-zero if competencies-collection.json is out of date
`);
      process.exit(0);
    } else {
      die(`ERROR: Unknown argument: ${tok}`);
    }
  }

  if (!args.mode) die("ERROR: Must specify exactly one of --write or --check");
  if (!["id", "name"].includes(args.sortBy)) die('ERROR: --sort-by must be "id" or "name"');

  return args;
}

function compile({ metaPath, competenciesDir, sortBy }) {
  const meta = readJson(metaPath);
  validateMeta(meta);

  const collectionId = meta["@id"];

  const competencyFiles = listJsonFiles(competenciesDir);

  const competencies = competencyFiles.map((fp) => {
    const data = readJson(fp);
    validateCompetency(data, fp, collectionId);
    return normalizeCompetency(data, { collectionId, collectionAuthor: null });
  });

  competencies.sort((a, b) => {
    // For CTDL format, extract name from language map
    const aKey = sortBy === "name" 
      ? String(a?.["ceterms:name"]?.["en-US"] ?? "").toLowerCase()
      : String(a?.["@id"] ?? "").toLowerCase();
    const bKey = sortBy === "name"
      ? String(b?.["ceterms:name"]?.["en-US"] ?? "").toLowerCase()
      : String(b?.["@id"] ?? "").toLowerCase();
    
    if (aKey !== bKey) return aKey.localeCompare(bKey);

    const aId = String(a?.["@id"] ?? "").toLowerCase();
    const bId = String(b?.["@id"] ?? "").toLowerCase();
    return aId.localeCompare(bId);
  });

  const compiled = { ...meta, competencies };
  const text = stableStringify(compiled);
  const hash = sha256(text);

  return { compiled, text, hash };
}

function main() {
  const args = parseArgs(process.argv);

  const metaPath = path.resolve(args.meta);
  const competenciesDir = path.resolve(args.competenciesDir);
  const outPath = path.resolve(args.out);

  const { text: newText } = compile({ metaPath, competenciesDir, sortBy: args.sortBy });
  const oldText = readTextOrEmpty(outPath);

  if (args.mode === "write") {
    writeText(outPath, newText);
    console.log(`WROTE: ${outPath}`);
    return;
  }

  // check
  if (oldText !== newText) {
    console.error("ERROR: competencies-collection.json is out of date.\n");
    console.error("Run:\n  node tools/compile-competencies.mjs --write\n");
    process.exit(1);
  }

  console.log("OK: competencies-collection.json is up to date.");
}

main();
