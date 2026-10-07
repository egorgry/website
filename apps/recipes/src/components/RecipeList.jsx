import { useMemo, useState } from 'react';

export default function RecipeList({ recipes, notFound }) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const tags = useMemo(() => [...new Set(recipes.flatMap((r) => r.tags))].sort(), [recipes]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter(
      (r) => (!activeTag || r.tags.includes(activeTag)) && (!q || r.searchText.includes(q))
    );
  }, [recipes, query, activeTag]);

  return (
    <>
      <header className="page-header">
        <a className="back-link" href="/">← Home</a>
        <div className="header-row">
          <h1>Recipes</h1>
          <span className="count">
            <b>{recipes.length}</b> {recipes.length === 1 ? 'recipe' : 'recipes'}
          </span>
        </div>
      </header>

      {notFound && <div className="banner">Couldn't find a recipe called “{notFound}”.</div>}

      {recipes.length === 0 ? (
        <div className="state">
          No recipes yet. Add a <code>.md</code> file to <code>apps/recipes/recipes/</code> and push.
        </div>
      ) : (
        <>
          <div className="controls">
            <input
              className="search-input"
              type="search"
              placeholder="Search recipes or ingredients…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {tags.length > 0 && (
              <div className="chips">
                <button
                  className={`chip ${activeTag === null ? 'active' : ''}`}
                  onClick={() => setActiveTag(null)}
                >
                  All
                </button>
                {tags.map((t) => (
                  <button
                    key={t}
                    className={`chip ${activeTag === t ? 'active' : ''}`}
                    onClick={() => setActiveTag(activeTag === t ? null : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {visible.length === 0 ? (
            <div className="state">Nothing matches that.</div>
          ) : (
            <div className="grid">
              {visible.map((r) => (
                <a key={r.slug} className="card" href={`#/${encodeURIComponent(r.slug)}`}>
                  <h2>{r.title}</h2>
                  <div className="card-meta">
                    {[r.time, r.servings && `serves ${r.servings}`].filter(Boolean).join(' · ')}
                  </div>
                  {r.tags.length > 0 && (
                    <div className="card-tags">
                      {r.tags.map((t) => (
                        <span key={t} className="tag">{t}</span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
