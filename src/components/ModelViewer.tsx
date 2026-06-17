import { Suspense, useMemo, useRef, useEffect } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center } from '@react-three/drei'
import { STLLoader } from 'three-stdlib'
import * as THREE from 'three'

/* ------------------------------------------------------------------ */
/*  AutoScale                                                         */
/* ------------------------------------------------------------------ */
function useAutoScale(ref: React.RefObject<THREE.Group | null>, deps: React.DependencyList) {
  useEffect(() => {
    const group = ref.current
    if (!group) return
    const id = requestAnimationFrame(() => {
      const box = new THREE.Box3().setFromObject(group)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      if (maxDim > 0.001 && (Math.abs(maxDim - 2.5) > 0.1)) {
        group.scale.setScalar(2.5 / maxDim)
      }
    })
    return () => cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/* ------------------------------------------------------------------ */
/*  Strip all textures from loaded GLB — avoids blob URL context loss  */
/* ------------------------------------------------------------------ */
function stripTextures(scene: THREE.Group) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const mats = Array.isArray(child.material) ? child.material : [child.material]
      child.material = mats.map((mat) => {
        const color = mat.color ? mat.color.clone() : new THREE.Color('#cccccc')
        return new THREE.MeshStandardMaterial({
          color,
          roughness: 0.6,
          metalness: 0.05,
          flatShading: false,
          side: THREE.DoubleSide,
        })
      })
      if (Array.isArray(child.material) && child.material.length === 1) {
        child.material = child.material[0]
      }
    }
  })
}

/* ------------------------------------------------------------------ */
/*  GLB Model — textures stripped                                     */
/* ------------------------------------------------------------------ */
function GLBModel({ file }: { file: string }) {
  const { scene } = useGLTF(file)
  const groupRef = useRef<THREE.Group>(null!)

  // Strip textures once on mount to prevent blob URL context loss
  useEffect(() => {
    stripTextures(scene)
  }, [scene])

  useAutoScale(groupRef, [scene])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  STL Model                                                         */
/* ------------------------------------------------------------------ */
function STLModel({ file }: { file: string }) {
  const rawGeometry = useLoader(STLLoader, file) as THREE.BufferGeometry

  const geometry = useMemo(() => {
    const clone = rawGeometry.clone()
    clone.computeBoundingBox()
    const box = clone.boundingBox!

    clone.translate(
      -(box.max.x + box.min.x) / 2,
      -(box.max.y + box.min.y) / 2,
      -(box.max.z + box.min.z) / 2,
    )

    const size = new THREE.Vector3()
    box.getSize(size)
    const maxDim = Math.max(size.x, size.y, size.z)
    if (maxDim > 0.001) {
      const s = 2.5 / maxDim
      clone.scale(s, s, s)
    }

    return clone
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        color="#b0bccd"
        metalness={0.1}
        roughness={0.7}
        flatShading
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/*  Scene                                                             */
/* ------------------------------------------------------------------ */
function ModelScene({ file, format }: { file: string; format: string }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} />
      <hemisphereLight intensity={0.3} />

      <Suspense fallback={null}>
        <Center>
          {format === 'glb'
            ? <GLBModel file={file} />
            : <STLModel file={file} />}
        </Center>
      </Suspense>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Exported                                                          */
/* ------------------------------------------------------------------ */
interface Props {
  file: string
  format: string
  style?: React.CSSProperties
}

export default function ModelViewer({ file, format, style }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 360,
      background: '#f5f5f5', borderRadius: 8, overflow: 'hidden', position: 'relative',
      ...style,
    }}>
      <Canvas
        key={file}
        camera={{ position: [3, 2, 5], fov: 45 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false,
        }}
      >
        <ModelScene file={file} format={format} />
        <OrbitControls enableRotate enableZoom enablePan minDistance={0.5} maxDistance={20} />
      </Canvas>
    </div>
  )
}
