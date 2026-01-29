#!/usr/bin/env node
/**
 * Update skill IDs from OSMT URLs to GitHub Pages URLs
 * 
 * FROM: https://osmt.wgu.edu/api/skills/{uuid}
 * TO:   https://wgu-competencies.github.io/Project-Management/skills/{uuid}
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = path.join(REPO_ROOT, "skills");

const OLD_BASE = "https://osmt.wgu.edu/api/skills/";
const NEW_BASE = "https://wgu-competencies.github.io/Project-Management/skills/";

function updateSkillFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const skill = JSON.parse(content);
  
  // Check if this skill uses the old base URL
  if (skill.id && skill.id.startsWith(OLD_BASE)) {
    const uuid = skill.id.replace(OLD_BASE, "");
    skill.id = NEW_BASE + uuid;
    
    // Write back with pretty formatting
    fs.writeFileSync(filePath, JSON.stringify(skill, null, 2) + "\n", "utf8");
    return true; // Updated
  }
  
  return false; // No update needed
}

function main() {
  const files = fs.readdirSync(SKILLS_DIR).filter(f => f.endsWith(".json"));
  
  let updatedCount = 0;
  let totalCount = 0;
  
  for (const file of files) {
    totalCount++;
    const filePath = path.join(SKILLS_DIR, file);
    
    try {
      if (updateSkillFile(filePath)) {
        updatedCount++;
        console.log(`✓ Updated: ${file}`);
      } else {
        console.log(`- Skipped: ${file} (already using new URL or no ID field)`);
      }
    } catch (err) {
      console.error(`✗ Error processing ${file}: ${err.message}`);
    }
  }
  
  console.log(`\nSummary:`);
  console.log(`  Total files: ${totalCount}`);
  console.log(`  Updated: ${updatedCount}`);
  console.log(`  Skipped: ${totalCount - updatedCount}`);
}

main();
