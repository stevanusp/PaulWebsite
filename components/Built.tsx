import { built } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";
import styles from "./Built.module.css";

export default function Built() {
  return (
    <Section id="built" title={built.title}>
      <ul className={s.rows}>
        {built.items.map((item) => (
          <li key={item.title} className={`${s.row} ${styles.item}`}>
            <h3 className={`${s.rowTitle} ${styles.name}`}>{item.title}</h3>
            <p className={`${s.rowText} ${styles.body}`}>{item.body}</p>
            {item.stack ? <p className={`mono ${styles.stack}`}>{item.stack}</p> : null}
          </li>
        ))}
      </ul>
    </Section>
  );
}
