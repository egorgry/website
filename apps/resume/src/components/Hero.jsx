import { MailIcon, PhoneIcon, PinIcon, LinkedInIcon, TwitterIcon } from "./Icons";

export default function Hero({ profile }) {
  return (
    <header className="hero wrap">
      <div className="status-chip">
        <span className="status-dot" />
        session: active
      </div>
      <h1>{profile.name}</h1>
      <p className="role">{profile.title}</p>
      <p className="tagline">{profile.tagline}</p>
      <p className="summary">{profile.summary}</p>
      <div className="contact-row">
        <a className="contact-link" href={`mailto:${profile.email}`}>
          <MailIcon />
          {profile.email}
        </a>
        <a className="contact-link" href={`tel:${profile.phone.replace(/\./g, "")}`}>
          <PhoneIcon />
          {profile.phone}
        </a>
        <span className="contact-link" style={{ cursor: "default" }}>
          <PinIcon />
          {profile.location}
        </span>
        <a
          className="contact-link icon-only"
          href={profile.linkedin}
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn"
        >
          <LinkedInIcon />
        </a>
        <a
          className="contact-link icon-only"
          href={profile.twitter}
          target="_blank"
          rel="noreferrer"
          aria-label="Twitter / X"
        >
          <TwitterIcon />
        </a>
      </div>
    </header>
  );
}
