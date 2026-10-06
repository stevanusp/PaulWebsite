import { hero, site } from "@/content/site";
import HeroHead from "./HeroHead";
import HeroSignal from "./HeroSignal";
import styles from "./Hero.module.css";

// Source order is head, line, then the rest. On phones that keeps the headline and the line
// it reacts to on the first screen; on wider screens CSS moves the line to the bottom edge.
export default function Hero() {
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.top}`}>
        <HeroHead title={hero.title} words={hero.words} live={hero.hud.live} flagged={hero.hud.flagged} />
      </div>

      <div className={styles.signal} data-signal="">
        <HeroSignal label={hero.signalLabel} description={hero.signalDescription} hint={hero.signalHint} />
      </div>

      <div className={`container ${styles.meta}`}>
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
    </section>
  );
}
