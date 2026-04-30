import * as d3 from "d3";

const width = 400, height = 230;

const margin = {top: 10, right: 20, bottom: 10, left: 20};
const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

export function create(container, context) {
    const svg = d3.select(container).append("svg")
        // .style("border", "1px solid red")
        .attr("viewBox", [0, 0, width, height]);

    const arrow_size = 6;
    const marker = svg.append("defs").append("marker")
        .attr("id", "arrowhead_rk4")
        .attr("markerWidth", arrow_size)
        .attr("markerHeight", arrow_size)
        .attr("refX", arrow_size)
        .attr("refY", arrow_size / 2)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 L " + arrow_size + "," + (arrow_size / 2) + " L 0," + arrow_size + " Z")
        .attr("fill", "#C0C0C0");


    const NSteps = 4;
    const STEP_LEN = 1.0 / (NSteps - 1);
    // Draw NSteps vertical bar indicating steps
    for (let i = 0; i <= NSteps; i++) {
        svg.append("line")
            .attr("x1", xScale(i * STEP_LEN))
            .attr("y1", yScale(0))
            .attr("x2", xScale(i * STEP_LEN))
            .attr("y2", yScale(1))
            .attr("stroke", "#CCCCCC")
            .attr("stroke-width", 1);
    }

    // Draw four boxes stacked vertically between steps
    const BOX_HEIGHT = (yScale(0) - yScale(1)) / 6 - 10;
    const BOX_WIDTH = (xScale(STEP_LEN) - xScale(0)) * 0.3;
    const GAP = 5
    const stepGroups = [svg.append("g").attr("id", "step-0")];
    for (let i = 0; i < NSteps - 1; i++) {
        const group = svg.append("g").attr("id", `step-${i + 1}`);
        for (let j = 0; j < 4; j++) {
            group.append("rect")
                .attr("x", xScale((i + 0.5) * STEP_LEN) - BOX_WIDTH / 2)
                .attr("y", yScale(0.5) - BOX_HEIGHT / 2 - (j - 1.5) * (BOX_HEIGHT + GAP))
                .attr("width", BOX_WIDTH)
                .attr("height", BOX_HEIGHT)
                .attr("fill", "#D5EFDA")
                .attr("rx", 5)
            // Add text inside the box
            group.append("foreignObject")
                .attr("x", xScale((i + 0.5) * STEP_LEN) - BOX_WIDTH / 2)
                .attr("y", yScale(0.5) - BOX_HEIGHT / 2 - (j - 1.5) * (BOX_HEIGHT + GAP))
                .attr("width", BOX_WIDTH)
                .attr("height", BOX_HEIGHT)
                .append("xhtml:div")
                .style("width", BOX_WIDTH + "px")
                .style("height", BOX_HEIGHT + "px")
                .style("display", "flex")
                .style("justify-content", "center")
                .style("align-items", "center")
                .style("font-size", "12px")
                .style("color", "#333333")
                .html(`$f_\\theta$`);
        }
        stepGroups.push(group);
    }

    // Add s_(t+i) at the end of each step
    for (let i = 0; i <= NSteps - 1; i++) {
        stepGroups[i].append("foreignObject")
            .attr("x", xScale(i * STEP_LEN) - BOX_WIDTH / 2)
            .attr("y", yScale(0.5) - BOX_HEIGHT / 2)
            .attr("width", BOX_WIDTH)
            .attr("height", BOX_HEIGHT)
            .append("xhtml:div")
            .style("width", BOX_WIDTH + "px")
            .style("height", BOX_HEIGHT + "px")
            .style("display", "flex")
            .style("justify-content", "center")
            .style("align-items", "center")
            .style("font-size", "13px")
            .style("color", "#333333")
            .html(`$\\mathbf{s}_{t+${i + 1}}$`);
    }

    // Draw arrows from each box to the next step
    for (let i = 0; i < NSteps - 1; i++) {
        for (let j = 0; j < 4; j++) {
            stepGroups[i + 1].append("line")
                .attr("x1", xScale(i * STEP_LEN))
                .attr("y1", yScale(0.5) + ((j > 1) ? -10 : 10))
                .attr("x2", xScale((i + 0.5) * STEP_LEN) - BOX_WIDTH / 2)
                .attr("y2", yScale(0.5) - BOX_HEIGHT / 2 - (j - 1.5) * (BOX_HEIGHT + GAP) + BOX_HEIGHT / 2)
                .attr("stroke", "#C0C0C0")
                .attr("stroke-width", 1.5)
                .attr("marker-end", "url(#arrowhead_rk4)");
            if (i > 3) {
                break;
            }

            stepGroups[i + 1].append("line")
                .attr("x1", xScale((i + 0.5) * STEP_LEN) + BOX_WIDTH / 2)
                .attr("y1", yScale(0.5) - BOX_HEIGHT / 2 - (j - 1.5) * (BOX_HEIGHT + GAP) + BOX_HEIGHT / 2)
                .attr("x2", xScale((i + 1) * STEP_LEN))
                .attr("y2", yScale(0.5) + ((j > 1) ? -10 : 10))
                .attr("stroke", "#C0C0C0")
                .attr("stroke-width", 1.5)
                .attr("marker-end", "url(#arrowhead_rk4)");
        }
    }

    let isAnimating = true;
    let currentStep = 0;
    const animate = () => {
        if (!isAnimating) return;
        stepGroups.forEach((group, index) => {
            group.selectAll("line")
                .transition()
                .duration(500)
                .attr("opacity", index <= currentStep ? 1 : 0);
            group.selectAll("rect, foreignObject")
                .transition()
                .duration(500)
                .delay(10)
                .attr("opacity", index <= currentStep ? 1 : 0);
        });
        currentStep = (currentStep + 1) % stepGroups.length;
        setTimeout(animate, 1000);
    };

    return {
        steps: [],
        onSlideLeave: () => {
            isAnimating = false;
        },
        onSlideEnter: () => {
            isAnimating = true;
            currentStep = 0;
            animate();
        },
    }
}

