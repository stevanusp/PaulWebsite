import { path } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";
import styles from "./Path.module.css";

export default function Path() {
  return (
    <Section id="path" title={path.title}>
      <ol className={`${s.rows} ${styles.list}`}>
        {path.items.map((item) => (
          <li key={`${item.when}-${item.role}`} className={`${s.row} ${styles.item}`}>
            <p className={`mono ${styles.when}`}>{item.when}</p>
            <div className={styles.what}>
              <h3 className={styles.role}>
                {item.role}
                <span className="visually-hidden">, </span>
                <span className={styles.org}>{item.org}</span>
              </h3>
              {item.note ? <p className={styles.noteText}>{item.note}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
