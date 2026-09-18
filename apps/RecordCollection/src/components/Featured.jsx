export default function Featured({ record }) {
  if (!record) return null;
  return (
    <section className="featured">
      <img className="featured-cover" src={record.coverImage} alt={`${record.title} cover art`} />
      <div>
        <div className="featured-badge">
          <span className="pulse" />
          Recently added
        </div>
        <h2>{record.title}</h2>
        <p className="artist">{record.artist}</p>
        <p className="meta">
          {[record.year, record.label].filter(Boolean).join(' · ')}
        </p>
      </div>
    </section>
  );
}
