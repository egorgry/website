import { useEffect, useState } from 'react';
import { recipes } from './recipes.js';
import RecipeList from './components/RecipeList.jsx';
import RecipeDetail from './components/RecipeDetail.jsx';

// Hash routing (#/some-recipe) so deep links work on a static host with no
// server-side fallback rules.
function readSlug() {
  if (typeof window === 'undefined') return null;
  const m = window.location.hash.match(/^#\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export default function App() {
  const [slug, setSlug] = useState(readSlug);

  useEffect(() => {
    const onHashChange = () => {
      setSlug(readSlug());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const recipe = slug ? recipes.find((r) => r.slug === slug) : null;

  return (
    <div className="wrap">
      {recipe ? (
        <RecipeDetail key={recipe.slug} recipe={recipe} />
      ) : (
        <RecipeList recipes={recipes} notFound={slug} />
      )}
    </div>
  );
}
