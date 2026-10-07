import { ear } from "@/content/site";
import Section from "./Section";
import Instrument from "./Instrument";
import SongPlayer from "./SongPlayer";
import styles from "./ByEar.module.css";

export default function ByEar() {
  const { song } = ear;
  return (
    <Section id="ear" title={ear.title} intro={ear.lead}>
      <div className={styles.grid}>
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

      <div className={styles.try}>
        <Instrument />
      </div>
    </Section>
  );
}
