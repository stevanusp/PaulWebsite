import Lit from "./Lit";
import styles from "./Section.module.css";

type Props = {
  id: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function Section({ id, title, intro, children, className }: Props) {
  return (
    <section id={id} className={`${styles.section} ${className ?? ""}`} aria-labelledby={`${id}-title`}>
      <div className="container">
        <div className={styles.head}>
          <h2 id={`${id}-title`} className={styles.title}>
            {title}
          </h2>
          {intro ? <Lit className={styles.intro} text={intro} /> : null}
        </div>
        {children ? <div className={styles.body}>{children}</div> : null}
      </div>
    </section>
  );
}

export { styles as sectionStyles };
