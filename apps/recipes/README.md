# Recipes

Personal recipe reference. Every recipe is one markdown file in
`recipes/` — add a file, commit, push, and it shows up. No backend, no
database, full version history for free via git.

## Adding a recipe

Copy this template into `recipes/your-recipe-name.md` (the filename
becomes the URL, so keep it lowercase with hyphens):

```markdown
---
title: Your Recipe Name
tags: dinner, quick
servings: 4
time: 30 min
source: https://example.com/original-recipe   (optional)
---

An optional one-line intro about the dish.

## Ingredients

- 1 cup flour
- 2 eggs

## Steps

1. Do the first thing.
2. Do the second thing.

## Notes

Anything else — storage tips, substitutions, whatever.
```

### Frontmatter fields

All optional except `title` (which falls back to the filename if omitted).

- `tags` — comma-separated, used for the filter chips on the list page.
- `servings`, `time` — shown as plain text under the title.
- `source` — if it's a real `http(s)` link, shows as "Original source ↗".

### Ingredients

Plain bullet list. To split into groups (e.g. "For the sauce"), add a
`###` sub-heading before that group's bullets:

```markdown
## Ingredients

- 1 lb ground beef

### For the sauce
- 1 can tomatoes
- 2 tbsp chili powder
```

### Steps

A numbered list under `## Steps` (also accepts `## Instructions`,
`## Directions`, or `## Method` — use whichever reads naturally). Same
`###` sub-heading trick works here too, for multi-part recipes.

### Other sections

Any other `##` heading (Notes, Variations, Storage, whatever you want)
is rendered as-is, supporting plain paragraphs and bullet lists.

### Formatting

Only `**bold**` is supported inline — kept deliberately simple. No links,
italics, or images inside ingredient/step text.

## Features

- Search across title, tags, and ingredients
- Tag filter chips
- Checkable ingredient list (state doesn't persist across reloads — it's
  just for tracking progress while you cook)
- A Print button, styled to hide the site chrome and print cleanly
- Direct links to any recipe via `#/recipe-filename`

## Local development

```bash
npm install
npm run dev
```

Runs on Vite's normal dev server with fast refresh. Recipes are loaded at
build time via `import.meta.glob`, so adding a new `.md` file while `npm
run dev` is running is picked up automatically — no restart needed.
