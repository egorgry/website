import { MailIcon, PhoneIcon } from "./Icons";

export default function Footer({ profile }) {
  return (
    <footer className="footer-block wrap" id="contact">
      <h2>Let's talk</h2>
      <p>Open to conversations about identity, access, and platform engineering roles.</p>
      <div className="footer-links">
        <a className="contact-link primary" href={`mailto:${profile.email}`}>
          <MailIcon />
          Email me
        </a>
        <a className="contact-link" href={`tel:${profile.phone.replace(/\./g, "")}`}>
          <PhoneIcon />
          {profile.phone}
        </a>
      </div>
      <p className="foot-note">
        © {new Date().getFullYear()} {profile.name}
      </p>
    </footer>
  );
}
