'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { ViewerProps } from '@/types/configurator';
import type { BagPrintArea } from '@/types/products';

const DISPLAY_SCALE = 4.8;
const FRONT_OFFSET = 0.0035;
const FABRIC_PATHS = {
  color: '/textures/fabric062/Fabric062_2K-JPG_Color.jpg',
  normal: '/textures/fabric062/Fabric062_2K-JPG_NormalGL.jpg',
  roughness: '/textures/fabric062/Fabric062_2K-JPG_Roughness.jpg',
  ao: '/textures/fabric062/Fabric062_2K-JPG_AmbientOcclusion.jpg',
} as const;

const DEFAULT_PRINT_AREA: BagPrintArea = {
  centerHeightRatio: 0.58,
  logoWidthRatio: 0.42,
  textWidthRatio: 0.62,
  textOffsetRatio: 0.14,
};

function isLightColor(hex: string) {
  const normalized = hex.replace('#', '');
  const fullHex = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const numeric = Number.parseInt(fullHex, 16);
  const red = (numeric >> 16) & 255;
  const green = (numeric >> 8) & 255;
  const blue = numeric & 255;
  const luminance = (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255;
  return luminance > 0.72;
}

function tintColor(hex: string, amount: number) {
  const color = new THREE.Color(hex);
  const target = amount >= 0 ? new THREE.Color('#ffffff') : new THREE.Color('#000000');
  return color.lerp(target, Math.abs(amount));
}

function applyTextureSettings(texture: THREE.Texture, isColorTexture = false) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 16;
  texture.needsUpdate = true;

  if (isColorTexture) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
}

function createTextTexture(text: string, textColor: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 1024;

  const context = canvas.getContext('2d');
  if (!context) {
    return new THREE.CanvasTexture(canvas);
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = textColor;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  let fontSize = 420;
  do {
    context.font = `700 ${fontSize}px "Segoe UI", Arial, sans-serif`;
    fontSize -= 16;
  } while (fontSize > 140 && context.measureText(text).width > canvas.width * 0.86);

  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  return texture;
}

function useProcessedLogoTexture(url: string | null, removeWhiteBackground: boolean) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let nextTexture: THREE.Texture | null = null;

    if (!url) {
      setTexture((previousTexture) => {
        previousTexture?.dispose();
        return null;
      });
      return undefined;
    }

    const image = new Image();
    image.onload = () => {
      if (cancelled) return;

      const maxDimension = 2048;
      const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) return;

      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      if (removeWhiteBackground) {
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;

        for (let index = 0; index < data.length; index += 4) {
          const red = data[index];
          const green = data[index + 1];
          const blue = data[index + 2];
          const brightness = (red + green + blue) / 3;

          if (brightness >= 248) {
            data[index + 3] = 0;
          } else if (brightness >= 214) {
            const alphaMultiplier = (248 - brightness) / 34;
            data[index + 3] = Math.round(data[index + 3] * alphaMultiplier);
          }
        }

        context.putImageData(imageData, 0, 0);
      }

      nextTexture = new THREE.CanvasTexture(canvas);
      nextTexture.colorSpace = THREE.SRGBColorSpace;
      nextTexture.anisotropy = 16;
      nextTexture.needsUpdate = true;

      setTexture((previousTexture) => {
        previousTexture?.dispose();
        return nextTexture;
      });
    };

    image.src = url;

    return () => {
      cancelled = true;
      nextTexture?.dispose();
    };
  }, [removeWhiteBackground, url]);

  return texture;
}

function LogoLayer({
  texture,
  logoSize,
  centerY,
  frontZ,
}: {
  texture: THREE.Texture;
  logoSize: number;
  centerY: number;
  frontZ: number;
}) {
  return (
    <>
      <mesh position={[0, centerY, frontZ]} renderOrder={10}>
        <planeGeometry args={[logoSize, logoSize]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} alphaTest={0.01} />
      </mesh>
      <mesh position={[0, centerY, -frontZ]} rotation={[0, Math.PI, 0]} renderOrder={10}>
        <planeGeometry args={[logoSize, logoSize]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} alphaTest={0.01} />
      </mesh>
    </>
  );
}

function TextLayer({
  text,
  textColor,
  textY,
  frontZ,
  width,
}: {
  text: string;
  textColor: string;
  textY: number;
  frontZ: number;
  width: number;
}) {
  const textTexture = useMemo(() => createTextTexture(text, textColor), [text, textColor]);
  const planeHeight = Math.max(0.042, width * 0.135);

  useEffect(() => () => textTexture.dispose(), [textTexture]);

  return (
    <>
      <mesh position={[0, textY, frontZ]} renderOrder={9}>
        <planeGeometry args={[width, planeHeight]} />
        <meshBasicMaterial map={textTexture} transparent toneMapped={false} alphaTest={0.01} />
      </mesh>
      <mesh position={[0, textY, -frontZ]} rotation={[0, Math.PI, 0]} renderOrder={9}>
        <planeGeometry args={[width, planeHeight]} />
        <meshBasicMaterial map={textTexture} transparent toneMapped={false} alphaTest={0.01} />
      </mesh>
    </>
  );
}

function BagMesh({
  modelPath,
  colorHex,
  logoUrl,
  logoScale,
  removeWhiteBackground,
  customText,
  dimensions,
  printArea,
}: Required<Pick<ViewerProps, 'modelPath' | 'colorHex' | 'customText' | 'dimensions' | 'logoScale' | 'removeWhiteBackground'>> & {
  logoUrl: string | null;
  printArea?: BagPrintArea;
}) {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const fabricTextures = useTexture(FABRIC_PATHS) as Record<keyof typeof FABRIC_PATHS, THREE.Texture>;
  const processedLogoTexture = useProcessedLogoTexture(logoUrl, removeWhiteBackground);

  useEffect(() => {
    applyTextureSettings(fabricTextures.color, true);
    applyTextureSettings(fabricTextures.normal);
    applyTextureSettings(fabricTextures.roughness);
    applyTextureSettings(fabricTextures.ao);
  }, [fabricTextures.ao, fabricTextures.color, fabricTextures.normal, fabricTextures.roughness]);

  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    map: fabricTextures.color,
    normalMap: fabricTextures.normal,
    roughnessMap: fabricTextures.roughness,
    aoMap: fabricTextures.ao,
    normalScale: new THREE.Vector2(0.8, 0.8),
    roughness: 0.86,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }), [colorHex, fabricTextures.ao, fabricTextures.color, fabricTextures.normal, fabricTextures.roughness]);

  const handleMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: tintColor(colorHex, isLightColor(colorHex) ? -0.03 : 0.06),
    map: fabricTextures.color,
    normalMap: fabricTextures.normal,
    roughnessMap: fabricTextures.roughness,
    aoMap: fabricTextures.ao,
    normalScale: new THREE.Vector2(0.7, 0.7),
    roughness: 0.82,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }), [colorHex, fabricTextures.ao, fabricTextures.color, fabricTextures.normal, fabricTextures.roughness]);

  const pipingMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: tintColor(colorHex, isLightColor(colorHex) ? -0.08 : 0.12),
    map: fabricTextures.color,
    normalMap: fabricTextures.normal,
    roughnessMap: fabricTextures.roughness,
    aoMap: fabricTextures.ao,
    normalScale: new THREE.Vector2(0.9, 0.9),
    roughness: 0.92,
    metalness: 0.02,
    side: THREE.DoubleSide,
  }), [colorHex, fabricTextures.ao, fabricTextures.color, fabricTextures.normal, fabricTextures.roughness]);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      child.frustumCulled = false;

      if (child.geometry.getAttribute('uv') && !child.geometry.getAttribute('uv2')) {
        const uvAttribute = child.geometry.getAttribute('uv');
        child.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(Array.from(uvAttribute.array), 2));
      }

      const materialName = Array.isArray(child.material)
        ? child.material.map((material) => material.name.toLowerCase()).join(' ')
        : child.material.name.toLowerCase();
      const objectName = child.name.toLowerCase();

      if (materialName.includes('handle') || objectName.includes('handle')) {
        child.material = handleMaterial;
        return;
      }

      if (materialName.includes('piping') || objectName.includes('piping') || objectName.includes('edge')) {
        child.material = pipingMaterial;
        return;
      }

      child.material = bodyMaterial;
    });
  }, [bodyMaterial, clonedScene, handleMaterial, pipingMaterial]);

  useEffect(() => () => {
    bodyMaterial.dispose();
    handleMaterial.dispose();
    pipingMaterial.dispose();
  }, [bodyMaterial, handleMaterial, pipingMaterial]);

  const area = { ...DEFAULT_PRINT_AREA, ...printArea };
  const centeredBase = -dimensions.height / 2;
  const frontZ = (dimensions.depth / 2) + FRONT_OFFSET;
  const baseLogoSize = Math.min(dimensions.width * area.logoWidthRatio, dimensions.height * 0.48);
  const logoSize = Math.min(
    Math.max(baseLogoSize * logoScale, dimensions.width * 0.24),
    Math.min(dimensions.width * 0.88, dimensions.height * 0.72)
  );
  const logoCenterY = centeredBase + (dimensions.height * area.centerHeightRatio);
  const textY = logoCenterY - (logoSize / 2) - (dimensions.height * area.textOffsetRatio);
  const textColor = isLightColor(colorHex) ? '#243344' : '#f8fafc';

  return (
    <group scale={DISPLAY_SCALE}>
      <primitive object={clonedScene} position={[0, centeredBase, 0]} />
      {processedLogoTexture && (
        <LogoLayer
          texture={processedLogoTexture}
          logoSize={logoSize}
          centerY={logoCenterY}
          frontZ={frontZ}
        />
      )}
      {customText.trim() && (
        <TextLayer
          text={customText.trim()}
          textColor={textColor}
          textY={textY}
          frontZ={frontZ}
          width={dimensions.width * area.textWidthRatio}
        />
      )}
    </group>
  );
}

export function ProductScene({
  modelPath,
  colorHex,
  logoUrl,
  logoScale,
  removeWhiteBackground,
  customText,
  dimensions,
  printArea,
}: Pick<ViewerProps, 'modelPath' | 'colorHex' | 'logoUrl' | 'logoScale' | 'removeWhiteBackground' | 'customText' | 'dimensions' | 'printArea'>) {
  if (!modelPath || !dimensions) {
    return null;
  }

  const displayedHeight = dimensions.height * DISPLAY_SCALE;
  const displayedMax = Math.max(dimensions.width, dimensions.depth, dimensions.height) * DISPLAY_SCALE;
  const cameraDistance = displayedMax * 3.25;
  const controlsTargetY = displayedHeight * 0.06;

  return (
    <Canvas
      key={modelPath}
      dpr={[1, 2.25]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      camera={{ position: [displayedMax * 0.42, displayedHeight * 0.56, cameraDistance], fov: 32 }}
    >
      <ambientLight intensity={0.95} />
      <hemisphereLight args={['#ffffff', '#d7dee7', 1.12]} />
      <directionalLight
        position={[displayedMax * 1.75, displayedHeight * 1.8, displayedMax * 1.9]}
        intensity={1.95}
      />
      <directionalLight
        position={[-displayedMax * 1.25, displayedHeight * 0.92, -displayedMax * 1.5]}
        intensity={0.78}
      />

      <Suspense fallback={null}>
        <BagMesh
          modelPath={modelPath}
          colorHex={colorHex}
          logoUrl={logoUrl}
          logoScale={logoScale}
          removeWhiteBackground={removeWhiteBackground}
          customText={customText}
          dimensions={dimensions}
          printArea={printArea}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={displayedMax * 1.85}
        maxDistance={displayedMax * 4.3}
        target={[0, controlsTargetY, 0]}
        minPolarAngle={Math.PI / 4.6}
        maxPolarAngle={Math.PI / 1.55}
      />
    </Canvas>
  );
}
