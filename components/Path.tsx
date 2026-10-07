import { path } from "@/content/site";
import Section from "./Section";
import styles from "./Path.module.css";

export default function Path() {
  return (
    <Section id="path" title={path.title}>
      <ol className={`tile ${styles.list}`}>
        {path.items.map((item, i) => (
          <li key={`${item.when}-${item.role}`} className={styles.item}>
            <p className={`fine ${styles.when}`}>
              {item.when}
              {i === 0 ? <span className={styles.now}>{path.now}</span> : null}
            </p>
            <div className={styles.what}>
              <h3 className={styles.role}>
                {item.role}
                <span className="visually-hidden">, </span>
                <span className={styles.org}>{item.org}</span>
              </h3>
              {item.note ? <p className={styles.note}>{item.note}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
