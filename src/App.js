import React, {
  Suspense,
  useRef,
  useLayoutEffect,
  useEffect,
  useState
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import { Vector3 } from "three";
import create from "zustand";

const useStore = create((set, get) => ({
  camPosition: [0, 35, 55],
  setCamPosition: (camPosition) =>
    set((state) => ({ camPosition: camPosition })),
  target: [0, 0, 0],
  setTarget: (target) => set((state) => ({ target: target })),
  edit: false,
  setEdit: (edit) => set((state) => ({ edit: edit }))
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
        <planeBufferGeometry attach="geometry" args={[80, 80, 10, 10]} />
        <meshStandardMaterial attach="material" color={"yellow"} />
      </mesh>
    </group>
  );
};

const Cube = (props) => {
  const transform = useRef();
  const { color, position, viewpoint, rotation } = props;
  const setCamPosition = useStore((state) => state.setCamPosition);
  const setTarget = useStore((state) => state.setTarget);
  // const edit = useStore((state) => state.edit);
  // const setEdit = useStore(state => state.setEdit);
  const [edit, setEdit] = useState(false);
  const [click, setClick] = useState(0);
  const modes = ["translate", "rotate", "scale"];
  const [mode, setMode] = useState(modes[0]);

  const handleClick = (e) => {
    e.stopPropagation();
    //const { x, y, z } = e.point;
    //setCamPosition(viewpoint);
    //setTarget([x, y, z]);
    setEdit(!edit);
  };

  const cycleMode = (e) => {
    if (click === modes.length) {
      //setEdit(!edit)
      setClick(0);
    } else {
      setClick(() => click + 1);
      setMode(modes[click]);
      console.log(modes[click]);
    }
  };

  useEffect(() => {
    const controls = transform.current;
    controls.setMode(mode);
    controls.setSpace("local");
    controls.enabled = edit;
  });

  return (
    // <TransformControls ref={transform}>
    <group name={`${color} cube`}>
      <TransformControls
        enabled={edit}
        ref={transform}
        position={position}
        rotation={rotation}
      >
        <mesh
          castShadow
          onClick={(e) => handleClick(e)}
          onDoubleClick={cycleMode}
        >
          <boxBufferGeometry attach="geometry" args={[3, 3, 3]} />
          <meshStandardMaterial attach="material" color={color} />
        </mesh>
      </TransformControls>
    </group>
    // </TransformControls>
  );
};

export default function App() {
  const handleKeyDown = (e) => {
    if (e.key === 32) {
      console.log("espace");
    }
  };

  const camPosition = useStore((state) => state.camPosition);
  const target = useStore((state) => state.target);
  return (
    <>
      <Canvas
        onKeyDown={handleKeyDown}
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
          rotation={[0, 1, 0]}
          viewpoint={viewPoints.front}
        />
        <Cube
          color="darkslategray"
          position={[-6, 0, 0]}
          rotation={[0, Math.PI / 3, 0]}
          viewpoint={viewPoints.left}
        />
        <Cube
          color="steelblue"
          position={[6, 0, 8]}
          rotation={[0, Math.PI / 2, 0]}
          viewpoint={viewPoints.right}
        />

        <OrbitControls enabled={true} target={target} />
        <CustomCamera position={camPosition} />
      </Canvas>
    </>
  );
}
