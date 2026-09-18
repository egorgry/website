function RecordCard({ record }) {
  return (
    <div className="card">
      <img className="card-cover" src={record.coverImage} alt={`${record.title} cover art`} loading="lazy" />
      <div className="card-title">{record.title}</div>
      <div className="card-artist">
        {record.artist}
        {record.year ? ` · ${record.year}` : ''}
      </div>
    </div>
  );
}

export default function RecordGrid({ records }) {
  if (!records.length) {
    return <div className="state">No records match that search.</div>;
  }
  return (
    <div className="grid">
      {records.map((r) => (
        <RecordCard key={r.id} record={r} />
      ))}
    </div>
  );
}
