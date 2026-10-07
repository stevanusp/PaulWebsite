import { built } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";
import styles from "./Built.module.css";

export default function Built() {
  return (
    <Section id="built" title={built.title}>
      <ul className={`${s.tiles} ${s.two}`}>
        {built.items.map((item) => (
          <li key={item.title} className="tile">
            <div className={s.tileInner}>
              <h3 className={s.tileTitle}>{item.title}</h3>
              <p className={s.tileText}>{item.body}</p>
              {item.stack ? <p className={`fine ${styles.stack}`}>{item.stack}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
