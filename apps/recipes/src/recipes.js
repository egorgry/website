import { parseRecipe } from './parseRecipe.js';

// Vite bundles every markdown file in /recipes at build time — no fetching,
// no backend. Add a file, push, and it shows up.
const files = import.meta.glob('../recipes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});

export const recipes = Object.entries(files)
  .map(([filePath, raw]) => parseRecipe(filePath.split('/').pop().replace(/\.md$/, ''), raw))
  .sort((a, b) => a.title.localeCompare(b.title));
