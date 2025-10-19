import { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

function SpinningCircle() {
  const groupRef = useRef();
  const images = [
    '/1.png', '/2.png', '/3.png', '/4.png', '/5.png', '/6.png', '/7.png'
  ];

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.1; // Slow rotation
    }
  });

  return (
    <group ref={groupRef}>
      {/* Circle border */}
      <mesh>
        <ringGeometry args={[2.8, 3, 64]} />
        <meshBasicMaterial color="#666" transparent opacity={0.3} />
      </mesh>
      
      {/* Images positioned around the circle */}
      {images.map((src, index) => {
        const angle = (index / images.length) * Math.PI * 2;
        const x = Math.cos(angle) * 2.9;
        const y = Math.sin(angle) * 2.9;
        
        return (
          <group key={index} position={[x, y, 0]} rotation={[0, 0, -angle]}>
            <mesh>
              <planeGeometry args={[0.6, 0.6]} />
              <meshBasicMaterial 
                map={new THREE.TextureLoader().load(src)}
                transparent
                alphaTest={0.1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function PixelatedSpinningCircle() {
  return (
    <div style={{ width: '400px', height: '400px', margin: '0 auto' }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ 
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges'
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
        dpr={1} // Higher pixel ratio for less pixelation
      >
        <ambientLight intensity={0.8} />
        <SpinningCircle />
      </Canvas>
    </div>
  );
}
