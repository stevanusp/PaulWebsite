import { ear } from "@/content/site";
import Section from "./Section";
import Instrument from "./Instrument";
import SongPlayer from "./SongPlayer";
import styles from "./ByEar.module.css";

export default function ByEar() {
  const { photo, song } = ear;
  return (
    <Section id="ear" title={ear.title} intro={ear.lead}>
      <div className={styles.feature}>
        <figure className={styles.photo}>
          {/* A plain img: next/image adds an inline style attribute, which the CSP build rejects. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} loading="lazy" decoding="async" />
        </figure>
        <div className={styles.copy}>
          <p className={styles.body}>{ear.body}</p>
          <SongPlayer
            title={song.title}
            note={song.note}
            src={song.src}
            seconds={song.seconds}
            play={song.play}
            pause={song.pause}
            seek={song.seek}
          />
        </div>
      </div>

      <div className={styles.try}>
        <h3 className={styles.tryLabel}>{ear.tryLabel}</h3>
        <Instrument />
      </div>
    </Section>
  );
}
