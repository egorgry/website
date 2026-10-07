import { useEffect, useState } from 'react';

// Tiny inline formatter: **bold** only. Everything else is plain text.
function Inline({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.length > 4 && part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  );
}

function safeUrl(url) {
  return /^https?:\/\//i.test(url) ? url : null;
}

export default function RecipeDetail({ recipe }) {
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    const previous = document.title;
    document.title = `${recipe.title} — Recipes`;
    return () => {
      document.title = previous;
    };
  }, [recipe.title]);

  const toggle = (key) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const source = safeUrl(recipe.source);
  const meta = [recipe.time, recipe.servings && `serves ${recipe.servings}`].filter(Boolean);

  return (
    <article>
      <header className="page-header">
        <a className="back-link" href="#/">← All recipes</a>
        <h1>{recipe.title}</h1>
        {meta.length > 0 && <div className="detail-meta">{meta.join(' · ')}</div>}
        {recipe.tags.length > 0 && (
          <div className="card-tags">
            {recipe.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>
        )}
        {recipe.intro && <p className="intro"><Inline text={recipe.intro} /></p>}
        <div className="detail-actions">
          {source && (
            <a href={source} target="_blank" rel="noreferrer noopener">Original source ↗</a>
          )}
          <button className="link-button" onClick={() => window.print()}>Print</button>
        </div>
      </header>

      <div className="detail-body">
        {recipe.ingredients.length > 0 && (
          <section className="ingredients">
            <h2>Ingredients</h2>
            {recipe.ingredients.map((group, gi) => (
              <div key={gi}>
                {group.heading && <h3>{group.heading}</h3>}
                <ul className="checklist">
                  {group.items.map((item, ii) => {
                    const key = `${gi}-${ii}`;
                    return (
                      <li key={key}>
                        <label className={checked.has(key) ? 'done' : ''}>
                          <input
                            type="checkbox"
                            checked={checked.has(key)}
                            onChange={() => toggle(key)}
                          />
                          <span><Inline text={item} /></span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        )}

        {recipe.steps.length > 0 && (
          <section className="steps">
            <h2>Steps</h2>
            {recipe.steps.map((group, gi) => (
              <div key={gi}>
                {group.heading && <h3>{group.heading}</h3>}
                <ol>
                  {group.items.map((item, ii) => (
                    <li key={ii}><Inline text={item} /></li>
                  ))}
                </ol>
              </div>
            ))}
          </section>
        )}
      </div>

      {recipe.other.map((section) => (
        <section key={section.name} className="extra">
          <h2>{section.name}</h2>
          {section.blocks.map((block, i) =>
            block.type === 'list' ? (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}><Inline text={item} /></li>
                ))}
              </ul>
            ) : (
              <p key={i}><Inline text={block.text} /></p>
            )
          )}
        </section>
      ))}
    </article>
  );
}
