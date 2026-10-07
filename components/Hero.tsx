import { hero, site } from "@/content/site";
import styles from "./Hero.module.css";

export default function Hero() {
  const { photo } = hero;
  return (
    <section id="top" className={styles.hero} aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.text}>
          <p className={styles.name}>{site.name}</p>
          <h1 id="hero-title" className={styles.title}>
            <span className="visually-hidden">{hero.title}</span>
            <span className={styles.words} aria-hidden="true">
              {hero.words.map((word, i) => (
                <span key={word}>
                  <span className={styles.word}>
                    <span className={`sheen ${styles.wordInner}`}>{word}</span>
                  </span>
                  {i < hero.words.length - 1 ? " " : null}
                </span>
              ))}
            </span>
          </h1>
          <div className={styles.after}>
            <p className={styles.lead}>{hero.lead}</p>
            <p className={styles.status}>{hero.status}</p>
            <div className={styles.actions}>
              <a className="pill pill-solid" href={`mailto:${site.email}`}>
                {hero.primary}
              </a>
              <a className="pill pill-quiet" href={site.resume} download>
                {hero.secondary}
                <span className={styles.meta}>{hero.secondaryMeta}</span>
              </a>
            </div>
          </div>
        </div>

        <figure className={styles.photo}>
          {/* A plain img: next/image adds an inline style attribute, which the CSP build rejects. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} fetchPriority="high" />
        </figure>
      </div>
    </section>
  );
}
