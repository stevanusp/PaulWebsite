import { notes } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";

export default function FieldNotes() {
  return (
    <Section id="notes" title={notes.title} intro={notes.intro}>
      <ul className={`${s.tiles} ${s.two}`}>
        {notes.items.map((item) => (
          <li key={item.title} className="tile">
            <div className={s.tileInner}>
              <h3 className={s.tileTitle}>{item.title}</h3>
              <p className={s.tileText}>{item.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
