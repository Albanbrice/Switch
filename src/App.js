import React, { Suspense, useRef, useLayoutEffect, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import create from "zustand";

const useStore = create((set, get) => ({
  camPosition: [0, 35, 55],
  setCamPosition: (camPosition) =>
    set((state) => ({ camPosition: camPosition })),
  target: [0, 0, 0],
  setTarget: (target) => set((state) => ({ target: target }))
}));

const CustomCamera = (props) => {
  const { position } = props;
  const [x, y, z] = position;
  const ref = useRef();
  const set = useThree((state) => state.set);
  const size = useThree((state) => state.size);

  useLayoutEffect(() => {
    ref.current.position.set(x, y, z);
    // console.log(ref.current.position);
    ref.current.aspect = size.width / size.height;
    ref.current.updateMatrixWorld();
    ref.current.updateProjectionMatrix();
    set({ camera: ref.current });
  }, [position, size]);

  return <perspectiveCamera ref={ref} {...props} />;
};

const viewPoints = {
  left: [-50, 25, 0],
  right: [50, 25, 0],
  front: [0, 25, 50]
};

const Lights = () => {
  const pixels = 256;
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[0, 40, 0]}
        intensity={0.25}
        castShadow
        shadow-mapSize-height={pixels}
        shadow-mapSize-width={pixels}
        shadow-radius={5}
        shadow-camera-left={20}
        shadow-camera-right={-20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </>
  );
};

const Plane = () => {
  return (
    <group name="Plane">
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeBufferGeometry attach="geometry" args={[50, 50, 10, 10]} />
        <meshStandardMaterial attach="material" color={"yellow"} />
      </mesh>
    </group>
  );
};

const Cube = (props) => {
  const { color, position, viewpoint } = props;
  const setCamPosition = useStore((state) => state.setCamPosition);
  const setTarget = useStore((state) => state.setTarget);
  const handleClick = (e) => {
    e.stopPropagation();
    const { x, y, z } = e.point;
    setCamPosition(viewpoint);
    setTarget([x, y, z]);
  };

  return (
    <group name={`${color} cube`} position={position}>
      <mesh castShadow onClick={(e) => handleClick(e)}>
        <boxBufferGeometry attach="geometry" args={[3, 3, 3]} />
        <meshStandardMaterial attach="material" color={color} />
      </mesh>
    </group>
  );
};

export default function App() {
  const camPosition = useStore((state) => state.camPosition);
  const target = useStore((state) => state.target);
  return (
    <>
      <Canvas
        shadows
        camera={{
          position: [0, 25, 50],
          fov: 35
        }}
      >
        <Lights />
        <Plane />
        <Cube
          color="crimson"
          position={[0, 0, 0]}
          viewpoint={viewPoints.front}
        />
        <Cube
          color="darkslategray"
          position={[-6, 0, 0]}
          viewpoint={viewPoints.left}
        />
        <Cube
          color="steelblue"
          position={[6, 0, 0]}
          viewpoint={viewPoints.right}
        />

        <OrbitControls target={target} />
        <CustomCamera position={camPosition} />
      </Canvas>
    </>
  );
}
