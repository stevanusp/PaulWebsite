import { hero, site } from "@/content/site";
import HeroHead from "./HeroHead";
import HeroSignal from "./HeroSignal";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.inner}`}>
        <HeroHead title={hero.title} words={hero.words} live={hero.hud.live} flagged={hero.hud.flagged} />

        <div className={styles.meta}>
          <div className={styles.copy}>
            <p className={styles.lead}>{hero.lead}</p>
            <p className={styles.status}>{hero.status}</p>
          </div>
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

      <div className={styles.signal} data-signal="">
        <HeroSignal label={hero.signalLabel} description={hero.signalDescription} hint={hero.signalHint} />
      </div>
    </section>
  );
}
