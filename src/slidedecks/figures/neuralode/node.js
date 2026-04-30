import * as d3 from "d3";

const contentHTML = `
<div class="ms-5 btn-group bg-white" role="group" style="position:absolute; top:75px; left:0; z-index:10;">
     <button class="btn btn-outline-primary" id="simulate">1. Simulate</button>
     <button class="btn btn-outline-primary" id="update">2. Update</button>
     <button class="btn btn-outline-primary" id="loop">3. Loop</button>
 </div>
`;

export function create(container, context) {

    const canvas = document.createElement("canvas");
    container.innerHTML = contentHTML;
    container.appendChild(canvas);
    // canvas.style.display = "block";
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.scale(dpr, dpr);

    canvas.width = 800;
    canvas.height = 300;

    /* ============================
       WORLD ↔ SCREEN TRANSFORMS
    ============================ */
    const WORLD_MIN = -4;
    const WORLD_MAX = 4;

    function xScale(x) {
        return (x - WORLD_MIN) / (WORLD_MAX - WORLD_MIN) * canvas.width;
    }

    function yScale(y) {
        return canvas.height - (y - WORLD_MIN) / (WORLD_MAX - WORLD_MIN) * canvas.height;
    }


    function normalize(v) {
        const n = Math.hypot(v.x, v.y) + 1e-6;
        return {x: v.x / n, y: v.y / n};
    }

    /* ============================
       VECTOR FIELDS
    ============================ */
    function f(state) {
        const x = state.x;
        const y = state.y;
        return {
            x: y,
            y: -x + (1 - x * x) * y
        };
    }

    /* ============================
       RANDOM VECTOR FIELD (GRID)
    ============================ */
    const N_POINTS = 25;
    const gridStep = (WORLD_MAX - WORLD_MIN) / N_POINTS;
    const randomField = new Map();
    const trueField = new Map();

    function key(i, j) {
        return `${i},${j}`;
    }

    let maxNorm = 0;
    let minNorm = Infinity;
    for (let i = 0; i < N_POINTS; i++) {
        for (let j = 0; j < N_POINTS; j++) {
            const angle = Math.random() * Math.PI * 2;
            randomField.set(key(i, j), {
                x: Math.cos(angle),
                y: Math.sin(angle)
            });
            const x = f({
                x: WORLD_MIN + i * gridStep,
                y: WORLD_MIN + j * gridStep
            });
            const norm = Math.hypot(x.x, x.y);
            if (norm > maxNorm) maxNorm = norm;
            if (norm < minNorm) minNorm = norm;
            trueField.set(key(i, j), x);
        }
    }

    function randomVectorAt(x, y) {
        const i = Math.floor((x - WORLD_MIN) / gridStep);
        const j = Math.floor((y - WORLD_MIN) / gridStep);
        return randomField.get(key(i, j)) || {x: 0, y: 0};
    }

    function trueVectorAt(x, y) {
        const i = Math.floor((x - WORLD_MIN) / gridStep);
        const j = Math.floor((y - WORLD_MIN) / gridStep);
        return trueField.get(key(i, j)) || {x: 0, y: 0};
    }

    /* ============================
       PARTICLES
    ============================ */
    const N_PAIRS = 50;
    const PARTICLE_LIFETIME = 200;
    let globalLife = PARTICLE_LIFETIME;
    const LEARNING_RATE = 0.002;
    const pairs = [];


    function createPair() {
        const x = (Math.random() - 0.5) * 6;
        const y = (Math.random() - 0.5) * 6;

        return {
            life: PARTICLE_LIFETIME,
            maxLife: PARTICLE_LIFETIME,
            trueParticle: {x, y},
            randomParticle: {x, y},
            trueParticleHistory: [{x, y}],
            randomParticleHistory: [{x, y}]
        };
    }

    for (let i = 0; i < N_PAIRS; i++) {
        pairs.push(createPair());
    }

    function updateRandomField() {
        for (let i = 0; i < N_POINTS; i++) {
            for (let j = 0; j < N_POINTS; j++) {
                const x = WORLD_MIN + i * gridStep;
                const y = WORLD_MIN + j * gridStep;

                const trueVec = f({x, y});
                const randVec = randomField.get(key(i, j));

                randVec.x = (1 - LEARNING_RATE) * randVec.x + LEARNING_RATE * trueVec.x;
                randVec.y = (1 - LEARNING_RATE) * randVec.y + LEARNING_RATE * trueVec.y;

                // renormalize to keep arrows comparable
                const v = randVec;
                randVec.x = v.x;
                randVec.y = v.y;
            }
        }
    }

    /* ============================
       DRAWING
    ============================ */
    function drawAxes() {
        ctx.strokeStyle = "#555";
        ctx.lineWidth = 1;

        // x-axis
        ctx.beginPath();
        ctx.moveTo(xScale(-4), yScale(0));
        ctx.lineTo(xScale(4), yScale(0));
        ctx.stroke();

        // y-axis
        ctx.beginPath();
        ctx.moveTo(xScale(0), yScale(-4));
        ctx.lineTo(xScale(0), yScale(4));
        ctx.stroke();
    }

    function drawArrow(x1, y1, x2, y2, color = "#666") {
        const headLength = 6;
        const angle = Math.atan2(y2 - y1, x2 - x1);

        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        // Fill color for arrow head
        // ctx.fillStyle = color;
        ctx.lineWidth = 1;

        // shaft
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // arrow head
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - headLength * Math.cos(angle - Math.PI / 6),
            y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            x2 - headLength * Math.cos(angle + Math.PI / 6),
            y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.stroke();
        ctx.fill();    // ← fill the triangle
    }

    const gradientColor = d3.scaleSequential()
        .interpolator(d3.interpolateCool)
        .domain([0, 1]);

    function jetColorFromVector(v) {
        // const angle = Math.atan2(v.y, v.x); // [-π, π]
        // const t = (angle + Math.PI) / (2 * Math.PI); // [0,1]
        let norm = Math.hypot(v.x, v.y);
        return gradientColor(norm / maxNorm);
    }

    function drawRandomVectorField() {
        for (let i = 0; i < N_POINTS; i++) {
            for (let j = 0; j < N_POINTS; j++) {
                const x = WORLD_MIN + i * gridStep;
                const y = WORLD_MIN + j * gridStep;
                const vec = randomField.get(key(i, j));
                const v = normalize(vec);

                const norm = Math.hypot(v.x, v.y);

                drawArrow(
                    xScale(x),
                    yScale(y),
                    xScale(x + v.x * 0.3),
                    yScale(y + v.y * 0.3),
                    jetColorFromVector(vec)
                );
            }
        }
    }

    function drawTrace(history, color) {
        if (history.length < 2) return;

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        ctx.moveTo(
            xScale(history[0].x),
            yScale(history[0].y)
        );

        for (let i = 1; i < history.length; i++) {
            ctx.lineTo(
                xScale(history[i].x),
                yScale(history[i].y)
            );
        }

        ctx.stroke();
    }


    function drawParticles() {
        for (const pair of pairs) {
            const {trueParticleHistory, randomParticleHistory} = pair;

            // traces
            drawTrace(trueParticleHistory, "#006EFF");
            drawTrace(randomParticleHistory, "#f84121");

        }
    }

    /* ============================
       UPDATE
    ============================ */
    function update(dt) {
        if (!isRunning) return;

        globalLife--;

        // learn every frame
        if (shouldUpdateField) {
            updateRandomField();
        }
        if (globalLife < 0) {
            isRunning = false;
            return;
        }
        if (!shouldUpdatePairs) {
            return;
        }
        for (const pair of pairs) {
            const vTrue = trueVectorAt(pair.trueParticle.x, pair.trueParticle.y);
            const vRand = randomVectorAt(
                pair.randomParticle.x,
                pair.randomParticle.y
            );

            pair.trueParticle.x += vTrue.x * dt;
            pair.trueParticle.y += vTrue.y * dt;

            pair.randomParticle.x += vRand.x * dt;
            pair.randomParticle.y += vRand.y * dt;

            for (const p of [pair.trueParticle, pair.randomParticle]) {
                if (p.x < -4) p.x = -4;
                if (p.x > 4) p.x = 4;
                if (p.y < -4) p.y = -4;
                if (p.y > 4) p.y = 4;
            }

            pair.trueParticleHistory.push({
                x: pair.trueParticle.x,
                y: pair.trueParticle.y
            });
            pair.randomParticleHistory.push({
                x: pair.randomParticle.x,
                y: pair.randomParticle.y
            });
        }
    }


    /* ============================
       ANIMATION LOOP
    ============================ */
    let lastTime = 0;
    let isAnimating = false;

    function animate(time) {
        if (!isAnimating) {
            return;
        }
        const dt = (time - lastTime) * 0.001;
        lastTime = time;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawAxes();
        drawRandomVectorField();
        update(dt);
        drawParticles();
        if (globalLife <= 0) {
            globalLife = PARTICLE_LIFETIME;
            isRunning = !singleStep;
            if (!singleStep) {
                for (let i = 0; i < pairs.length; i++) {
                    pairs[i] = createPair();
                }

            }
        }

        requestAnimationFrame(animate);
    }

    let isRunning = false;
    let singleStep = false;
    let shouldUpdateField = false;
    let shouldUpdatePairs = false;

    const simulateBtn = document.getElementById("simulate");
    const updateBtn = document.getElementById("update");
    const loopBtn = document.getElementById("loop");


    simulateBtn.onclick = () => {
        for (let i = 0; i < pairs.length; i++) {
            pairs[i] = createPair();
        }
        shouldUpdateField = false;
        shouldUpdatePairs = true;
        isRunning = true;
        singleStep = true;
    };

    updateBtn.onclick = () => {
        shouldUpdateField = true;
        shouldUpdatePairs = false;
        isRunning = true;
        singleStep = true;
    }

    loopBtn.onclick = () => {
        for (let i = 0; i < pairs.length; i++) {
            pairs[i] = createPair();
        }
        isRunning = !isRunning;
        singleStep = false;
        shouldUpdatePairs = true;
        shouldUpdateField = true;
    };
    return {
        steps: [], onSlideEnter: () => {
            isAnimating = true;
            requestAnimationFrame(animate);
        }, onSlideLeave: () => {
            isAnimating = false;
        }
    };
}
