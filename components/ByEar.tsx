import { ear } from "@/content/site";
import Section from "./Section";
import Instrument from "./Instrument";
import styles from "./ByEar.module.css";

export default function ByEar() {
  return (
    <Section id="ear" title={ear.title}>
      <p className={styles.lead}>{ear.lead}</p>
      <p className={styles.body}>{ear.body}</p>
      <Instrument />
    </Section>
  );
}
