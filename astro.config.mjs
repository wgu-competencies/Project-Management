import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sync skills, competencies, and collections to public folder after build
function syncJsonFiles() {
  return {
    name: 'sync-json-files',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
        const skillsDir = path.join(repoRoot, 'skills');
        const competenciesDir = path.join(repoRoot, 'competencies');
        const skillsCollectionFile = path.join(repoRoot, 'skills-collection.json');
        const competenciesCollectionFile = path.join(repoRoot, 'competencies-collection.json');
        const outDir = fileURLToPath(dir);
        const outSkillsDir = path.join(outDir, 'skills');
        const outCompetenciesDir = path.join(outDir, 'competencies');
        
        console.log(`[sync] Output dir: ${outDir}`);
        console.log(`[sync] Skills dir: ${skillsDir}`);
        console.log(`[sync] Competencies dir: ${competenciesDir}`);
        
        // Create skills directory
        if (!fs.existsSync(outSkillsDir)) {
          fs.mkdirSync(outSkillsDir, { recursive: true });
          console.log(`[sync] Created ${outSkillsDir}`);
        }
        
        // Create competencies directory
        if (!fs.existsSync(outCompetenciesDir)) {
          fs.mkdirSync(outCompetenciesDir, { recursive: true });
          console.log(`[sync] Created ${outCompetenciesDir}`);
        }
        
        // Copy skill files
        const skillFiles = fs.readdirSync(skillsDir).filter(f => f.endsWith('.json'));
        for (const file of skillFiles) {
          fs.copyFileSync(
            path.join(skillsDir, file),
            path.join(outSkillsDir, file)
          );
        }
        
        // Copy competency files
        const competencyFiles = fs.readdirSync(competenciesDir).filter(f => f.endsWith('.json'));
        for (const file of competencyFiles) {
          fs.copyFileSync(
            path.join(competenciesDir, file),
            path.join(outCompetenciesDir, file)
          );
        }
        
        // Copy collections
        fs.copyFileSync(skillsCollectionFile, path.join(outDir, 'skills-collection.json'));
        if (fs.existsSync(competenciesCollectionFile)) {
          fs.copyFileSync(competenciesCollectionFile, path.join(outDir, 'competencies-collection.json'));
        }
        
        console.log(`✓ Synced ${skillFiles.length} skills + collection to ${outDir}`);
        console.log(`✓ Synced ${competencyFiles.length} competencies + collection to ${outDir}`);
      },
    },
  };
}

// Get categories for sidebar
function getCategories() {
  const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'skills-collection.json');
  const collectionData = JSON.parse(fs.readFileSync(collectionPath, 'utf-8'));
  
  const categoriesMap = new Map();
  collectionData.skills.forEach((skill) => {
    if (skill.categories) {
      skill.categories.forEach((category) => {
        categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
      });
    }
  });
  
  return Array.from(categoriesMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0])) // Sort alphabetically
    .map(([name, count]) => ({
      label: `${name} (${count})`,
      link: `/skills/categories/${name}`,
    }));
}

// Get categories for competencies sidebar
function getCompetencyCategories() {
  const collectionPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'competencies-collection.json');
  const collectionData = JSON.parse(fs.readFileSync(collectionPath, 'utf-8'));
  
  const categoriesMap = new Map();
  collectionData.competencies.forEach((competency) => {
    const categories = competency['ceterms:competencyCategory'];
    if (categories && Array.isArray(categories)) {
      categories.forEach((category) => {
        categoriesMap.set(category, (categoriesMap.get(category) || 0) + 1);
      });
    }
  });
  
  return Array.from(categoriesMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0])) // Sort alphabetically
    .map(([name, count]) => ({
      label: `${name} (${count})`,
      link: `/competencies/categories/${name}`,
    }));
}

export default defineConfig({
  site: 'https://wgu-competencies.github.io',
  base: '/Project-Management',
  outDir: './docs',
  integrations: [
    syncJsonFiles(),
    starlight({
      title: 'Project Management Skills',
      description: 'Canonical skill repository for Project Management competencies',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/wgu-competencies/Project-Management',
        },
      ],
      sidebar: [
        {
          label: 'Overview',
          items: [
            { label: 'Introduction', link: '/' },
            { label: 'For AI Agents', link: '/for-ai-agents' },
            { label: 'JSON API', link: '/json-api' },
          ],
        },
        {
          label: 'Skills',
          collapsed: true,
          items: [
            { label: 'Browse All Skills', link: '/skills' },
          ],
        },
        {
          label: 'Skill Categories',
          collapsed: true,
          items: getCategories(),
        },
        {
          label: 'Competencies',
          collapsed: true,
          items: [
            { label: 'Browse All Competencies', link: '/competencies' },
          ],
        },
        {
          label: 'Competency Categories',
          collapsed: true,
          items: getCompetencyCategories(),
        },
      ],
      customCss: [
        './src/styles/custom.css',
      ],
    }),
  ],
});
