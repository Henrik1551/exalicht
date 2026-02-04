import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type SkylightShape = 'round' | 'square';

interface SkylightModel3DProps {
  groesse: 80 | 100 | 110 | 180;
  material: 'acryl' | 'heatstop' | 'polycarbonat';
  optik: 'klar' | 'opal';
  shells: 1 | 2 | 3 | 4 | 5;
  kranzHeight: 15 | 30 | 50;
  luefterrahmen: 'festverglast' | 'spindel' | '230v' | '24v';
  shape?: SkylightShape;
  showCurb?: boolean;
}

// Material color and transparency mapping
const getMaterialProperties = (material: string, optik: string) => {
  const properties: Record<string, { color: string; opacity: number }> = {
    'acryl-klar': { color: '#a8d4e6', opacity: 0.15 },
    'acryl-opal': { color: '#f5f5f5', opacity: 0.45 },
    'heatstop-klar': { color: '#daa520', opacity: 0.2 },
    'heatstop-opal': { color: '#f0e68c', opacity: 0.5 },
    'polycarbonat-klar': { color: '#b8c4ce', opacity: 0.25 },
    'polycarbonat-opal': { color: '#e0e5e8', opacity: 0.55 },
  };
  return properties[`${material}-${optik}`] || properties['acryl-klar'];
};

// Dome shell component - creates a hemisphere
function DomeShell({ 
  radius, 
  color, 
  opacity, 
  shellIndex,
  totalShells 
}: { 
  radius: number; 
  color: string; 
  opacity: number;
  shellIndex: number;
  totalShells: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Calculate shell offset - outer shells are slightly larger
  const shellRadius = radius + (shellIndex * 0.015);
  
  // Inner shells are more transparent
  const shellOpacity = opacity * (0.5 + (shellIndex / totalShells) * 0.5);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[shellRadius, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={shellOpacity}
        side={THREE.DoubleSide}
        roughness={0.1}
        metalness={0}
        clearcoat={0.5}
        clearcoatRoughness={0.1}
        transmission={1 - shellOpacity}
        thickness={0.02}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

// Square Mounting curb (Aufsatzkranz) - white PVC frame
function SquareMountingCurb({ 
  size, 
  height 
}: { 
  size: number; 
  height: number;
}) {
  const frameThickness = 0.03;

  return (
    <group position={[0, -height / 2, 0]}>
      {/* Four walls of the curb */}
      {/* Front wall */}
      <mesh position={[0, 0, size / 2 - frameThickness / 2]}>
        <boxGeometry args={[size, height, frameThickness]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
      </mesh>
      {/* Back wall */}
      <mesh position={[0, 0, -size / 2 + frameThickness / 2]}>
        <boxGeometry args={[size, height, frameThickness]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-size / 2 + frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, size - frameThickness * 2]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
      </mesh>
      {/* Right wall */}
      <mesh position={[size / 2 - frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, size - frameThickness * 2]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} />
      </mesh>
    </group>
  );
}

// Round Mounting curb (Aufsatzkranz) - circular white PVC frame
function RoundMountingCurb({ 
  radius, 
  height 
}: { 
  radius: number; 
  height: number;
}) {
  const wallThickness = 0.03;

  return (
    <group position={[0, -height / 2, 0]}>
      {/* Outer cylinder */}
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 64, 1, true]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner cylinder (slightly smaller) */}
      <mesh>
        <cylinderGeometry args={[radius - wallThickness, radius - wallThickness, height, 64, 1, true]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.3} side={THREE.BackSide} />
      </mesh>
      {/* Top ring */}
      <mesh position={[0, height / 2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - wallThickness, radius, 64]} />
        <meshStandardMaterial color="#f5f5f5" roughness={0.3} />
      </mesh>
    </group>
  );
}

// Square Ventilation frame (Lüfterrahmen) - metallic frame
function SquareVentilationFrame({ 
  size, 
  type 
}: { 
  size: number; 
  type: 'spindel' | '230v' | '24v';
}) {
  const frameHeight = 0.04;
  const frameThickness = 0.025;
  
  // Different colors for different types
  const color = type === '24v' ? '#2a3f5f' : type === 'spindel' ? '#5a5a5a' : '#4a5568';

  return (
    <group position={[0, frameHeight / 2, 0]}>
      {/* Metal frame ring around the dome base */}
      {/* Front frame */}
      <mesh position={[0, 0, size / 2]}>
        <boxGeometry args={[size + frameThickness * 2, frameHeight, frameThickness]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Back frame */}
      <mesh position={[0, 0, -size / 2]}>
        <boxGeometry args={[size + frameThickness * 2, frameHeight, frameThickness]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Left frame */}
      <mesh position={[-size / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, frameHeight, size]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Right frame */}
      <mesh position={[size / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, frameHeight, size]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Hinge indicator for opening mechanism */}
      <mesh position={[0, frameHeight / 2 + 0.01, -size / 2 + 0.02]}>
        <cylinderGeometry args={[0.008, 0.008, size * 0.8, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

// Round Ventilation frame (Lüfterrahmen) - circular metallic frame
function RoundVentilationFrame({ 
  radius, 
  type 
}: { 
  radius: number; 
  type: 'spindel' | '230v' | '24v';
}) {
  const frameHeight = 0.04;
  const frameThickness = 0.025;
  
  const color = type === '24v' ? '#2a3f5f' : type === 'spindel' ? '#5a5a5a' : '#4a5568';

  return (
    <group position={[0, frameHeight / 2, 0]}>
      {/* Circular metal frame */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, frameThickness / 2, 8, 64]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Hinge indicator */}
      <mesh position={[0, frameHeight / 2 + 0.01, -radius + 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, radius * 1.6, 16]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

export function SkylightModel3D({
  groesse,
  material,
  optik,
  shells,
  kranzHeight,
  luefterrahmen,
  shape = 'square',
  showCurb = true,
}: SkylightModel3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Normalize size to a reasonable 3D scale (100cm -> 0.5 units)
  const normalizedSize = groesse / 200;
  const normalizedKranzHeight = kranzHeight / 100;
  
  // Get material properties
  const { color, opacity } = getMaterialProperties(material, optik);
  
  // Dome radius based on size
  const domeRadius = normalizedSize * 0.5;

  // Subtle auto-rotation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  const isRound = shape === 'round';

  return (
    <group ref={groupRef}>
      {/* Mounting Curb (Aufsatzkranz) - only if showCurb is true */}
      {showCurb && (
        isRound ? (
          <RoundMountingCurb radius={normalizedSize * 0.5} height={normalizedKranzHeight} />
        ) : (
          <SquareMountingCurb size={normalizedSize} height={normalizedKranzHeight} />
        )
      )}
      
      {/* Ventilation Frame (if not fixed glazing) */}
      {luefterrahmen !== 'festverglast' && (
        isRound ? (
          <RoundVentilationFrame radius={normalizedSize * 0.5} type={luefterrahmen as 'spindel' | '230v' | '24v'} />
        ) : (
          <SquareVentilationFrame size={normalizedSize} type={luefterrahmen as 'spindel' | '230v' | '24v'} />
        )
      )}
      
      {/* Dome Shells */}
      <group position={[0, luefterrahmen !== 'festverglast' ? 0.04 : 0, 0]}>
        {Array.from({ length: shells }, (_, i) => (
          <DomeShell
            key={i}
            radius={domeRadius}
            color={color}
            opacity={opacity}
            shellIndex={i}
            totalShells={shells}
          />
        ))}
      </group>
      
      {/* Base ring at dome junction */}
      {isRound ? (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[normalizedSize * 0.48, normalizedSize * 0.5, 64]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
        </mesh>
      ) : (
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[normalizedSize * 0.48, normalizedSize * 0.5, 64]} />
          <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}
