import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const BLOCK_SIZES = [1, 2, 4, 8, 16, 24, 32];
const COLORS = ["#7c3aed", "#2563eb", "#059669", "#facc15", "#fb923c", "#ef4444", "#a855f7"];

const CustomFloor = ({ gridLayout }) => (
  <group>
    {gridLayout.flatMap((row, z) =>
      row.map((cell, x) => {
        if (!cell) return null;
        return (
          <mesh key={`cell-${x}-${z}`} position={[x, 0, z]}>
            <boxGeometry args={[1, 0.1, 1]} />
            <meshBasicMaterial color="#dddddd" />
          </mesh>
        );
      })
    )}
  </group>
);

const DraggableBlock = ({ size, color, position, onUpdate, heightLimit }) => {
  const ref = useRef();
  const [dragging, setDragging] = useState(false);

  const snap = (x, y, z) => [Math.round(x), Math.min(Math.round(y), 1 + heightLimit), Math.round(z)];

  const onPointerDown = (e) => {
    e.stopPropagation();
    setDragging(true);
  };

  const onPointerUp = () => setDragging(false);

  const onPointerMove = (e) => {
    if (!dragging) return;
    const [x, y, z] = e.point.toArray();
    const newPos = snap(x, y, z);
    onUpdate(newPos);
  };

  return (
    <mesh
      ref={ref}
      position={position}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerMove={onPointerMove}
      castShadow
    >
      <boxGeometry args={[1, 1, size / 2]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

const Scene = () => {
  const [blocks, setBlocks] = useState(
    BLOCK_SIZES.map((size, i) => ({
      id: i,
      size,
      color: COLORS[i % COLORS.length],
      position: [i - 3, 0.5, -5],
    }))
  );

  const [gridLayout] = useState([
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ]);

  const heightLimit = 4;

  const updateBlockPosition = (id, pos) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, position: pos } : b)));
  };

  return (
    <Canvas camera={{ position: [5, 10, 20], fov: 60 }} shadows>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <OrbitControls enablePan enableZoom enableRotate />
      <CustomFloor gridLayout={gridLayout} />
      {blocks.map((b) => (
        <DraggableBlock
          key={b.id}
          size={b.size}
          color={b.color}
          position={b.position}
          onUpdate={(pos) => updateBlockPosition(b.id, pos)}
          heightLimit={heightLimit}
        />
      ))}
    </Canvas>
  );
};

const CargoBuilderApp = () => (
  <div className="h-screen w-screen">
    <Scene />
  </div>
);

export default CargoBuilderApp;