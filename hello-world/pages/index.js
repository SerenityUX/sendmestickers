import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SendReceiveToggle from "@/components/SendReceiveToggle";
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

// Constants for circle dimensions (should match CSS)
const CIRCLE_RADIUS = 230; // pixels from center to sticker position
const STICKER_SIZE = 80; // fixed size for sticker containers (width and height)
const ARC_START = 180; // degrees (left bottom)
const ARC_END = 360; // degrees (right bottom)
const PADDING_DEGREES = 2; // degrees of padding between stickers

export default function Home() {
  const [selectedPage, setSelectedPage] = useState("Send");
  const [stickerAngles, setStickerAngles] = useState([]);

  const handlePageChange = (page) => {
    setSelectedPage(page);
  };

  const stickerSources = Array.from({ length: 15 }, (_, i) => `/${i + 1}.png`);

  // Calculate evenly distributed positions based on fixed sticker size
  useEffect(() => {
    const calculatePositions = () => {
      const numStickers = stickerSources.length;
      
      // Calculate angular width for each sticker (all same size now)
      // Formula: angular_width = 2 * arctan(sticker_width / (2 * radius))
      const radians = 2 * Math.atan(STICKER_SIZE / (2 * CIRCLE_RADIUS));
      const angularWidth = (radians * 180) / Math.PI; // convert to degrees

      // Calculate total angular space needed (including padding)
      const totalAngularSpace = angularWidth * numStickers;
      const totalPadding = PADDING_DEGREES * (numStickers - 1);
      const totalNeeded = totalAngularSpace + totalPadding;

      // Available arc space
      const availableArc = ARC_END - ARC_START;

      // Calculate positions
      let currentAngle = ARC_START;
      const angles = [];
      
      if (totalNeeded < availableArc) {
        // If we have extra space, distribute it evenly
        const extraSpace = availableArc - totalNeeded;
        const extraPerGap = extraSpace / (numStickers - 1);
        
        for (let i = 0; i < numStickers; i++) {
          const angle = currentAngle + angularWidth / 2; // center of sticker
          angles.push(angle);
          currentAngle += angularWidth + PADDING_DEGREES + (i < numStickers - 1 ? extraPerGap : 0);
        }
      } else {
        // If tight fit, just use angular widths with minimal padding
        for (let i = 0; i < numStickers; i++) {
          const angle = currentAngle + angularWidth / 2; // center of sticker
          angles.push(angle);
          currentAngle += angularWidth + PADDING_DEGREES;
        }
      }
      
      setStickerAngles(angles);
    };

    calculatePositions();
    
    // Recalculate on window resize
    window.addEventListener("resize", calculatePositions);
    
    return () => {
      window.removeEventListener("resize", calculatePositions);
    };
  }, [stickerSources.length]);

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
          <SpinController />
          {/* Bottom half of a rotating circle aligned to the top */}
          <div className={styles.halfCircleContainer}>
            <div className={styles.halfCircleSpinner} ref={spinnerRef}>
              {stickerSources.map((src, idx) => {
                // Use calculated angle or fallback to even distribution
                const angle = stickerAngles[idx] ?? (ARC_START + ((ARC_END - ARC_START) / (stickerSources.length - 1)) * idx);
                
                return (
                  <div
                    key={idx}
                    className={styles.halfCircleItem}
                    style={{ "--angle": `${angle}deg` }}
                  >
                    <div className={styles.halfCircleItemInner}>
                      <div className={styles.stickerContainer}>
                        <Image
                          src={src}
                          alt={`Sticker ${idx + 1}`}
                          fill
                          sizes="80px"
                          style={{ objectFit: "contain" }}
                          priority={idx < 5} // prioritize first few images
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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
