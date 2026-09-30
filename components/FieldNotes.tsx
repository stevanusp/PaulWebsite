import { notes } from "@/content/site";
import Section, { sectionStyles as s } from "./Section";
import Branches from "./scenes/Branches";
import Lanes from "./scenes/Lanes";
import Triage from "./scenes/Triage";
import styles from "./FieldNotes.module.css";

const sc = notes.scenes;

function Scene({ kind }: { kind: (typeof notes.items)[number]["scene"] }) {
  if (kind === "branches") return <Branches label={sc.branchesLabel} total={sc.branchesTotal} />;
  if (kind === "triage") return <Triage alarm={sc.triageAlarm} calm={sc.triageCalm} />;
  return <Lanes lanes={sc.lanes} />;
}

export default function FieldNotes() {
  return (
    <Section id="notes" title={notes.title} intro={notes.intro}>
      <ul className={s.rows}>
        {notes.items.map((item) => (
          <li key={item.title} className={`${s.row} ${s.split}`}>
            <h3 className={s.rowTitle}>{item.title}</h3>
            <div className={styles.text}>
              <p className={s.rowText}>{item.body}</p>
              <Scene kind={item.scene} />
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
