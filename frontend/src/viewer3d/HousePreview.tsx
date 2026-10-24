import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";

/**
 * Client-side instant preview: mirrors the backend's parametric massing
 * logic (see backend/app/services/model_generation_service.py) so the
 * user sees a live box-massing model *before* the final .glb is generated
 * server-side. Good UX: instant feedback while the "real" model renders.
 *
 * Once the backend returns a generated_models.model_url, swap this out
 * for <FinalModelViewer url={modelUrl} /> using useGLTF from drei.
 */
interface HousePreviewProps {
  lengthFt: number;
  widthFt: number;
  floors: number;
  roofType: "flat" | "sloped" | "hip";
}

const FT_TO_M = 0.3048;
const WALL_HEIGHT_FT = 10;

function Massing({ lengthFt, widthFt, floors, roofType }: HousePreviewProps) {
  const l = lengthFt * FT_TO_M;
  const w = widthFt * FT_TO_M;
  const floorH = WALL_HEIGHT_FT * FT_TO_M;

  return (
    <group>
      {Array.from({ length: floors }).map((_, i) => (
        <mesh key={i} position={[0, floorH * i + floorH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[l, floorH, w]} />
          <meshStandardMaterial color="#e8dcc8" />
        </mesh>
      ))}
      {roofType === "sloped" ? (
        <mesh position={[0, floorH * floors + 0.75, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[Math.max(l, w) * 0.75, 1.5, 4]} />
          <meshStandardMaterial color="#8b4b3b" />
        </mesh>
      ) : (
        <mesh position={[0, floorH * floors + 0.1, 0]}>
          <boxGeometry args={[l, 0.2, w]} />
          <meshStandardMaterial color="#555" />
        </mesh>
      )}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[l * 3, w * 3]} />
        <meshStandardMaterial color="#7fae5b" />
      </mesh>
    </group>
  );
}

export default function HousePreview(props: HousePreviewProps) {
  return (
    <div style={{ width: "100%", height: 480 }}>
      <Canvas shadows camera={{ position: [15, 12, 15], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 15, 5]} intensity={1} castShadow />
        <Massing {...props} />
        <OrbitControls />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
