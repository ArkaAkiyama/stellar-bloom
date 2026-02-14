import { useRef, useState, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import { content } from "@/config/content";

interface MemoryCardProps {
  position: [number, number, number];
  caption: string;
  index: number;
  selectedIndex: number | null;
  onSelect: (index: number | null) => void;
}

function MemoryCard({ position, caption, index, selectedIndex, onSelect }: MemoryCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const [hovered, setHovered] = useState(false);
  const isSelected = selectedIndex === index;
  const isOther = selectedIndex !== null && !isSelected;

  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * delta * 4;
    meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * delta * 4;

    const mat = meshRef.current.material as THREE.MeshPhysicalMaterial;
    const targetOpacity = isOther ? 0.1 : 0.35;
    mat.opacity += (targetOpacity - mat.opacity) * delta * 3;
  });

  const handlePointerMove = (e: any) => {
    if (isSelected) return;
    e.stopPropagation();
    const point = e.point as THREE.Vector3;
    const local = meshRef.current!.worldToLocal(point.clone());
    targetRotation.current.x = -local.y * 0.3;
    targetRotation.current.y = local.x * 0.3;
  };

  const handlePointerLeave = () => {
    targetRotation.current = { x: 0, y: 0 };
    setHovered(false);
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isSelected) {
      onSelect(null);
      gsap.to(camera.position, {
        x: 0, y: 0, z: 10,
        duration: 1.2,
        ease: "power2.inOut",
      });
    } else {
      onSelect(index);
      gsap.to(camera.position, {
        x: position[0] * 0.3,
        y: position[1] * 0.3,
        z: position[2] + 3.5,
        duration: 1.2,
        ease: "power2.inOut",
      });
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerMove={handlePointerMove}
      onPointerOver={() => setHovered(true)}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
    >
      <planeGeometry args={[2.2, 3]} />
      <meshPhysicalMaterial
        color="#8b7fc7"
        transparent
        opacity={0.35}
        roughness={0.15}
        metalness={0.1}
        transmission={0.6}
        thickness={0.5}
        envMapIntensity={0.5}
        clearcoat={1}
        clearcoatRoughness={0.1}
        side={THREE.DoubleSide}
      />
      <Html
        position={[0, -1.8, 0.05]}
        center
        style={{
          pointerEvents: "none",
          whiteSpace: "nowrap",
          opacity: hovered || isSelected ? 1 : 0.5,
          transition: "opacity 0.3s",
        }}
      >
        <p
          style={{
            color: "hsl(270, 30%, 82%)",
            fontSize: "13px",
            fontFamily: "serif",
            letterSpacing: "0.08em",
            textAlign: "center",
          }}
        >
          {caption}
        </p>
      </Html>
    </mesh>
  );
}

interface MemoriesGalleryProps {
  visible: boolean;
}

export default function MemoriesGallery({ visible }: MemoriesGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [renderCards, setRenderCards] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const prevVisible = useRef(visible);

  const cardPositions = useMemo<[number, number, number][]>(() => {
    const memories = content.memories;
    const totalArc = Math.PI * 0.6;
    const radius = 6;
    return memories.map((_, i) => {
      const angle = -totalArc / 2 + (totalArc / (memories.length - 1 || 1)) * i;
      const x = Math.sin(angle) * radius;
      const z = -Math.cos(angle) * radius + radius - 2;
      const y = (Math.random() - 0.5) * 0.8;
      return [x, y, z];
    });
  }, []);

  // When visible becomes true, show cards. When false, reset camera & hide cards after fade.
  useEffect(() => {
    if (visible && !prevVisible.current) {
      setRenderCards(true);
      setSelectedIndex(null);
    }
    if (!visible && prevVisible.current) {
      // Reset camera to heart-view position
      gsap.to(camera.position, {
        x: 0, y: 0.5, z: 8,
        duration: 1,
        ease: "power2.inOut",
      });
      setSelectedIndex(null);
      // Delay hiding cards until scale-down completes
      const t = setTimeout(() => setRenderCards(false), 800);
      prevVisible.current = visible;
      return () => clearTimeout(t);
    }
    prevVisible.current = visible;
  }, [visible, camera]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const target = visible ? 1 : 0;
    const s = groupRef.current.scale.x;
    const ns = s + (target - s) * delta * 3;
    groupRef.current.scale.setScalar(Math.max(0, ns));
    groupRef.current.visible = ns > 0.01;
  });

  if (!renderCards && !visible) return null;

  return (
    <group ref={groupRef} scale={0}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 3, 5]} intensity={0.5} color="#c4b5fd" />
      {renderCards && content.memories.map((memory, i) => (
        <MemoryCard
          key={i}
          index={i}
          position={cardPositions[i]}
          caption={memory.caption}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />
      ))}
    </group>
  );
}
