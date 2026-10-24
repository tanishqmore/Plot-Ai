import { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Bounds,
} from "@react-three/drei";

const API_BASE_URL = "http://localhost:8000";

interface FinalModelViewerProps {
  url: string;
  lengthFt?: number;
  widthFt?: number;
}

function Model({ url }: { url: string }) {
  const modelUrl = url.startsWith("http")
    ? url
    : `${API_BASE_URL}${url}`;

  const { scene } = useGLTF(modelUrl);

  return <primitive object={scene} />;
}

/*
 * Automatically makes sure the camera is positioned
 * correctly for the actual GLB model.
 */
function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
}

export default function FinalModelViewer({
  url,
}: FinalModelViewerProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "480px",
        background: "#f5f5f5",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      <Canvas
        shadows
        camera={{
          position: [20, -25, 18],
          fov: 45,
          near: 0.01,
          far: 1000,
        }}
      >
        <ambientLight intensity={0.75} />

        <directionalLight
          position={[20, -30, 40]}
          intensity={1.5}
          castShadow
        />

        <directionalLight
          position={[-20, 20, 25]}
          intensity={0.7}
        />

        <Suspense fallback={null}>
          <Bounds
            fit
            clip
            observe
            margin={1.3}
          >
            <Model url={url} />
          </Bounds>

          <Environment preset="city" />
        </Suspense>

        <CameraSetup />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={150}
          target={[0, 0, 3]}
        />
      </Canvas>
    </div>
  );
}