import styles from "@/styles/MountainBackground.module.css";

export default function MountainBackground() {
  return (
    <div className={styles.mountainContainer}>
      <svg
        viewBox="0 0 1200 300"
        className={styles.mountainSvg}
        preserveAspectRatio="none"
      >
        {/* Background gradient */}
        <defs>
          <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a7c59" />
            <stop offset="100%" stopColor="#2d5a3d" />
          </linearGradient>
          <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f0f8ff" />
          </linearGradient>
        </defs>
        
        {/* Mountain layers from back to front */}
        
        {/* Back mountains */}
        <path
          d="M0,200 L150,120 L300,140 L450,100 L600,130 L750,90 L900,110 L1050,80 L1200,100 L1200,300 L0,300 Z"
          fill="url(#mountainGradient)"
          opacity="0.6"
        />
        
        {/* Middle mountains */}
        <path
          d="M0,220 L200,150 L400,170 L600,130 L800,160 L1000,140 L1200,160 L1200,300 L0,300 Z"
          fill="url(#mountainGradient)"
          opacity="0.8"
        />
        
        {/* Front mountains */}
        <path
          d="M0,250 L250,180 L500,200 L750,160 L1000,190 L1200,200 L1200,300 L0,300 Z"
          fill="url(#mountainGradient)"
        />
        
        {/* Snow caps - back mountains */}
        <path
          d="M120,120 L150,100 L180,120 L150,120 Z"
          fill="url(#snowGradient)"
          opacity="0.7"
        />
        <path
          d="M420,100 L450,80 L480,100 L450,100 Z"
          fill="url(#snowGradient)"
          opacity="0.7"
        />
        <path
          d="M720,90 L750,70 L780,90 L750,90 Z"
          fill="url(#snowGradient)"
          opacity="0.7"
        />
        <path
          d="M1020,80 L1050,60 L1080,80 L1050,80 Z"
          fill="url(#snowGradient)"
          opacity="0.7"
        />
        
        {/* Snow caps - middle mountains */}
        <path
          d="M180,150 L200,130 L220,150 L200,150 Z"
          fill="url(#snowGradient)"
          opacity="0.8"
        />
        <path
          d="M580,130 L600,110 L620,130 L600,130 Z"
          fill="url(#snowGradient)"
          opacity="0.8"
        />
        <path
          d="M980,140 L1000,120 L1020,140 L1000,140 Z"
          fill="url(#snowGradient)"
          opacity="0.8"
        />
        
        {/* Snow caps - front mountains */}
        <path
          d="M230,180 L250,160 L270,180 L250,180 Z"
          fill="url(#snowGradient)"
        />
        <path
          d="M730,160 L750,140 L770,160 L750,160 Z"
          fill="url(#snowGradient)"
        />
        <path
          d="M980,190 L1000,170 L1020,190 L1000,190 Z"
          fill="url(#snowGradient)"
        />
      </svg>
    </div>
  );
}
