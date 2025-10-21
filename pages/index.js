import Head from "next/head";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SendReceiveToggle from "@/components/SendReceiveToggle";
import MountainBackground from "@/components/MountainBackground";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import MiddleSenderComponent from "@/components/MiddleSenderComponent";
import MiddleReceiverComponent from "@/components/MiddleReceiverComponent";
import { useRouter } from "next/router";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Constants for circle dimensions (should match CSS)
const CIRCLE_RADIUS = 240; // pixels from center to sticker position (desktop)
const CIRCLE_RADIUS_MOBILE = 180; // pixels from center to sticker position (mobile)
const STICKER_SIZE = 80; // fixed size for sticker containers (width and height)
const STICKER_SIZE_MOBILE = 60; // fixed size for sticker containers (mobile)
const ARC_START = 180; // degrees (left bottom)
const ARC_END = 360; // degrees (right bottom)
const PADDING_DEGREES = 2; // degrees of padding between stickers

export default function Home() {
  const router = useRouter();
  const [selectedPage, setSelectedPage] = useState("Send");
  const [stickerAngles, setStickerAngles] = useState([]);
  const [mode, setMode] = useState("send");
  const [prefilledUsername, setPrefilledUsername] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState("");
  const [hoveredSticker, setHoveredSticker] = useState(null);

  // Check for handle query parameter on mount
  useEffect(() => {
    if (router.isReady && router.query.handle) {
      const handle = router.query.handle;
      setPrefilledUsername(handle);
      setSelectedPage("Send");
      setMode("send");
    }
  }, [router.isReady, router.query.handle]);

  const handlePageChange = (page) => {
    if (page === selectedPage) return; // Prevent unnecessary transitions
    
    setIsTransitioning(true);
    
    // Start fade out
    setTimeout(() => {
      setSelectedPage(page);
      setMode(page.toLowerCase());
      
      // Start fade in after a longer delay for cleaner effect
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 200); // Longer fade out time
  };

  const stickerSources = Array.from({ length: 15 }, (_, i) => `/${i + 1}.png`);

  // Calculate evenly distributed positions based on fixed sticker size
  useEffect(() => {
    const calculatePositions = () => {
      const numStickers = stickerSources.length;
      const isMobile = window.innerWidth <= 600;
      const radius = isMobile ? CIRCLE_RADIUS_MOBILE : CIRCLE_RADIUS;
      const stickerSize = isMobile ? STICKER_SIZE_MOBILE : STICKER_SIZE;
      
      // Calculate angular width for each sticker (all same size now)
      // Formula: angular_width = 2 * arctan(sticker_width / (2 * radius))
      const radians = 2 * Math.atan(stickerSize / (2 * radius));
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
          <SpinController isPaused={hoveredSticker !== null} />
          {/* Bottom half of a rotating circle aligned to the top */}
          <div className={styles.halfCircleContainer}>
            <div 
              className={styles.halfCircleSpinner} 
              ref={spinnerRef}
            >
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
                      <div 
                        className={`${styles.stickerContainer} ${hoveredSticker === idx ? styles.pulseBorder : ''}`}
                        onClick={() => setSelectedSticker(src)}
                        onMouseEnter={() => setHoveredSticker(idx)}
                        onMouseLeave={() => setHoveredSticker(null)}
                        style={{ 
                          cursor: "pointer",
                          borderRadius: "8px"
                        }}
                      >
                        <Image
                          src={src}
                          alt={`Sticker ${idx + 1}`}
                          fill
                          sizes="180px"
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
          <div style={{ zIndex: 15, position: "relative" }}>
            <SendReceiveToggle onPageChange={handlePageChange} />
          </div>

          <div 
            style={{ 
              opacity: isTransitioning ? 0 : 1,
              transition: 'opacity 200ms ease-in-out'
            }}
          >
            {mode === "send" ? (
              <MiddleSenderComponent 
                mode={mode} 
                setMode={setMode} 
                prefilledUsername={prefilledUsername}
                selectedSticker={selectedSticker}
                setSelectedSticker={setSelectedSticker}
              />
            ) : (
              <MiddleReceiverComponent />
            )}
          </div>
        </main>
        
        {/* Mountain background */}
        <MountainBackground />
      </div>
    </>
  );
}

const spinnerRef = { current: null };

export function useSpin(speedDegPerSec = 18, isPaused = false) {
  const frameRef = useRef();
  const startRef = useRef();
  useEffect(() => {
    const el = spinnerRef.current;
    if (!el) return;
    
    const step = (ts) => {
      if (isPaused) {
        frameRef.current = requestAnimationFrame(step);
        return;
      }
      
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      const deg = (elapsed * speedDegPerSec) % 360;
      el.style.setProperty("--rotation", `${deg}deg`);
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [speedDegPerSec, isPaused]);
}

function SpinController({ isPaused }) {
  useSpin(18, isPaused); // smooth ferris-wheel speed
  return null;
}
