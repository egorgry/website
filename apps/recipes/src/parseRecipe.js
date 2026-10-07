// Turns one recipe markdown file into structured data.
//
// Expected shape (see apps/recipes/README.md for the friendly version):
//
//   ---
//   title: Weeknight Chili
//   tags: dinner, beef
//   servings: 6
//   time: 45 min
//   source: https://example.com   (optional)
//   ---
//
//   Optional intro paragraph.
//
//   ## Ingredients
//   - 1 lb ground beef
//   ### For the sauce          (optional sub-headings group items)
//   - 1 can tomatoes
//
//   ## Steps
//   1. Brown the beef.
//
//   ## Notes                   (any other ## section is shown as-is)
//   Free text.

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const LIST_LINE = /^\s*(?:[-*+]|\d+[.)])\s+(.*)$/;

const STEP_NAMES = ['steps', 'instructions', 'directions', 'method'];

function parseFrontmatter(raw) {
  const m = raw.match(FRONTMATTER);
  if (!m) return { meta: {}, body: raw };

  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1) continue;
    const key = line.slice(0, i).trim().toLowerCase();
    const value = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    if (key) meta[key] = value;
  }
  return { meta, body: m[2] };
}

function parseTags(value) {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, '')
    .split(',')
    .map((t) => t.trim().replace(/^["']|["']$/g, '').toLowerCase())
    .filter(Boolean);
}

function splitSections(body) {
  const sections = [];
  let current = { name: null, lines: [] };

  for (const line of body.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.*)$/); // "### x" does not match: 3rd char is '#', not a space
    if (h) {
      sections.push(current);
      current = { name: h[1].trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  sections.push(current);

  return sections
    .map((s) => ({ name: s.name, text: s.lines.join('\n').trim() }))
    .filter((s) => s.name || s.text);
}

// A list section -> [{ heading, items }]. "### Heading" lines start a new
// group, and indented continuation lines are joined onto the previous item.
function parseGroups(text) {
  const groups = [{ heading: null, items: [] }];

  for (const line of text.split(/\r?\n/)) {
    const group = groups[groups.length - 1];
    const heading = line.match(/^###\s+(.*)$/);
    const item = line.match(LIST_LINE);

    if (heading) {
      groups.push({ heading: heading[1].trim(), items: [] });
    } else if (item) {
      group.items.push(item[1].trim());
    } else if (/^\s+\S/.test(line) && group.items.length) {
      group.items[group.items.length - 1] += ' ' + line.trim();
    }
  }
  return groups.filter((g) => g.items.length);
}

// Free-text sections (Notes, etc.) -> paragraphs and bullet lists.
export function parseBlocks(text) {
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split(/\r?\n/);
      if (lines.every((l) => LIST_LINE.test(l))) {
        return { type: 'list', items: lines.map((l) => l.match(LIST_LINE)[1].trim()) };
      }
      return { type: 'p', text: lines.map((l) => l.trim()).join(' ') };
    });
}

export function parseRecipe(slug, raw) {
  const { meta, body } = parseFrontmatter(raw);
  const sections = splitSections(body);

  let intro = '';
  let ingredients = [];
  let steps = [];
  const other = [];

  for (const s of sections) {
    const name = s.name?.toLowerCase();
    if (!name) intro = s.text;
    else if (name === 'ingredients') ingredients = parseGroups(s.text);
    else if (STEP_NAMES.includes(name)) steps = parseGroups(s.text);
    else other.push({ name: s.name, blocks: parseBlocks(s.text) });
  }

  const tags = parseTags(meta.tags);
  const title = meta.title || slug.replace(/[-_]+/g, ' ');

  return {
    slug,
    title,
    tags,
    servings: meta.servings || '',
    time: meta.time || '',
    source: meta.source || '',
    intro,
    ingredients,
    steps,
    other,
    // Everything the search box should be able to match.
    searchText: [title, tags.join(' '), intro, ...ingredients.flatMap((g) => g.items)]
      .join(' ')
      .toLowerCase()
  };
}
