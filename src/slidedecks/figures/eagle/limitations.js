import * as d3 from "d3";

const innerHTMLContent = `

<div class="container-lg">
    <div class="row">
        <div class="col p-0 m-0">
            <div id="figure"></div>
            <div class="text-danger text-center fw-bold">Not Good</div>
        </div>
        <div class="col p-0 m-0">
            <div id="figure2"></div>
            <div class="text-success text-center fw-bold">Better !</div>
        </div>
    </div>
</div>
`

export function create(container, context) {
    container.innerHTML = innerHTMLContent;
    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        width: 270,
        height: 140
    }
    const dt = 0.01;

    const svg = d3.select("#figure")
        .append("svg")
        .attr("viewBox", `0 0 ${margin.width} ${margin.height}`)
        .attr("width", '100%')
        .attr("height", '100%')
        // .style("background-color", "red")
        // .style("border", "1px solid black")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

    const svg2 = d3.select("#figure2")
        .append("svg")
        .attr("viewBox", `0 0 ${margin.width} ${margin.height}`)
        .attr("width", '100%')
        .attr("height", '100%')
        // .style("background-color", "red")
        // .style("border", "1px solid black")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

    const defs = svg.append("svg:defs");
    const defs2 = svg.append("svg:defs");

    // Arrow head definition
    defs.append("svg:marker")
        .attr("id", "arrowhead")
        .attr("refX", 3)
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z")
        .style("fill", "black")
    defs2.append("svg:marker")
        .attr("id", "arrowhead")
        .attr("refX", 3)
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z")
        .style("fill", "black")


    const ymid = (margin.height - margin.top - margin.bottom) / 2 + margin.top;

    [svg, svg2].forEach(svg => {
        svg.append("line")
            .attr("x1", margin.left)
            .attr("y1", ymid)
            .attr("x2", margin.width - margin.right)
            .attr("y2", ymid)
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("stroke-dasharray", "5,5");

        svg.append("text")
            .attr("x", margin.left)
            .attr("y", ymid + ymid / 2)
            .attr("text-anchor", "start")
            .attr("font-size", "1em")
            .text("Physics:")
            .style("fill", "var(--bs-primary)")
            .attr("alignment-baseline", "middle");

        svg.append("text")
            .attr("x", margin.left)
            .attr("y", ymid - ymid / 2)
            .attr("text-anchor", "start")
            .attr("font-size", "1em")
            .text("Latent:")
            .style("fill", "var(--bs-success)")
            .attr("alignment-baseline", "middle");
    });

    const numSteps = 5
    let xStart = margin.left + 80
    let xEnd = margin.width - margin.right;
    let xStep = (xEnd - xStart) / (numSteps);
    const radius = 10;

    let arrows1 = []
    let arrows2 = []
    let arrows2bis = []
    for (let i = 0; i < numSteps; i++) {
        const xPhy = xStart + i * xStep;
        const yPhy = ymid + ymid / 2;

        const xLat = xStart + (i + 0.5) * xStep;
        const yLat = ymid - ymid / 2;

        [svg, svg2].forEach(svg => {
            svg.append("circle")
                .attr("cx", xPhy)
                .attr("cy", yPhy)
                .attr("r", radius)
                .style("fill", "var(--bs-primary)")

            svg.append("circle")
                .attr("cx", xLat)
                .attr("cy", yLat)
                .attr("r", radius)
                .style("fill", "var(--bs-success)")
        })

        const angle = Math.atan2(yPhy - yLat, xLat - xPhy);

        arrows1.push(svg.append("line")
            .attr("x1", xPhy + radius * Math.cos(angle))
            .attr("y1", yPhy - radius * Math.sin(angle))
            .attr("x2", xLat + radius * Math.cos(angle + Math.PI))
            .attr("y2", yLat - radius * Math.sin(angle + Math.PI))
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0)
            .attr("marker-end", "url(#arrowhead)"));

        if (i === 0) {
            arrows2.push(
                svg2.append("line")
                    .attr("x1", xPhy + radius * Math.cos(angle))
                    .attr("y1", yPhy - radius * Math.sin(angle))
                    .attr("x2", xLat + radius * Math.cos(angle + Math.PI))
                    .attr("y2", yLat - radius * Math.sin(angle + Math.PI))
                    .attr("stroke", "black")
                    .attr("stroke-width", 1.5)
                    .attr("opacity", 0)
                    .attr("marker-end", "url(#arrowhead)"));
        }

        arrows1.push(svg.append("line")
            .attr("x1", xLat - radius * Math.cos(angle + Math.PI))
            .attr("y1", yLat - radius * Math.sin(angle + Math.PI))
            .attr("x2", xPhy - radius * Math.cos(angle) + xStep)
            .attr("y2", yPhy - radius * Math.sin(angle))
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0)
            .attr("marker-end", "url(#arrowhead)"));

        arrows2bis.push(svg2.append("line")
            .attr("x1", xLat - radius * Math.cos(angle + Math.PI))
            .attr("y1", yLat - radius * Math.sin(angle + Math.PI))
            .attr("x2", xPhy - radius * Math.cos(angle) + xStep)
            .attr("y2", yPhy - radius * Math.sin(angle))
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0)
            .attr("marker-end", "url(#arrowhead)"));

        arrows2.push(svg2.append("line")
            .attr("x1", xLat + radius)
            .attr("y1", yLat)
            .attr("x2", xLat + xStep - radius)
            .attr("y2", yLat)
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0)
            .attr("marker-end", "url(#arrowhead)"))
        ;
    }

    // Merge arrows1 and arrows2
    arrows2bis.forEach(d => {
        arrows2.push(d);
    })
    // --- timing helpers ---
    let runId = 0;                 // increments to cancel old loops
    let timeouts = [];             // store timeout handles so we can stop them

    function clearAllTimeouts() {
        timeouts.forEach(t => t.stop?.()); // d3.timeout has .stop()
        timeouts = [];
    }

    function interruptAllTransitions() {
        // Interrupt any ongoing transitions so their "end" handlers don't keep chaining
        arrows1.forEach(sel => sel.interrupt());
        arrows2.forEach(sel => sel.interrupt());
    }

    function hideAll(arrows) {
        arrows.forEach(sel => sel.attr("opacity", 0));
    }

    function schedule(delayMs, fn) {
        const t = d3.timeout(fn, delayMs);
        timeouts.push(t);
        return t;
    }

    function startArrowLoop(arrows, { stepMs, loopDelayMs, startDelayMs = 0 }, token) {
        if (!arrows.length) return;

        function step(i) {
            if (token !== runId) return; // canceled

            if (i >= arrows.length) {
                // loop: pause, hide, restart
                schedule(loopDelayMs, () => {
                    if (token !== runId) return;
                    hideAll(arrows);
                    step(0);
                });
                return;
            }

            arrows[i]
                .interrupt()
                .transition()
                .duration(stepMs)
                .attr("opacity", 1)
                .on("end", () => step(i + 1));
        }

        schedule(startDelayMs, () => {
            if (token !== runId) return;
            hideAll(arrows);
            step(0);
        });
    }

    return {
        steps: [],
        onSlideEnter: () => {
            runId += 1;
            const token = runId;

            // start loop 1 immediately
            startArrowLoop(arrows1, { stepMs: 300, loopDelayMs: 1000, startDelayMs: 0 }, token);

            // start loop 2 after 2 seconds
            startArrowLoop(arrows2, { stepMs: 300, loopDelayMs: 2000, startDelayMs: 2000 }, token);
        },
        onSlideLeave: () => {
            // cancel all pending callbacks and stop animations immediately
            runId += 1;
            clearAllTimeouts();
            interruptAllTransitions();
            // optional: hide on leave so it doesn't freeze mid-animation
            hideAll(arrows1);
            hideAll(arrows2);
        }
    };
}
