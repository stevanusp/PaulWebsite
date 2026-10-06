import { method } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";
import styles from "./Method.module.css";

export default function Method() {
  return (
    <Section id="method" title={method.title}>
      <ol className={`${s.tiles} ${s.three}`}>
        {method.steps.map((step, i) => (
          <li key={step.title} className="tile">
            <div className={s.tileInner}>
              <span className={styles.step} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={s.tileTitle}>{step.title}</h3>
              <p className={s.tileText}>{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
