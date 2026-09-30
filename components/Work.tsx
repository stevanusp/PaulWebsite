import { work } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";

export default function Work() {
  return (
    <Section id="work" title={work.title} intro={work.intro}>
      <ul className={s.rows}>
        {work.rows.map((row) => (
          <li key={row.title} className={`${s.row} ${s.split}`}>
            <h3 className={s.rowTitle}>{row.title}</h3>
            <p className={s.rowText}>{row.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
