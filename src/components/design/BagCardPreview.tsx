'use client';

import { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const FABRIC_PATHS = {
  color: '/textures/fabric062/Fabric062_2K-JPG_Color.jpg',
  normal: '/textures/fabric062/Fabric062_2K-JPG_NormalGL.jpg',
  roughness: '/textures/fabric062/Fabric062_2K-JPG_Roughness.jpg',
  ao: '/textures/fabric062/Fabric062_2K-JPG_AmbientOcclusion.jpg',
} as const;

function StaticBag({
  modelPath,
  colorHex,
  dimensions,
}: {
  modelPath: string;
  colorHex: string;
  dimensions: { width: number; depth: number; height: number };
}) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const fabric = useTexture(FABRIC_PATHS) as Record<keyof typeof FABRIC_PATHS, THREE.Texture>;

  useEffect(() => {
    [fabric.color, fabric.normal, fabric.roughness, fabric.ao].forEach((texture, idx) => {
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.anisotropy = 8;
      if (idx === 0) texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    });
  }, [fabric.ao, fabric.color, fabric.normal, fabric.roughness]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        map: fabric.color,
        normalMap: fabric.normal,
        roughnessMap: fabric.roughness,
        aoMap: fabric.ao,
        normalScale: new THREE.Vector2(2.0, 2.0),
        roughness: 0.93,
        metalness: 0.0,
        envMapIntensity: 0.6,
        side: THREE.DoubleSide,
      }),
    [colorHex, fabric.ao, fabric.color, fabric.normal, fabric.roughness]
  );

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.frustumCulled = false;
      if (child.geometry.getAttribute('uv') && !child.geometry.getAttribute('uv2')) {
        const uvAttribute = child.geometry.getAttribute('uv');
        child.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(Array.from(uvAttribute.array), 2));
      }
      child.material = material;
    });
  }, [clonedScene, material]);

  useEffect(() => () => material.dispose(), [material]);

  const centeredBase = -dimensions.height / 2;

  return (
    <group scale={4.8}>
      <primitive object={clonedScene} position={[0, centeredBase, 0]} />
    </group>
  );
}

interface BagCardPreviewProps {
  modelPath: string;
  dimensions: { width: number; depth: number; height: number };
  colorHex?: string;
}

export function BagCardPreview({
  modelPath,
  dimensions,
  colorHex = '#F5F0E8',
}: BagCardPreviewProps) {
  const maxSide = Math.max(dimensions.width, dimensions.depth, dimensions.height) * 4.8;

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      camera={{ position: [maxSide * 0.35, maxSide * 0.4, maxSide * 2.6], fov: 30 }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Environment preset="studio" environmentIntensity={0.9} />
      </Suspense>
      <hemisphereLight args={['#ffffff', '#d7dee7', 0.4]} />
      <directionalLight position={[maxSide * 1.5, maxSide * 1.6, maxSide * 1.5]} intensity={0.6} />
      <Suspense fallback={null}>
        <StaticBag modelPath={modelPath} colorHex={colorHex} dimensions={dimensions} />
      </Suspense>
    </Canvas>
  );
}
