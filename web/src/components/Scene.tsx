import React, { useRef, useEffect } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { Environment, Cylinder, Box } from "@react-three/drei";
import * as THREE from "three";
import { useGUI } from "./GUI";

const SceneObjects: React.FC = () => {
    const cylinderRef = useRef<THREE.Mesh | null>(null);
    const centerBoxRef = useRef<THREE.Mesh | null>(null);
    const leftBoxRef = useRef<THREE.Mesh | null>(null);
    const rightBoxRef = useRef<THREE.Mesh | null>(null);
    const { camera } = useThree();

    useGUI(cylinderRef, centerBoxRef, camera);

    const manTexture = useLoader(THREE.TextureLoader, "/images/man.jpeg");

    // Animation logic
    useFrame((state, delta) => {
        // Center man movement
        if (centerBoxRef.current) {
            centerBoxRef.current.position.z += delta * 3; // Slower speed
            if (centerBoxRef.current.position.z >= 5) { // Hide when past camera
                centerBoxRef.current.visible = false;
            }
        }

        // Left man movement
        if (leftBoxRef.current) {
            // Move diagonally towards center
            leftBoxRef.current.position.z += delta * 3;
            leftBoxRef.current.position.x += delta * 2;
            
            if (leftBoxRef.current.position.z >= 5) {
                leftBoxRef.current.visible = false;
            }
        }

        // Right man movement
        if (rightBoxRef.current) {
            // Move diagonally towards center
            rightBoxRef.current.position.z += delta * 3;
            rightBoxRef.current.position.x -= delta * 2;
            
            if (rightBoxRef.current.position.z >= 5) {
                rightBoxRef.current.visible = false;
            }
        }
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Gun Cylinder */}
            <Cylinder 
                ref={cylinderRef} 
                args={[1, 1, 15, 32]} 
                position={[0, -4, 0]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <meshStandardMaterial color="#5f5959" />
            </Cylinder>

            {/* Center Man */}
            <Box 
                ref={centerBoxRef}
                args={[1.5, 4, 0.5]}
                position={[0, 0, -15]}
            >
                <meshStandardMaterial 
                    map={manTexture} 
                />
            </Box>

            {/* Left Man */}
            <Box 
                ref={leftBoxRef}
                args={[1.5, 4, 0.5]}
                position={[-10, 0, -15]}
            >
                <meshStandardMaterial 
                    map={manTexture} 
                />
            </Box>

            {/* Right Man */}
            <Box 
                ref={rightBoxRef}
                args={[1.5, 4, 0.5]}
                position={[10, 0, -15]}
            >
                <meshStandardMaterial 
                    map={manTexture} 
                />
            </Box>

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