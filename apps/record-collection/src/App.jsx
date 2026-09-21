import { useEffect, useMemo, useState } from 'react';
import { fetchCollection } from './api.js';
import Featured from './components/Featured.jsx';
import Controls from './components/Controls.jsx';
import RecordGrid from './components/RecordGrid.jsx';

export default function App() {
  const [releases, setReleases] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState(null);
  const [sort, setSort] = useState('added');

  useEffect(() => {
    fetchCollection()
      .then(({ releases, isDemo }) => {
        setReleases(releases);
        setIsDemo(isDemo);
      })
      .catch((err) => setError(String(err)));
  }, []);

  const genres = useMemo(() => {
    if (!releases) return [];
    const set = new Set();
    releases.forEach((r) => (r.genres || []).forEach((g) => set.add(g)));
    return [...set].sort();
  }, [releases]);

  const filtered = useMemo(() => {
    if (!releases) return [];
    let list = releases;

    if (activeGenre) {
      list = list.filter((r) => (r.genres || []).includes(activeGenre));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) => r.title.toLowerCase().includes(q) || r.artist.toLowerCase().includes(q)
      );
    }

    const sorted = [...list];
    if (sort === 'artist') {
      sorted.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (sort === 'year') {
      sorted.sort((a, b) => (b.year || 0) - (a.year || 0));
    }
    // 'added' keeps the API's original order (already sorted by date added)

    return sorted;
  }, [releases, activeGenre, query, sort]);

  if (error) {
    return <div className="wrap state error">Couldn't load the collection: {error}</div>;
  }

  if (!releases) {
    return <div className="wrap state">Loading…</div>;
  }

  const featured = releases[0];

  return (
    <div className="wrap">
      <header className="page-header">
        <a className="home-link" href="/">
          ← BACK TO HOME 🏠
        </a>
        <div className="header-row">
          <h1>Record Collection</h1>
          <div className="stat-line">
            <span>
              <b>{releases.length}</b> records
            </span>
            <span className="stat-dot" />
            <span>
              <b>{genres.length}</b> genres
            </span>
          </div>
        </div>
      </header>

      {isDemo && (
        <div className="banner">Showing sample records — connect /api/collection to see your own.</div>
      )}

      <Featured record={featured} />

      <Controls
        query={query}
        onQueryChange={setQuery}
        genres={genres}
        activeGenre={activeGenre}
        onGenreChange={setActiveGenre}
        sort={sort}
        onSortChange={setSort}
      />

      <RecordGrid records={filtered} />

      <footer className="page-footer">Built with the Discogs API on Cloudflare Workers.</footer>
    </div>
  );
}
