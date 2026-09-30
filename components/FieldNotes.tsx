import { notes } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";

export default function FieldNotes() {
  return (
    <Section id="notes" title={notes.title} intro={notes.intro}>
      <ul className={s.rows}>
        {notes.items.map((item) => (
          <li key={item.title} className={`${s.row} ${s.split}`}>
            <h3 className={s.rowTitle}>{item.title}</h3>
            <p className={s.rowText}>{item.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
