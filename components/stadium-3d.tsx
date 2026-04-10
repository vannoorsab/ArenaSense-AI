'use client';

import { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Html, Environment } from '@react-three/drei';
import * as THREE from 'three';
import type { CrowdData, VenueZone } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, TrendingDown, Minus, Navigation, ChevronRight, Zap } from 'lucide-react';

interface Stadium3DProps {
  zones: VenueZone[];
  crowdData: Map<string, CrowdData>;
  currentZone: string;
  selectedZone: string | null;
  onZoneSelect: (zoneId: string | null) => void;
  onZoneNavigate: (zoneId: string) => void;
  stadiumName?: string;
}

// Helper to convert density to color
function getDensityColor(density: number): THREE.Color {
  if (density < 30) return new THREE.Color('#22c55e'); // green
  if (density < 50) return new THREE.Color('#eab308'); // yellow
  if (density < 70) return new THREE.Color('#f97316'); // orange
  return new THREE.Color('#ef4444'); // red
}

// Helper to convert density to height scale
function getDensityHeight(density: number): number {
  return 0.3 + (density / 100) * 1.2; // Height range from 0.3 to 1.5
}

// Individual Zone Section Component
function ZoneSection({
  zone,
  crowdData,
  isSelected,
  isCurrent,
  onClick,
  onDoubleClick,
}: {
  zone: VenueZone;
  crowdData?: CrowdData;
  isSelected: boolean;
  isCurrent: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  const density = crowdData?.density || 0;
  const targetHeight = getDensityHeight(density);
  const color = getDensityColor(density);

  // Convert 2D percentages to 3D positions
  // Stadium is centered at 0,0 with size 20x20
  const x = ((zone.x1 + zone.x2) / 2 - 50) * 0.2;
  const z = ((zone.y1 + zone.y2) / 2 - 50) * 0.2;
  const width = (zone.x2 - zone.x1) * 0.2;
  const depth = (zone.y2 - zone.y1) * 0.2;

  // Animate height
  useFrame(() => {
    if (meshRef.current) {
      const currentScale = meshRef.current.scale.y;
      const newScale = THREE.MathUtils.lerp(currentScale, targetHeight, 0.05);
      meshRef.current.scale.y = newScale;
      meshRef.current.position.y = newScale / 2;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* Zone box */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDoubleClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        scale={[1, 1, 1]}
      >
        <boxGeometry args={[width * 0.95, 1, depth * 0.95]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 0.95 : 0.8}
          emissive={isSelected || isCurrent ? color : undefined}
          emissiveIntensity={isSelected ? 0.4 : isCurrent ? 0.3 : 0}
        />
      </mesh>

      {/* Selection ring */}
      {(isSelected || isCurrent) && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(width, depth) * 0.5, Math.max(width, depth) * 0.55, 32]} />
          <meshBasicMaterial color={isCurrent ? '#FDB913' : '#ffffff'} transparent opacity={0.8} />
        </mesh>
      )}

      {/* Density label */}
      <Text
        position={[0, targetHeight + 0.3, 0]}
        fontSize={0.35}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Geist-Bold.ttf"
      >
        {Math.round(density)}%
      </Text>

      {/* Zone name (only for larger zones) */}
      {width > 1.5 && depth > 1.5 && (
        <Text
          position={[0, targetHeight + 0.6, 0]}
          fontSize={0.25}
          color="#FDB913"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Geist-Regular.ttf"
          maxWidth={width}
        >
          {zone.name}
        </Text>
      )}

      {/* Current location marker */}
      {isCurrent && (
        <mesh position={[0, targetHeight + 0.15, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FDB913" emissive="#FDB913" emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Hover tooltip */}
      {hovered && (
        <Html position={[0, targetHeight + 1, 0]} center>
          <div className="bg-[#002855]/95 text-white px-3 py-2 rounded-lg border border-[#FDB913]/50 shadow-lg min-w-[140px] pointer-events-none">
            <p className="font-semibold text-sm text-[#FDB913]">{zone.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-3 h-3" />
              <span className="text-xs">{crowdData?.currentCount?.toLocaleString() || 0} people</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs">Density: {Math.round(density)}%</span>
              {crowdData?.trend === 'increasing' && <TrendingUp className="w-3 h-3 text-red-400" />}
              {crowdData?.trend === 'decreasing' && <TrendingDown className="w-3 h-3 text-green-400" />}
              {crowdData?.trend === 'stable' && <Minus className="w-3 h-3 text-yellow-400" />}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Cricket Pitch in center
function CricketPitch() {
  return (
    <group>
      {/* Outer field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[4, 64]} />
        <meshStandardMaterial color="#1a472a" />
      </mesh>
      {/* Inner circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[1.5, 64]} />
        <meshStandardMaterial color="#2d5a3d" />
      </mesh>
      {/* Pitch rectangle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[0.6, 2]} />
        <meshStandardMaterial color="#c4a962" />
      </mesh>
    </group>
  );
}

// Stadium Base
function StadiumBase() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <circleGeometry args={[12, 64]} />
      <meshStandardMaterial color="#1a1a2e" />
    </mesh>
  );
}

// Main 3D Scene
function Stadium3DScene({
  zones,
  crowdData,
  currentZone,
  selectedZone,
  onZoneSelect,
  onZoneNavigate,
}: Omit<Stadium3DProps, 'stadiumName'>) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.3} color="#FDB913" />

      {/* Environment */}
      <Environment preset="night" />

      {/* Camera Controls */}
      <OrbitControls
        enablePan={false}
        minDistance={8}
        maxDistance={25}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        autoRotate={false}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Stadium Elements */}
      <StadiumBase />
      <CricketPitch />

      {/* Zone Sections */}
      {zones
        .filter((z) => z.type !== 'exit')
        .map((zone) => (
          <ZoneSection
            key={zone.id}
            zone={zone}
            crowdData={crowdData.get(zone.id)}
            isSelected={selectedZone === zone.id}
            isCurrent={currentZone === zone.id}
            onClick={() => onZoneSelect(selectedZone === zone.id ? null : zone.id)}
            onDoubleClick={() => onZoneNavigate(zone.id)}
          />
        ))}
    </>
  );
}

// Zone Details Panel for 3D view
function ZoneDetailsPanel({
  zone,
  crowdData,
  onNavigate,
  onClose,
  isCurrent,
}: {
  zone: VenueZone;
  crowdData?: CrowdData;
  onNavigate: () => void;
  onClose: () => void;
  isCurrent: boolean;
}) {
  const density = crowdData?.density || 0;
  const getDensityLabel = (d: number) => {
    if (d < 30) return { label: 'Low', color: 'bg-green-500' };
    if (d < 50) return { label: 'Medium', color: 'bg-yellow-500' };
    if (d < 70) return { label: 'High', color: 'bg-orange-500' };
    return { label: 'Critical', color: 'bg-red-500' };
  };
  const densityInfo = getDensityLabel(density);

  return (
    <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-[#002855]/95 border-[#FDB913]/40 backdrop-blur z-20">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-white text-lg">{zone.name}</h3>
            <p className="text-xs text-blue-300 capitalize">{zone.type.replace(/_/g, ' ')}</p>
          </div>
          <Badge className={`${densityInfo.color} text-white`}>{densityInfo.label}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#001F3F] rounded-lg p-3">
            <p className="text-xs text-blue-400">Crowd Density</p>
            <p className="text-xl font-bold text-white">{Math.round(density)}%</p>
          </div>
          <div className="bg-[#001F3F] rounded-lg p-3">
            <p className="text-xs text-blue-400">People Count</p>
            <p className="text-xl font-bold text-white">{crowdData?.currentCount?.toLocaleString() || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-blue-300">Trend:</span>
          {crowdData?.trend === 'increasing' && (
            <span className="flex items-center gap-1 text-red-400 text-xs">
              <TrendingUp className="w-3 h-3" /> Increasing
            </span>
          )}
          {crowdData?.trend === 'decreasing' && (
            <span className="flex items-center gap-1 text-green-400 text-xs">
              <TrendingDown className="w-3 h-3" /> Decreasing
            </span>
          )}
          {crowdData?.trend === 'stable' && (
            <span className="flex items-center gap-1 text-yellow-400 text-xs">
              <Minus className="w-3 h-3" /> Stable
            </span>
          )}
        </div>

        {/* AI Recommendation */}
        <div className="bg-[#FDB913]/10 border border-[#FDB913]/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-[#FDB913]" />
            <span className="text-xs font-medium text-[#FDB913]">AI Insight</span>
          </div>
          <p className="text-xs text-blue-200">
            {density > 70
              ? 'High crowd density. Consider visiting during off-peak times.'
              : density > 50
              ? 'Moderate crowd. Good time to visit with some wait expected.'
              : 'Low crowd density. Ideal time to visit this area.'}
          </p>
        </div>

        <div className="flex gap-2">
          {!isCurrent && (
            <Button
              onClick={onNavigate}
              className="flex-1 bg-[#FDB913] hover:bg-yellow-400 text-[#003B7B] font-semibold"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Navigate Here
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="border-blue-500/50 text-blue-300 hover:bg-blue-500/20">
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Fallback component for loading
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#FDB913" />
    </mesh>
  );
}

// Main Export Component
export default function Stadium3D({
  zones,
  crowdData,
  currentZone,
  selectedZone,
  onZoneSelect,
  onZoneNavigate,
  stadiumName = 'Stadium',
}: Stadium3DProps) {
  const selectedZoneData = selectedZone ? zones.find((z) => z.id === selectedZone) : null;
  const [isClient, setIsClient] = useState(false);

  // Ensure we only render on client
  useState(() => {
    setIsClient(true);
  });

  if (!isClient && typeof window === 'undefined') {
    return (
      <div className="relative w-full h-[500px] md:h-[600px] bg-[#001020] rounded-xl overflow-hidden flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#FDB913] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-b from-[#001830] to-[#000a14] rounded-xl overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 15, 15], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#001020']} />
        <fog attach="fog" args={['#001020', 15, 40]} />
        <Suspense fallback={<LoadingFallback />}>
          <Stadium3DScene
            zones={zones}
            crowdData={crowdData}
            currentZone={currentZone}
            selectedZone={selectedZone}
            onZoneSelect={onZoneSelect}
            onZoneNavigate={onZoneNavigate}
          />
        </Suspense>
      </Canvas>

      {/* Instructions Overlay */}
      <div className="absolute top-4 left-4 bg-[#002855]/80 backdrop-blur px-3 py-2 rounded-lg text-xs text-blue-200">
        <p>Drag to rotate | Scroll to zoom | Click zone for details</p>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-[#002855]/80 backdrop-blur px-3 py-2 rounded-lg">
        <p className="text-xs text-blue-300 mb-2">Crowd Density</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-[10px] text-green-300">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-[10px] text-yellow-300">Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-[10px] text-red-300">High</span>
          </div>
        </div>
        <p className="text-[10px] text-blue-400 mt-2">Height = Crowd level</p>
      </div>

      {/* Current Location Indicator */}
      <div className="absolute bottom-4 left-4 bg-[#002855]/80 backdrop-blur px-3 py-2 rounded-lg flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-[#FDB913] animate-pulse" />
        <span className="text-xs text-white">Your Location</span>
      </div>

      {/* Selected Zone Details Panel */}
      {selectedZoneData && (
        <ZoneDetailsPanel
          zone={selectedZoneData}
          crowdData={crowdData.get(selectedZone!)}
          onNavigate={() => {
            onZoneNavigate(selectedZone!);
            onZoneSelect(null);
          }}
          onClose={() => onZoneSelect(null)}
          isCurrent={currentZone === selectedZone}
        />
      )}
    </div>
  );
}
