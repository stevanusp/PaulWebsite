import { Fragment } from "react";
import styles from "./Lit.module.css";

type Props = { text: string; className?: string };

// A paragraph that comes up line by line as it scrolls into the reading zone.
// Pure CSS (a view timeline per word), so it costs no script. Browsers without scroll-driven
// animations, reduced motion and print simply show the text at full strength.
export default function Lit({ text, className }: Props) {
  const words = text.split(" ");
  return (
    <p className={`${styles.lit} ${className ?? ""}`}>
      {words.map((word, i) => (
        <Fragment key={i}>
          <span className={styles.w}>{word}</span>
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </p>
  );
}
