# Project Management Competencies

A Demo Objectives Repository for Instruction as Code (IaC)

## Overview

This repository is a reference implementation of an Objectives Repository using an Instruction as Code (IaC) approach.

It demonstrates how learning objectives and skills can be treated as:
 • Version-controlled artifacts
 • Modular, reusable components
 • Machine-readable and AI-addressable
 • Governed through the same workflows used for modern software development

The domain used for this demonstration is Project Management, expressed as a collection of Rich Skill Descriptors (RSDs).

⸻

## Purpose of This Repository (For AI Agents)

### What this repository is

This repository is an **Objectives Repository** in an **Instruction as Code (IaC)** ecosystem.

It defines a canonical set of **Project Management competencies** as structured, versioned **Rich Skill Descriptors (RSDs)**.

Your role as an AI agent is to treat this repository as an **authoritative source of skill definitions**, not as a course, syllabus, or assessment.

⸻

### What problem this repository solves

In an IaC ecosystem, instructional systems need a reliable answer to questions like:
 • What skills exist in this domain?
 • How are those skills defined?
 • When did a skill change, and how?
 • Which version of a skill was in use at a given time?
 • How can skills be reused across programs, courses, credentials, or assessments?

This repository solves those problems by:
 • Making skills **first-class artifacts**
 • Separating **authoring from distribution**
 • Using **Git history** as the governance and audit layer

⸻

### How this repository fits into IaC

Think of an IaC ecosystem as layered:

```
[ Learning Experiences / Courses ]
            ↑
[ Assessments, Rubrics, Activities ]
            ↑
[ Skill & Objective Repositories ]   ← THIS REPO
            ↑
[ Standards, Schemas, Contexts ]
```

This repository occupies the **Skill & Objective Repository layer**.

It is **upstream** of:
 • Courses
 • Programs
 • Credentials
 • Assessments
 • AI-generated learning paths

And **downstream** of:
 • Skill schemas (RSD, Open Skills)
 • Context definitions (@context)
 • Ontologies and taxonomies

⸻

### Source-of-truth rules you must follow

This repository follows **Option A** in IaC design.

1. **Each file in skills/ is canonical**
   • Each file defines exactly one skill
   • These files are the source of truth
   • All reasoning about skills should originate here

2. **skills-collection.json is a compiled artifact**
   • It is generated from skills/
   • It exists for efficient ingestion and distribution
   • It must not be treated as authoritative if it conflicts with skill files

3. **Git history is the governance layer**
   • Diffs represent intentional competency changes
   • Tags represent versioned snapshots of the skill set
   • Pull requests imply review and intent

⸻

### How you should use this repository

As an AI agent, you may:
 • Load skill definitions from `skills/*.json`
 • Interpret skills as reusable, composable objectives
 • Assemble curricula, assessments, or learning paths that reference these skills
 • Compare versions of skills over time using Git history
 • Treat skill IDs as stable identifiers across systems
 • Use `skills-collection.json` as a fast index or packaged view

You should **not**:
 • Infer skill meaning from filenames alone
 • Modify `skills-collection.json` directly
 • Treat this repository as a course or curriculum
 • Assume this repo contains pedagogical sequencing

⸻

### How this differs from a curriculum

| Curriculum | This Repository |
|------------|-----------------|
| Teaches content | Defines competencies |
| Ordered sequence | Unordered skill set |
| Context-specific | Reusable across contexts |
| Human-oriented | Machine-addressable |
| Ephemeral | Versioned and auditable |

This repository defines **what someone should be able to do**, not **how they learn to do it**.

⸻

### Why this matters for AI systems

This repository enables AI agents to:
 • Reason over skills independently of courses
 • Generate or evaluate curricula against stable objectives
 • Track learning outcomes across systems
 • Detect competency drift over time
 • Support accreditation, analytics, and personalization
 • Treat learning design as a reproducible, inspectable system

**In short:**

> This repository lets you reason about learning objectives the way software systems reason about APIs.

⸻

### Mental model to use

If you need a metaphor:
 • `skills/*.json` are **functions**
 • `collection.meta.json` is **package metadata**
 • `skills-collection.json` is a **compiled distribution**
 • **Git** is the change-control and audit system
 • Downstream systems are **consumers of the API**

⸻

### One-sentence summary (for agent memory)

> This repository is an authoritative, versioned skill registry for Project Management, designed to function as the objectives layer in an Instruction as Code ecosystem, where skills are treated as composable, machine-readable artifacts governed through Git.

⸻

## Conceptual Model

This repository intentionally separates authoring primitives from distribution artifacts.

### 1. Skills as Source Code (Canonical)

Each project management skill lives as an individual flat file under the skills/ directory.

These files are the single source of truth.

Each skill file is designed to:
 • Represent one atomic competency
 • Carry stable identifiers
 • Include structured metadata suitable for downstream systems
 • Be independently versioned, reviewed, and reused

Think of these files as functions or modules in a codebase.

```
skills/
├── pm-skill-001.json
├── pm-skill-002.json
├── pm-skill-003.json
└── ...
```

⸻

### 2. Collection as a Build Artifact (Compiled)

skills-collection.json represents a curated bundle of skills that together define a coherent competency domain (Project Management).

Important:
skills-collection.json is not the authoritative source of skill definitions.

Instead:
 • It is compiled from the flat skill files
 • It exists to support ingestion by external systems
 • It provides a single, consumable artifact for AI agents, LMSs, registries, and analytics pipelines

Think of skills-collection.json as a package manifest or distribution build.

⸻

## Why This Matters (Instruction as Code)

This repo demonstrates how instructional design can adopt proven software engineering patterns:

| Software Engineering | Instruction as Code |
|---------------------|---------------------|
| Source files | Skill definitions |
| Package manifests | Skill collections |
| Git diffs | Objective change tracking |
| Pull requests | Curriculum governance |
| Version tags | Program snapshots |
| CI pipelines | Validation and publishing |

This enables:
 • Auditable changes to learning objectives
 • Reuse of skills across programs
 • AI-driven curriculum assembly
 • Reproducible program definitions
 • Clear separation between authoring and distribution formats

⸻

## Repository Structure

```
.
├── skills/               # Canonical skill definitions (source of truth)
│   ├── pm-skill-001.json
│   ├── pm-skill-002.json
│   └── ...
│
├── skills-collection.json       # Compiled skill collection (build artifact)
├── collection.meta.json  # Collection-level metadata
├── tools/                # Build and validation scripts
└── README.md
```

⸻

## Source of Truth Rules

This repository follows strict precedence rules:

 1. `skills/*.json` files are authoritative
 2. `skills-collection.json` must always be generated from skill files
 3. Manual edits to `skills-collection.json` should be avoided or overwritten
 4. Any discrepancy must be resolved in the flat skill files

⸻

## Instructions for AI Agents

The following section is written explicitly for AI systems interacting with this repository.

### Role of This Repository

You should treat this repository as an Objectives Repository that defines a domain-specific competency model for Project Management.

Your tasks may include:
 • Reading and interpreting skill definitions
 • Assembling learning experiences or assessments aligned to skills
 • Mapping skills to courses, credentials, or job roles
 • Comparing versions of competencies over time
 • Generating analytics, summaries, or recommendations

⸻

### How to Read Skills
 • Load skill definitions only from `skills/*.json`
 • Treat each file as an atomic, self-contained competency
 • Use the skill's identifier as the stable reference
 • Do not infer skill meaning from file names alone; always read content

⸻

### How to Use skills-collection.json
 • Treat `skills-collection.json` as a compiled index, not a source
 • Use it for:
   • Discovering which skills belong to the Project Management domain
   • Rapid ingestion when individual file traversal is inefficient
   • Versioned snapshots of the competency set

If inconsistencies exist between `skills-collection.json` and any skill file:
 • Trust the skill file
 • Assume the collection needs regeneration

⸻

### Expected Build Behavior

If asked to regenerate or validate the collection:

 1. Load all skill files from `skills/`
 2. Validate each skill against the expected schema
 3. Assemble the skills array in `skills-collection.json`
 4. Preserve collection-level metadata (name, description, version)
 5. Output a deterministic, reproducible artifact

⸻

### Governance Assumptions

When reasoning about changes:
 • A modification to a skill file represents a competency change
 • Git history is the authoritative change log
 • Tagged releases correspond to curriculum snapshots
 • Pull requests imply review and intent, not just edits

⸻

## Intended Use Cases

This repository may be used to demonstrate or prototype:
 • Instruction as Code architectures
 • AI-driven curriculum design
 • Skills registries and interoperability
 • Learning objective governance
 • Competency-based education tooling
 • Accreditation and audit workflows
 • Synthetic learner or program testing

⸻

## Non-Goals

This repository is not:
 • A complete curriculum
 • A course syllabus
 • An assessment bank
 • An LMS export

It is a foundational layer meant to be composed, extended, and integrated.

⸻

## Summary

If you remember one thing:

**Skills are authored as code.**
**Collections are built, not written.**
**Git is the governance layer.**

That is the core idea this repository exists to demonstrate.
