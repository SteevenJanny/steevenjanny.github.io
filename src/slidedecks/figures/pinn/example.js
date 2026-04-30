import * as d3 from "d3";

import npyjs from 'npyjs';


const htmlContent = `
    <style>
        .figure-container {
            position: relative;
            width: 100%;
            height: 300px;
        }

        .figure-container canvas,
        .figure-container svg {
            position: absolute;
            top: 0;
            left: 0;
        }

        .figure-container svg {
            pointer-events: none;
        }
    </style>
<div class="row fs-5">
    <div class="col text-center">
        <p class="m-0 ">> solution</p>
        <div id="graph1_canvas"></div>

    </div>
    <div class="col text-center align-content-center">
        <p class="m-0">> loss function</p>
        <div id="graph1_loss"></div>
        <div class="col text-center align-content-center btn-group">
            <button id="togglePoints" class="btn btn-sm btn-light mt-2">Toggle training points</button>
            <button id="startTrain" class="btn btn-sm btn-light mt-2">Start Training</button>
        </div>
    </div>
</div>
<div class="row">
    <div class="col text-center">

    </div>

</div>
`


class PINNVisualizer {
    constructor(mainContainer, dataPath, lossPath, trainingPath, size = 200) {
        this.size = size;
        this.margin = {top: 10, right: 10, bottom: 40, left: 40};
        mainContainer.innerHTML = htmlContent;

        const container = mainContainer.querySelector("#graph1_canvas");
        container.classList.add("figure-container");
        this.container = d3.select(container);
        this.container_svg = d3.select(mainContainer.querySelector("#graph1_loss"));
        this.dataPath = dataPath;
        this.lossPath = lossPath;
        this.trainingPath = trainingPath;
        this.t = 0;
        this.drawTrainingPoints = false;
    }

    async init() {
        const npy = new npyjs();
        let trainingPoint;
        [this.array, this.lossArray, trainingPoint] = await Promise.all([
            npy.load(this.dataPath),
            npy.load(this.lossPath),
            npy.load(this.trainingPath)
        ]);

        let trainingPointsAtT = [];
        // Shape is [100, 2]
        const nTrainingPoints = trainingPoint.shape[0];
        for (let i = 0; i < nTrainingPoints; i++) {
            trainingPointsAtT.push({
                x: trainingPoint.data[i * 2 + 1],
                y: trainingPoint.data[i * 2]
            });
        }
        this.trainingPointsAtT = trainingPointsAtT;

        const [nt, nx, ny] = this.array.shape;
        this.nt = nt;
        this.nx = nx;
        this.ny = ny;

        this.setupScales();
        this.setupCanvas();
        this.setupSVG();
        this.setupLoss();
        this.draw(this.t);
    }

    setupScales() {
        // Shared logic for scales
        this.xScale = d3.scaleLinear().domain([-5, 5]).range([this.size - this.margin.bottom, this.margin.top]);
        this.tScale = d3.scaleLinear().domain([0, 1]).range([this.margin.left, this.size - this.margin.right]);

        const [min, max] = d3.extent(this.array.data);
        this.color = d3.scaleSequential(d3.interpolateViridis).domain([min, max]);
    }

    setupCanvas() {
        this.canvas = this.container.append("canvas")
            .attr("width", this.size).attr("height", this.size).node();
        this.ctx = this.canvas.getContext("2d");
        this.cellW = (this.size - this.margin.left - this.margin.right) / this.ny;
        this.cellH = (this.size - this.margin.top - this.margin.bottom) / this.nx;

    }

    setupSVG() {
        const svg = this.container.append("svg").attr("width", this.size).attr("height", this.size);
        svg.append("g").attr("transform", `translate(0,${this.size - this.margin.bottom})`).call(d3.axisBottom(this.tScale).ticks(5));
        svg.append("g").attr("transform", `translate(${this.margin.left},0)`).call(d3.axisLeft(this.xScale).ticks(5));

        // Axis labels
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", this.size / 2)
            .attr("y", this.size - 5)
            .text("Time (t)");
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.size / 2)
            .attr("y", 15)
            .text("Space (x)");

    }

    setupLoss() {
        const h = this.size / 2;
        this.svgLoss = this.container_svg.append("svg").attr("width", this.size).attr("height", h);

        const xL = d3.scaleLinear().domain([0, this.nt]).range([this.margin.left, this.size - this.margin.right]);
        const yL = d3.scaleLog().domain(d3.extent(this.lossArray.data)).range([h - this.margin.bottom, this.margin.top]);

        this.svgLoss.append("g").attr("transform", `translate(0,${h - this.margin.bottom})`).call(d3.axisBottom(xL).ticks(5));
        this.svgLoss.append("g").attr("transform", `translate(${this.margin.left},0)`).call(d3.axisLeft(yL).ticks(5));

        this.lossLine = d3.line().x((_, i) => xL(i)).y(d => yL(d));
        this.lossPathElement = this.svgLoss.append("path").attr("fill", "none").attr("stroke", "orange").attr("stroke-width", 2);
    }

    draw(t) {
        const {nx, ny, ctx, array, margin, cellW, cellH, color} = this;
        ctx.clearRect(0, 0, this.size, this.size);
        for (let i = 0; i < ny; i++) {
            for (let j = 0; j < nx; j++) {
                ctx.fillStyle = color(array.data[t * (nx * ny) + j * ny + i]);
                ctx.fillRect(margin.left + i * cellW, margin.top + j * cellH, cellW + 1, cellH + 1);
            }
        }
        this.lossPathElement.datum(this.lossArray.data.slice(0, t)).attr("d", this.lossLine);

        if (this.drawTrainingPoints) {

            ctx.fillStyle = "red";
            this.trainingPointsAtT.forEach(pt => {
                const xPos = margin.left + (pt.x) * (this.size - margin.left - margin.right);
                const yPos = margin.top + ((pt.y + 5) / 10) * (this.size - margin.top - margin.bottom);
                ctx.beginPath();
                ctx.arc(xPos, yPos, 2, 0, 2 * Math.PI);
                ctx.fill();
            });
        }
    }

    startAnimation() {
        if (this.interval) {
            this.interval.stop();
        }
        this.interval = d3.interval(() => {
            this.t = this.t + 1;
            if (this.t >= this.nt) {
                this.t = this.nt - 1;
                this.stopAnimation();
            }
            this.draw(this.t);
        }, 50);
    }

    stopAnimation() {
        if (this.interval) {
            this.interval.stop();
        }
    }
}

export function create(container, context) {


    const plot1 = new PINNVisualizer(
        container,
        "assets/pinns/intermediate_solutions.npy",
        "assets/pinns/loss.npy",
        "assets/pinns/training_points.npy",
        300
    );
    plot1.init();

    document.getElementById("togglePoints").onclick = function () {
        plot1.drawTrainingPoints = !plot1.drawTrainingPoints;
        plot1.draw(plot1.t); // redraw current frame
    }

    document.getElementById("startTrain").onclick = function () {
        plot1.t = 0; // reset time to 0
        plot1.startAnimation();
    }
    return {
        steps: [],
        onSlideEnter: () => {
        },
        onSlideLeave: () => {
            plot1.stopAnimation();
        },
    }
}
