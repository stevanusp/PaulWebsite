import { notes } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";
import styles from "./FieldNotes.module.css";

export default function FieldNotes() {
  return (
    <Section id="notes" title={notes.title} intro={notes.intro}>
      <div className={s.rows}>
        {notes.items.map((item) => (
          <article key={item.title} className={`${s.row} ${styles.note}`}>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={s.rowText}>{item.body}</p>
            <p className={styles.outcome}>{item.outcome}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}
