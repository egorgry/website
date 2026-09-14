export default function Skills({ groups }) {
  return (
    <section className="block" id="skills">
      <div className="wrap">
        <div className="section-head">
          <h2>Competencies</h2>
          <span className="section-count">{groups.length} domains</span>
        </div>
        <div className="skill-groups">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="skill-group-label">{g.label}</p>
              <div className="skill-chip-row">
                {g.skills.map((s) => (
                  <span className="skill-chip" key={s}>
                    {s}
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
