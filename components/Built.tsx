import { built } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";
import styles from "./Built.module.css";

export default function Built() {
  return (
    <Section id="built" title={built.title}>
      <ul className={s.rows}>
        {built.items.map((item) => (
          <li key={item.title} className={`${s.row} ${s.split}`}>
            <h3 className={s.rowTitle}>{item.title}</h3>
            <div className={styles.text}>
              <p className={s.rowText}>{item.body}</p>
              {item.stack ? <p className={`mono ${styles.stack}`}>{item.stack}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
