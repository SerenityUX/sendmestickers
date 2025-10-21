import { useState } from "react";
import styles from "@/styles/Home.module.css";

export default function SendReceiveToggle({ onPageChange }) {
  const [mode, setMode] = useState("send");
  return (
    <div className={styles.toggleWrapper} style={{ 
      marginTop: typeof window !== 'undefined' && window.innerWidth <= 600 ? '100px' : '140px' 
    }}>
      <div className={styles.toggle} role="tablist" aria-label="Send or Receive">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "send"}
          className={mode === "send" ? styles.active : undefined}
          onClick={() => {
            setMode("send");
            onPageChange?.("Send");
          }}
          style={{ color: mode === "send" ? "#fff" : "#6982a5", fontFamily: "'COOPBL', Helvetica, Arial, sans-serif" }}
        >
          Send
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "receive"}
          className={mode === "receive" ? styles.active : undefined}
          onClick={() => {
            setMode("receive");
            onPageChange?.("Receive");
          }}
          style={{ color: mode === "receive" ? "#fff" : "#6982a5", fontFamily: "'COOPBL', Helvetica, Arial, sans-serif" }}
        >
          Receive
        </button>
        <span
          className={styles.toggleThumb}
          style={{ transform: `translateX(${mode === "send" ? "0%" : "calc(100% + 6px)"})` }}
          aria-hidden
        />
      </div>
    </div>
  );
}


