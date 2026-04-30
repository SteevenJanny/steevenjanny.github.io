import * as THREE from 'three';

let scene, camera, renderer;
const particles = [];
const trails = [];

const PARTICLE_COUNT = 50;
const TRAIL_LENGTH = 200;

export function create(container, context) {
    const WIDTH = container.clientWidth * 0.9;
    const HEIGHT = 150
    // Lorenz parameters
    const sigma = 10;
    const rho = 28;
    const beta = 8 / 3;
    const dt = 0.01;

    init();

    function init() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        camera = new THREE.PerspectiveCamera(
            45,
            WIDTH / HEIGHT,
            0.1,
            1000
        );
        camera.position.set(0, 0, 90);

        renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize(WIDTH, HEIGHT);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        const light = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(light);

        createParticles();
    }

    function createParticles() {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const pos = new THREE.Vector3(
                Math.random() * 5,
                Math.random() * 5,
                Math.random() * 5
            );

            particles.push(pos);

            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(TRAIL_LENGTH * 3);
            const colors = new Float32Array(TRAIL_LENGTH * 4);

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));

            const material = new THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: false,
                blending: THREE.NormalBlending,
            });

            const line = new THREE.Line(geometry, material);
            scene.add(line);

            trails.push({
                geometry,
                positions,
                colors,
                index: 0,
                hue: i / PARTICLE_COUNT,
            });
        }
    }

    function stepLorenz(p) {
        const dx = sigma * (p.y - p.x);
        const dy = p.x * (rho - p.z) - p.y;
        const dz = p.x * p.y - beta * p.z;

        p.x += dx * dt;
        p.y += dy * dt;
        p.z += dz * dt;
    }

    let animationRunning = true;

    function animate() {
        if (!animationRunning) return;
        requestAnimationFrame(animate);

        particles.forEach((p, i) => {
            stepLorenz(p);

            const trail = trails[i];

            // Shift positions to create a trailing effect
            trail.positions.copyWithin(0, 3);

            // const idx = trail.index % TRAIL_LENGTH;
            const idx = TRAIL_LENGTH - 1;
            trail.positions[idx * 3] = p.x;
            trail.positions[idx * 3 + 1] = p.y;
            trail.positions[idx * 3 + 2] = p.z;

            // Fade alpha from head → tail
            for (let j = 0; j < TRAIL_LENGTH; j++) {
                const a = j / TRAIL_LENGTH;
                const color = new THREE.Color().setHSL(trail.hue, 0.7, 0.45);

                trail.colors[j * 4] = color.r;
                trail.colors[j * 4 + 1] = color.g;
                trail.colors[j * 4 + 2] = color.b;
                trail.colors[j * 4 + 3] = a * 0.8;
            }

            // ✅ Draw only valid contiguous points
            trail.geometry.setDrawRange(0, Math.min(trail.index, TRAIL_LENGTH));

            trail.geometry.attributes.position.needsUpdate = true;
            trail.geometry.attributes.color.needsUpdate = true;

            trail.index++;
        });

        camera.position.x = Math.sin(Date.now() * 0.0002) * 70;
        camera.position.z = Math.cos(Date.now() * 0.0002) * 70;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
    }


    return {
        steps: [],
        onSlideEnter: () => {
            animationRunning = true;
            animate();

        },
        onSlideLeave: () => {
            animationRunning = false;
        },
    }
}
