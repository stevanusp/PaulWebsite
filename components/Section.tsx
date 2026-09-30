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
      <div className={`container ${styles.grid}`}>
        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
        <div className={styles.body}>
          {intro ? <p className={styles.intro}>{intro}</p> : null}
          {children}
        </div>
      </div>
    </section>
  );
}

export { styles as sectionStyles };
