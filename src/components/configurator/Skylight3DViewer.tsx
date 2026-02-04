import { Suspense, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { SkylightModel3D, SkylightShape } from './SkylightModel3D';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Skylight3DViewerProps {
  groesse: 80 | 100 | 110 | 180;
  material: 'acryl' | 'heatstop' | 'polycarbonat';
  optik: 'klar' | 'opal';
  shells: 1 | 2 | 3 | 4 | 5;
  kranzHeight: 15 | 30 | 50;
  luefterrahmen: 'festverglast' | 'spindel' | '230v' | '24v';
  shape?: SkylightShape;
  showCurb?: boolean;
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">Lade 3D-Vorschau...</span>
      </div>
    </div>
  );
}

// Memoized 3D viewer to prevent unnecessary re-renders
export const Skylight3DViewer = memo(function Skylight3DViewer({
  groesse,
  material,
  optik,
  shells,
  kranzHeight,
  luefterrahmen,
  shape = 'square',
  showCurb = true,
}: Skylight3DViewerProps) {
  const isMobile = useIsMobile();
  
  // Adjust camera based on dome size and whether curb is shown
  const cameraDistance = groesse > 150 ? 2.5 : 2;
  const shadowY = showCurb ? -kranzHeight / 100 - 0.01 : -0.01;

  return (
    <div className="w-full h-[300px] md:h-[400px] bg-gradient-to-b from-muted/40 to-muted/10 rounded-xl border overflow-hidden relative">
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ 
            position: [cameraDistance, cameraDistance * 0.8, cameraDistance], 
            fov: 45,
            near: 0.1,
            far: 100
          }}
          dpr={isMobile ? 1 : [1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight 
            position={[5, 8, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight 
            position={[-5, 3, -5]} 
            intensity={0.4} 
          />
          
          {/* Environment for reflections */}
          <Environment preset="city" />
          
          {/* The skylight model */}
          <SkylightModel3D
            groesse={groesse}
            material={material}
            optik={optik}
            shells={shells}
            kranzHeight={kranzHeight}
            luefterrahmen={luefterrahmen}
            shape={shape}
            showCurb={showCurb}
          />
          
          {/* Ground shadow */}
          <ContactShadows
            position={[0, shadowY, 0]}
            opacity={0.4}
            scale={3}
            blur={2}
            far={2}
          />
          
          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={1}
            maxDistance={5}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
            autoRotate={false}
            makeDefault
          />
        </Canvas>
      </Suspense>
      
      {/* Interaction hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/80 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
        {isMobile ? 'Touch zum Drehen' : 'Ziehen zum Drehen • Scrollen zum Zoomen'}
      </div>
    </div>
  );
});
