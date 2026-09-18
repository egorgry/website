export default function Controls({
  query,
  onQueryChange,
  genres,
  activeGenre,
  onGenreChange,
  sort,
  onSortChange
}) {
  return (
    <div className="controls">
      <input
        className="search-input"
        type="text"
        placeholder="Search title or artist…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />

      <button
        className={`chip ${activeGenre === null ? 'active' : ''}`}
        onClick={() => onGenreChange(null)}
      >
        All
      </button>
      {genres.map((g) => (
        <button
          key={g}
          className={`chip ${activeGenre === g ? 'active' : ''}`}
          onClick={() => onGenreChange(g)}
        >
          {g}
        </button>
      ))}

      <select className="sort-select" value={sort} onChange={(e) => onSortChange(e.target.value)}>
        <option value="added">Recently added</option>
        <option value="artist">Artist A–Z</option>
        <option value="year">Year (newest)</option>
      </select>
    </div>
  );
}
