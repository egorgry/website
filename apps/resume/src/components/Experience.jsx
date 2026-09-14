export default function Experience({ items }) {
  return (
    <section className="block" id="experience">
      <div className="wrap">
        <div className="section-head">
          <h2>Experience</h2>
          <span className="section-count">{items.length} positions</span>
        </div>
        <div className="timeline">
          {items.map((job) => (
            <div className={`node${job.active ? " is-active" : ""}`} key={job.company + job.role}>
              <div className="node-marker" />
              <div className="node-log">
                session: {job.start}–{job.end} · status: {job.active ? "active" : "archived"}
              </div>
              <div className="node-header">
                <h3>{job.role}</h3>
              </div>
              <div className="node-header" style={{ marginBottom: 0 }}>
                <span className="node-company">{job.company}</span>
                {job.companyNote && <span className="node-note">— {job.companyNote}</span>}
              </div>
              <p className="node-summary">{job.summary}</p>
              <ul className="node-highlights">
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
              <div className="tool-row">
                {job.tools.map((t) => (
                  <span className="tool-chip" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
