import { work } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";

export default function Work() {
  return (
    <Section id="work" title={work.title} intro={work.intro}>
      <ul className={`${s.tiles} ${s.three}`}>
        {work.rows.map((row) => (
          <li key={row.title} className="tile">
            <div className={s.tileInner}>
              <h3 className={s.tileTitle}>{row.title}</h3>
              <p className={s.tileText}>{row.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
