import React, { useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { useGUI } from "./GUI";

const SceneObjects: React.FC = () => {
    const cylinderRef = useRef<THREE.Mesh | null>(null);
    const { camera } = useThree();

    useGUI(cylinderRef, camera);

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            <Cylinder 
                ref={cylinderRef} 
                args={[1, 1, 15, 32]} 
                position={[0, -4, 0]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <meshStandardMaterial color="#5f5959" />
            </Cylinder>

            <Environment preset="park" background />
        </>
    );
};

const Scene: React.FC = () => {
    return (
        <Canvas 
            camera={{ position: [0, -2, 5], fov: 75 }}
            style={{ width: "100vw", height: "100vh" }}
        >
            <SceneObjects />
        </Canvas>
    );
};

export default Scene;