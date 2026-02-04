import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SkylightModel3DProps {
  groesse: 80 | 100 | 110 | 180;
  material: 'acryl' | 'heatstop' | 'polycarbonat';
  optik: 'klar' | 'opal';
  shells: 1 | 2 | 3 | 4 | 5;
  kranzHeight: 15 | 30 | 50;
  luefterrahmen: 'festverglast' | '230v' | '24v';
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

// Mounting curb (Aufsatzkranz) - white PVC frame
function MountingCurb({ 
  size, 
  height 
}: { 
  size: number; 
  height: number;
}) {
  const frameThickness = 0.03;
  const curb = useMemo(() => {
    // Create a box frame around the perimeter
    const outerSize = size;
    const innerSize = size - frameThickness * 2;
    
    return { outerSize, innerSize, frameThickness };
  }, [size]);

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

// Ventilation frame (Lüfterrahmen) - metallic frame
function VentilationFrame({ 
  size, 
  type 
}: { 
  size: number; 
  type: '230v' | '24v';
}) {
  const frameHeight = 0.04;
  const frameThickness = 0.025;
  
  // Different colors for different types
  const color = type === '24v' ? '#2a3f5f' : '#4a5568';

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

export function SkylightModel3D({
  groesse,
  material,
  optik,
  shells,
  kranzHeight,
  luefterrahmen,
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

  return (
    <group ref={groupRef}>
      {/* Mounting Curb (Aufsatzkranz) */}
      <MountingCurb size={normalizedSize} height={normalizedKranzHeight} />
      
      {/* Ventilation Frame (if not fixed glazing) */}
      {luefterrahmen !== 'festverglast' && (
        <VentilationFrame size={normalizedSize} type={luefterrahmen} />
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
      
      {/* Base ring at dome-curb junction */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[normalizedSize * 0.48, normalizedSize * 0.5, 64]} />
        <meshStandardMaterial color="#888888" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}
