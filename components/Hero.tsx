import { hero, site } from "@/content/site";
import HeroSignal from "./HeroSignal";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <h1 id="hero-title" className={styles.title}>
          <span className="visually-hidden">{hero.title}</span>
          <span className={styles.words} aria-hidden="true">
            {hero.words.map((word, i) => (
              <span key={word}>
                <span className={styles.word}>
                  <span className={styles.wordInner}>{word}</span>
                </span>
                {i < hero.words.length - 1 ? " " : null}
              </span>
            ))}
          </span>
        </h1>

        <div className={styles.meta}>
          <p className={styles.lead}>{hero.lead}</p>
          <p className={styles.status}>{hero.status}</p>
          <div className={styles.actions}>
            <a className={`${styles.button} ${styles.primary}`} href={`mailto:${site.email}`}>
              {hero.primary}
            </a>
            <a className={`${styles.button} ${styles.secondary}`} href={site.resume} download>
              {hero.secondary}
              <span className={styles.buttonMeta}>{hero.secondaryMeta}</span>
            </a>
          </div>
        </div>
      </div>

      <div className={styles.signal}>
        <HeroSignal label={hero.signalLabel} description={hero.signalDescription} />
      </div>
    </section>
  );
}
