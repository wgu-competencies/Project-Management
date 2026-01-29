import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sync skills and collection to public folder after build
function syncJsonFiles() {
  return {
    name: 'sync-json-files',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
        const skillsDir = path.join(repoRoot, 'skills');
        const collectionFile = path.join(repoRoot, 'collection.json');
        const outDir = fileURLToPath(dir);
        const outSkillsDir = path.join(outDir, 'skills');
        
        console.log(`[sync] Output dir: ${outDir}`);
        console.log(`[sync] Skills dir: ${skillsDir}`);
        
        // Create skills directory
        if (!fs.existsSync(outSkillsDir)) {
          fs.mkdirSync(outSkillsDir, { recursive: true });
          console.log(`[sync] Created ${outSkillsDir}`);
        }
        
        // Copy skill files
        const files = fs.readdirSync(skillsDir).filter(f => f.endsWith('.json'));
        for (const file of files) {
          fs.copyFileSync(
            path.join(skillsDir, file),
            path.join(outSkillsDir, file)
          );
        }
        
        // Copy collection
        fs.copyFileSync(collectionFile, path.join(outDir, 'collection.json'));
        
        console.log(`✓ Synced ${files.length} skills + collection to ${outDir}`);
      },
    },
  };
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
      ],
      customCss: [
        './src/styles/custom.css',
      ],
    }),
  ],
});
