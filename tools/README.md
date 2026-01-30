# Build Tools

This directory contains scripts for compiling individual JSON files into collection artifacts.

## Scripts

### compile-collection.mjs
Compiles `skills/*.json` files into `skills-collection.json`.

**Usage:**
```bash
# Write the collection file
node tools/compile-collection.mjs --write

# Check if collection is up to date
node tools/compile-collection.mjs --check
```

**Configuration:**
- Input metadata: `collection.meta.json`
- Input directory: `skills/`
- Output file: `skills-collection.json`

### compile-competencies.mjs
Compiles `competencies/*.json` files into `competencies-collection.json`.

**Usage:**
```bash
# Write the collection file
node tools/compile-competencies.mjs --write

# Check if collection is up to date
node tools/compile-competencies.mjs --check
```

**Configuration:**
- Input metadata: `competencies.meta.json`
- Input directory: `competencies/`
- Output file: `competencies-collection.json`

## NPM Scripts

Convenient npm scripts are available in `package.json`:

```bash
# Compile skills collection
npm run compile:write

# Compile competencies collection
npm run compile:competencies:write

# Compile both collections
npm run compile:all

# Build documentation site (includes compilation)
npm run docs:build
```

## How It Works

Both compilation scripts follow the same pattern:

1. Read metadata from `*.meta.json` (collection-level information)
2. Scan the respective directory for all `.json` files
3. Validate each file (must be RichSkillDescriptor format)
4. Normalize entries (add `isMemberOf` and default `author` if missing)
5. Sort entries by ID or name
6. Output as a single JSON collection file

## Source of Truth

The individual JSON files in `skills/` and `competencies/` are the canonical source of truth.

The collection files (`*-collection.json`) are **build artifacts** that should be regenerated whenever individual files change.

**Never edit the collection files directly** - always edit the individual source files and recompile.
