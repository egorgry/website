export default function Extras({ extras }) {
  return (
    <section className="block" id="extras">
      <div className="wrap">
        <div className="eyebrow">// {extras.heading}</div>
        <p className="extras-body">{extras.body}</p>
      </div>
    </section>
  );
}
