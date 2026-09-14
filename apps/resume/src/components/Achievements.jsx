import { AwardIcon } from "./Icons";

export default function Achievements({ items }) {
  return (
    <section className="block" id="achievements">
      <div className="wrap">
        <div className="eyebrow">// recognition</div>
        <ul className="achievement-list">
          {items.map((item) => {
            const content = (
              <>
                <AwardIcon />
                <span>{item.text}</span>
              </>
            );
            return (
              <li key={item.text}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noreferrer">
                    {content}
                  </a>
                ) : (
                  <span className="achievement-static">{content}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
