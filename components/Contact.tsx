import { contact, site } from "@/content/site";
import CopyEmail from "./CopyEmail";
import styles from "./Contact.module.css";

function External() {
  return (
    <svg className={styles.ext} viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" focusable="false">
      <path d="M3.5 2.5h6v6M9.5 2.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Contact() {
  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-title">
      <div className="container">
        <h2 id="contact-title" className={styles.title} data-rail="">
          {contact.title}
        </h2>
        <p className={styles.line}>{contact.line}</p>
        <div className={styles.emailRow}>
          <a className={styles.email} href={`mailto:${site.email}`}>
            {site.email}
          </a>
          <CopyEmail email={site.email} copy={contact.copy} copied={contact.copied} />
        </div>
        <ul className={styles.links}>
          <li>
            <a
              className="link"
              href={site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              data-print-url={site.linkedin}
            >
              {contact.linkedin}
              <External />
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a className="link" href={site.resume} download>
              {contact.resume}
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
