import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export function create(container, context) {
    // 1. Setup Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const WIDTH = 250;
    const HEIGHT = 250;
    const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
    camera.position.set(16, 5, 8);
    camera.rotation.set(-0.95, 0.77, 0.77);

    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(WIDTH, HEIGHT);
    container.appendChild(renderer.domElement);

    // 2. Add Axes & Grid
    const grid = new THREE.GridHelper(20, 20, 0xcccccc, 0xeeeeee);
    grid.position.y = -14; // Slightly below the plane to avoid flickering
    scene.add(grid);

    // 2. Add OrbitControls (Mouse Interaction)
    const controls = new OrbitControls(camera, renderer.domElement);


    // 3. Simple Noise Function (Pseudo-Perlin)
    // This simulates smooth hills by layering sine waves at different frequencies
    function smoothNoise(x, z) {
        let val = Math.sin(x * 0.2) * Math.cos(z * 1.9);
        val += Math.sin(x * 2.5 + z * 1.5) * 0.5;
        val += Math.sin(x * 5.0) * Math.cos(z * 5.0) * 0.2;
        return val * 0.25; // Scale down the overall bumpiness
    }

    // 3. Create the Surface Geometry
    const size = 20;
    const segments = 500;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

    // Rotate geometry to lie flat initially
    geometry.rotateX(-Math.PI / 2);

    // 4. Manipulate Vertices to create the "Drop"
    const position = geometry.attributes.position;
    const dropDepth = -14.0;      // Reduced height as requested
    for (let i = 0; i < position.count; i++) {
        let x = position.getX(i);
        let z = position.getZ(i); // This is the vertical axis after rotation

        // Gaussian function: Depth * e^(-dist^2 / spread)
        const distSq = x * x + z * z;
// Gaussian Well + Random Noise
        const well = dropDepth * Math.exp(-distSq);
        // Apply Smooth Noise
        const bumps = smoothNoise(x, z);

        position.setY(i, well + bumps);
    }
    geometry.computeVertexNormals();

    // 5. Material & Mesh
    const material = new THREE.MeshStandardMaterial({
        color: 0x5588ff,
        roughness: 0.4,
        metalness: 0.1,
        flatShading: false // Set to true if you want a "low-poly" look
    });
    const surface = new THREE.Mesh(geometry, material);
    scene.add(surface);

    // 6. Lighting
    const light = new THREE.DirectionalLight(0xffffff, 5);
    light.position.set(10, 20, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff));

    // 7. Animation Loop
    let isAnimating = true;

    function animate() {
        if (!isAnimating) return;
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    // Handle Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return {
        steps: [],
        onSlideEnter: () => {
            isAnimating = true;
            animate();
        },
        onSlideLeave: () => {
            isAnimating = false;
        },
    }
}
