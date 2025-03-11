import React, { useRef, useState, useEffect } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { Environment, Cylinder, Box, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { useMouseFollow } from "../hooks/mousefollow";

interface BloodParticle {
    id: number;
    position: [number, number, number];
    velocity: [number, number, number];
}

interface Bullet {
    id: number;
    position: [number, number, number];
    direction: [number, number, number];
    createdAt: number;
}

const SceneObjects: React.FC<{ onBoxClick: () => void, onGameOver: () => void }> = ({ onBoxClick, onGameOver }) => {
    const cylinderRef = useRef<THREE.Mesh | null>(null);
    const { camera } = useThree();

    const [boxes, setBoxes] = useState<{ id: number, position: [number, number, number] }[]>([]);
    const [bloodParticles, setBloodParticles] = useState<BloodParticle[]>([]);
    const [bullets, setBullets] = useState<Bullet[]>([]);

    const manTexture = useLoader(THREE.TextureLoader, "/images/man.jpeg");

    useMouseFollow(cylinderRef, camera);

    // Handle bullet shooting
    const handleShoot = () => {
        if (cylinderRef.current) {
            const gunTip = new THREE.Vector3(0, -4, 1);  // Gun position
            const direction = new THREE.Vector3();

            // Get direction from gun to mouse (using camera's forward direction)
            direction.copy(camera.getWorldDirection(new THREE.Vector3()));
            direction.normalize();

            setBullets(prev => [...prev, {
                id: Date.now(),
                position: [gunTip.x, gunTip.y, gunTip.z],
                direction: [direction.x, direction.y, direction.z],
                createdAt: Date.now()
            }]);
        }
    };

    // Update bullets and check collisions
    useFrame(() => {
        setBullets(prevBullets => {
            const currentTime = Date.now();
            const bulletSpeed = 0.5;

            return prevBullets
                .map(bullet => {
                    // Update bullet position
                    const newPosition: [number, number, number] = [
                        bullet.position[0] + bullet.direction[0] * bulletSpeed,
                        bullet.position[1] + bullet.direction[1] * bulletSpeed,
                        bullet.position[2] + bullet.direction[2] * bulletSpeed
                    ];

                    // Check collision with boxes
                    const hitBox = boxes.find(box => {
                        const distance = Math.sqrt(
                            Math.pow(newPosition[0] - box.position[0], 2) +
                            Math.pow(newPosition[1] - box.position[1], 2) +
                            Math.pow(newPosition[2] - box.position[2], 2)
                        );
                        return distance < 2; // Collision threshold
                    });

                    if (hitBox) {
                        // Handle hit
                        handleBoxClick(hitBox.id, hitBox.position);
                        return null; // Remove bullet
                    }

                    // Check if bullet is too old (2 seconds)
                    if (currentTime - bullet.createdAt > 2000) {
                        return null;
                    }

                    return {
                        ...bullet,
                        position: newPosition
                    };
                })
                .filter(Boolean) as Bullet[];
        });
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setBoxes(prevBoxes => {
                if (prevBoxes.length >= 10) {
                    onGameOver();
                    return prevBoxes;
                }
                return [
                    ...prevBoxes,
                    { id: Date.now(), position: [Math.random() * 20 - 10, 0, Math.random() * -10] }
                ];
            });
        }, 1000);

        // Add click event listener for shooting
        const handleClick = (event: MouseEvent) => {
            if (!isGameOver) {
                handleShoot();
            }
        };
        window.addEventListener('click', handleClick);

        return () => {
            clearInterval(interval);
            window.removeEventListener('click', handleClick);
        };
    }, [onGameOver]);

    // Update blood particles
    useEffect(() => {
        let animationFrameId: number;

        const updateParticles = () => {
            setBloodParticles(prevParticles => {
                const gravity = -0.05;
                return prevParticles
                    .map(particle => ({
                        ...particle,
                        position: [
                            particle.position[0] + particle.velocity[0],
                            particle.position[1] + particle.velocity[1],
                            particle.position[2] + particle.velocity[2]
                        ] as [number, number, number],
                        velocity: [
                            particle.velocity[0] * 0.98,
                            particle.velocity[1] + gravity,
                            particle.velocity[2] * 0.98
                        ] as [number, number, number]
                    }))
                    .filter(particle => particle.position[1] > -10);
            });
            animationFrameId = requestAnimationFrame(updateParticles);
        };

        animationFrameId = requestAnimationFrame(updateParticles);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const createBloodEffect = (position: [number, number, number]) => {
        const numParticles = 20;
        const newParticles: BloodParticle[] = [];

        for (let i = 0; i < numParticles; i++) {
            const angle = (Math.random() * Math.PI * 2);
            const speed = Math.random() * 0.3 + 0.1;
            const upwardSpeed = Math.random() * 0.2 + 0.1;

            newParticles.push({
                id: Date.now() + i,
                position: [...position] as [number, number, number],
                velocity: [
                    Math.cos(angle) * speed,
                    upwardSpeed,
                    Math.sin(angle) * speed
                ] as [number, number, number]
            });
        }

        setBloodParticles(prev => [...prev, ...newParticles]);
    };

    const handleBoxClick = (id: number, position: [number, number, number]) => {
        createBloodEffect(position);
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

            {/* Bullets */}
            {bullets.map(bullet => (
                <Sphere
                    key={bullet.id}
                    args={[0.1]} // Small bullet size
                    position={bullet.position}
                >
                    <meshStandardMaterial
                        color="#FFD700"
                        emissive="#FFA500"
                        emissiveIntensity={0.5}
                    />
                </Sphere>
            ))}

            {boxes.map(box => (
                <Box
                    key={box.id}
                    args={[1.5, 4, 0.5]}
                    position={box.position}
                    onClick={() => handleBoxClick(box.id, box.position)}
                >
                    <meshStandardMaterial
                        map={manTexture}
                    />
                </Box>
            ))}

            {/* Blood Particles */}
            {bloodParticles.map(particle => (
                <Sphere
                    key={particle.id}
                    args={[0.1]}
                    position={particle.position}
                >
                    <meshStandardMaterial
                        color="#8B0000"
                        emissive="#310000"
                        emissiveIntensity={0.5}
                    />
                </Sphere>
            ))}

            <Environment preset="park" background />
        </>
    );
};

const Scene: React.FC = () => {
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    const incrementScore = () => {
        if (!isGameOver) {
            setScore(prevScore => prevScore + 1);
        }
    };

    const handleGameOver = () => {
        setIsGameOver(true);
    };

    const restartGame = () => {
        // setScore(0);
        // setIsGameOver(false);
        window.location.reload();
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
            <Canvas
                camera={{ position: [0, -2, 5], fov: 75 }}
                style={{ width: '100%', height: '100%' }}
            >
                <SceneObjects onBoxClick={incrementScore} onGameOver={handleGameOver} />
            </Canvas>
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                color: 'white',
                fontSize: '24px'
            }}>
                Score: {score}
            </div>
            {isGameOver && (
                <div style={{
                    position: 'absolute',
                    zIndex: 1000,
                    top: '0',
                    left: '0',
                    // transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: '20px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    color: 'white',
                    height: '100vh',
                    width: '100vw'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
                            Game Over!
                        </div>
                        <div style={{ fontSize: '24px', marginBottom: '20px' }}>
                            Final Score: {score}
                        </div>
                        <button
                            onClick={restartGame}
                            style={{
                                backgroundColor: '#4CAF50',
                                border: 'none',
                                color: 'white',
                                padding: '15px 32px',
                                textAlign: 'center',
                                textDecoration: 'none',
                                display: 'inline-block',
                                fontSize: '16px',
                                margin: '4px 2px',
                                cursor: 'pointer',
                                borderRadius: '5px'
                            }}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scene;