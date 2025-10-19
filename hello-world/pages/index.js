import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import MiddleSenderComponent from "@/components/MiddleSenderComponent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [mode, setMode] = useState("send");

  return (
    <>
      <Head>
        <title>sendmestickers</title>
        <meta name="description" content="Stickers ferris wheel" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${styles.page} ${geistSans.variable} ${geistMono.variable}`}
      >
        <main className={styles.mainMinimal}>
          {/* Bottom half of a rotating circle aligned to the top */}
          <div className={styles.halfCircleContainer}>
            <div className={styles.halfCircleSpinner}>
              {Array.from({ length: 11 }, (_, i) => `/` + (i + 1) + `.png`).map(
                (src, idx, arr) => {
                  const step = 180 / arr.length; // spread across bottom half only
                  const base = 180; // 180deg (left) through <360deg (right)
                  const angle = base + idx * step;
                  return (
                    <div
                      key={idx}
                      className={styles.halfCircleItem}
                      style={{ "--angle": `${angle}deg` }}
                    >
                      <div className={styles.halfCircleItemInner}>
                        <Image
                          src={src}
                          alt={`Sticker ${idx + 1}`}
                          width={0}
                          height={0}
                          sizes="64px"
                          style={{ width: "auto", height: "64px" }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Segmented toggle */}
          <Toggle mode={mode} setMode={setMode} />

          <MiddleSenderComponent mode={mode} setMode={setMode} />

        {/* middle part */}
        </main>
      </div>
    </>
  );
}

function Toggle({ mode, setMode }) {
  return (
    <div className={styles.toggleWrapper} style={{ marginTop: 60 }}>
      <div className={styles.toggle}>
        <button
          className={mode === "send" ? styles.active : undefined}
          onClick={() => setMode("send")}
          style={{ color: mode === "send" ? "#fff" : "#6982a5" }}
        >
          Send
        </button>
        <button
          className={mode === "receive" ? styles.active : undefined}
          onClick={() => setMode("receive")}
          style={{ color: mode === "receive" ? "#fff" : "#6982a5" }}
        >
          Receive
        </button>
      </div>
    </div>
  );
}
