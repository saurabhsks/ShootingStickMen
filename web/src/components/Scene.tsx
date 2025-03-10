import React, { useRef, useState, useEffect } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Environment, Cylinder, Box } from "@react-three/drei";
import * as THREE from "three";
import { useMouseFollow } from "../hooks/mousefollow";
import { View, Text, StyleSheet } from 'react-native';

const SceneObjects: React.FC<{ onBoxClick: () => void }> = ({ onBoxClick }) => {
    const cylinderRef = useRef<THREE.Mesh | null>(null);
    const { camera } = useThree();

    const [boxes, setBoxes] = useState<{ id: number, position: [number, number, number] }[]>([]);
    
    const manTexture = useLoader(THREE.TextureLoader, "/images/man.jpeg");

    useMouseFollow(cylinderRef, camera);

    useEffect(() => {
        const interval = setInterval(() => {
            setBoxes(prevBoxes => [
                ...prevBoxes,
                { id: Date.now(), position: [Math.random() * 20 - 10, 0, Math.random() * -10] }
            ]);
        }, 1000); // Spawn a new box every second

        return () => clearInterval(interval);
    }, []);

    const handleBoxClick = (id: number) => {
        setBoxes(prevBoxes => prevBoxes.filter(box => box.id !== id));
        onBoxClick();
    };

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            {/* Gun Cylinder */}
            <Cylinder 
                ref={cylinderRef} 
                args={[0.125, 0.125, 5, 32]} 
                position={[0, -4, 1]}
                rotation={[Math.PI / 2, 0, 0]}
            >
                <meshStandardMaterial color="#5f5959" />
            </Cylinder>

            {boxes.map(box => (
                <Box 
                    key={box.id}
                    args={[1.5, 4, 0.5]}
                    position={box.position}
                    onClick={() => handleBoxClick(box.id)}
                >
                    <meshStandardMaterial 
                        map={manTexture} 
                    />
                </Box>
            ))}
            
            <Environment preset="park" background />
        </>
    );
};

const Scene: React.FC = () => {
    const [score, setScore] = useState(0);

    const incrementScore = () => {
        setScore(prevScore => prevScore + 1);
    };

    return (
        <>
            <Canvas 
                camera={{ position: [0, -2, 5], fov: 75 }}
                style={{ width: "100vw", height: "100vh" }}
            >
                <SceneObjects onBoxClick={incrementScore} />
            </Canvas>
            <div style={styles.score}>Score: {score}</div>
        </>
    );
};

const styles = StyleSheet.create({
    score: {
        position: 'absolute',
        top: 10,
        right: 10,
        color: 'white',
        fontSize: 24,
    },
});

export default Scene;