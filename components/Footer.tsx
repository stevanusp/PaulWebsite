import { footer } from "@/content/site";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>{footer.left}</p>
        <p className="mono">{footer.right}</p>
      </div>
    </footer>
  );
}
