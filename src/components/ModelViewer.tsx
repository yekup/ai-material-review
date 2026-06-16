import { Suspense, useMemo, useRef, useEffect, useState } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, useGLTF, useProgress } from '@react-three/drei'
import { STLLoader } from 'three-stdlib'
import * as THREE from 'three'
import { Alert, Button, Space } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

/* ------------------------------------------------------------------ */
/*  AutoScale — fit model within a 2.5-unit sphere                    */
/* ------------------------------------------------------------------ */
function useAutoScale(ref: React.RefObject<THREE.Group | null>, deps: React.DependencyList) {
  useEffect(() => {
    const group = ref.current
    if (!group) return
    // Wait one frame for children to mount
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
/*  GLB Model                                                         */
/* ------------------------------------------------------------------ */
function GLBModel({ file }: { file: string }) {
  const { scene } = useGLTF(file)
  const groupRef = useRef<THREE.Group>(null!)
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

    // Center
    clone.translate(
      -(box.max.x + box.min.x) / 2,
      -(box.max.y + box.min.y) / 2,
      -(box.max.z + box.min.z) / 2,
    )

    // Auto-scale to ~2.5 units
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
/*  Loading monitor                                                   */
/* ------------------------------------------------------------------ */
function LoadingMonitor({ onError }: { onError: (msg: string) => void }) {
  const { errors } = useProgress()
  const reported = useRef(false)

  useEffect(() => {
    if (errors.length > 0 && !reported.current) {
      reported.current = true
      onError(errors[errors.length - 1])
    }
  }, [errors, onError])

  return null
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */
function ModelScene({ file, format, onError }: {
  file: string
  format: string
  onError: (msg: string) => void
}) {
  return (
    <>
      <LoadingMonitor onError={onError} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-3, 2, -2]} intensity={0.3} />
      <hemisphereLight intensity={0.3} />

      <Suspense fallback={null}>
        {format === 'glb'
          ? <GLBModel key={file} file={file} />
          : <STLModel key={file} file={file} />}
      </Suspense>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Exported component                                                 */
/* ------------------------------------------------------------------ */
interface Props {
  file: string
  format: string
  style?: React.CSSProperties
}

export default function ModelViewer({ file, format, style }: Props) {
  const [loadError, setLoadError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => { setLoadError(null) }, [file])

  const handleRetry = () => {
    setLoadError(null)
    setRetryKey(k => k + 1)
  }

  if (loadError) {
    return (
      <div style={{
        width: '100%', height: '100%', minHeight: 360,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fafafa', borderRadius: 8,
        ...style,
      }}>
        <Space direction="vertical" align="center" size={12}>
          <Alert type="error" message="模型加载失败" description={loadError} showIcon />
          <Button icon={<ReloadOutlined />} onClick={handleRetry}>重试</Button>
        </Space>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 360,
      background: '#f5f5f5', borderRadius: 8, overflow: 'hidden', position: 'relative',
      ...style,
    }}>
      <Canvas
        key={`${file}-${retryKey}`}
        camera={{ position: [3, 2, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ModelScene file={file} format={format} onError={setLoadError} />
        <OrbitControls enableRotate enableZoom enablePan minDistance={0.5} maxDistance={20} />
      </Canvas>
    </div>
  )
}
