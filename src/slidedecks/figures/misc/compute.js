import * as d3 from "d3";

const width = 500, height = 300;

const margin = {top: 50, right: 10, bottom: 50, left: 60, gap: 40};

export function create(container, context) {
    const svg = d3.select(container).append("svg")
        .attr("viewBox", [0, 0, width, height]);

    // const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);
    const yScale = d3.scaleBand().domain(["low", "medium", "high"]).range([height - margin.bottom, margin.top]);
    const xScale1 = d3.scaleBand().domain(["training", "inference"]).range([margin.left, width / 2 - margin.gap]);
    const xScale2 = d3.scaleBand().domain(["training", "inference"]).range([margin.gap + width / 2, width - margin.right]);

    // Draw axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale1))
        .selectAll("text")
        .attr("font-size", "14px")


    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScale2))
        .selectAll("text")
        .attr("font-size", "14px")


    svg.append("g")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("font-size", "14px")
        //Rotate 90
        .attr("text-anchor", "end")
        .attr("dy", "1em")
        .attr("transform", "rotate(45)");

    svg.append("g")
        .attr("transform", `translate(${width / 2 + margin.gap}, 0)`)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .attr("font-size", "14px")
        //Rotate 90
        .attr("text-anchor", "end")
        .attr("dy", "1em")
        .attr("transform", "rotate(45)");

    // Add titles
    svg.append("text")
        .attr("x", xScale1("training") + xScale1.bandwidth())
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        //.attr("fill", "#006EFF")
        .text("Physics-based sim.");

    svg.append("text")
        .attr("x", xScale2("training") + xScale2.bandwidth())
        .attr("text-anchor", "middle")
        .attr("y", margin.top / 2)
        .attr("font-size", "18px")
        //.attr("fill", "#03C15F")
        .text("ML-based sim.");

    // Add defs to round top corners of rect
    const BARWIDTH = 50
    const RADIUS = 10;
    const AMPLITUDE = 10;      // how much it moves
    const SPEED = 1;      // animation speed

    function roundedTopRect(x, y, width, height, radius) {
        return `
        M${x},${y + height}
        L${x},${y + radius}
        Q${x},${y} ${x + radius},${y}
        L${x + width - radius},${y}
        Q${x + width},${y} ${x + width},${y + radius}
        L${x + width},${y + height}
        Z
    `;
    }

    const callbacks = [];

    function createAnimatedBar(x, baseY, baseHeight, color, phase) {
        const bar = svg.append("path")
            .attr("fill", color);

        const callback = (elapsed) => {
            const delta = Math.sin(elapsed * SPEED + phase) * AMPLITUDE;
            const animatedHeight = baseHeight + delta;
            const animatedY = baseY - delta;
            const correctedHeight = baseHeight + animatedHeight;
            bar.attr("d", roundedTopRect(
                x,
                animatedY,
                BARWIDTH,
                correctedHeight,
                RADIUS
            ));
        };
        callbacks.push(callback);
    }

    let animationRunning = true;

    function animate() {
        if (!animationRunning) return;

        callbacks.forEach(cb => cb(performance.now() / 1000));
        requestAnimationFrame(animate);
    }

    createAnimatedBar(
        xScale1("training") + xScale1.bandwidth() / 2 - BARWIDTH / 2,
        yScale("low") + yScale.bandwidth() / 2,
        0.25 * yScale.bandwidth(),
        "#006EFF",
        0
    );

    createAnimatedBar(
        xScale1("inference") + xScale1.bandwidth() / 2 - BARWIDTH / 2,
        yScale("high") + yScale.bandwidth() / 2,
        1.25 * yScale.bandwidth(),
        "#006EFF",
        Math.PI / 2
    );

    createAnimatedBar(
        xScale2("training") + xScale2.bandwidth() / 2 - BARWIDTH / 2,
        yScale("high") + yScale.bandwidth() / 2,
        1.25 * yScale.bandwidth(),
        "#03C15F",
        Math.PI
    );

    createAnimatedBar(
        xScale2("inference") + xScale2.bandwidth() / 2 - BARWIDTH / 2,
        yScale("medium") + yScale.bandwidth(),
        0.5 * yScale.bandwidth(),
        "#03C15F",
        3 * Math.PI / 4
    );
    return {
        steps: [],
        onSlideEnter: () => {
            animationRunning = true;
            animate();
        },
        onSlideLeave: () => {
            animationRunning = false;
        }
    }
}
