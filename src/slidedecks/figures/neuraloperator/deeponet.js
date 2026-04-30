import * as d3 from "d3";

export function create(container, context) {
    const width = 1000, height = 450;

    const margin = {top: 10, right: 50, bottom: 50, left: 50, xgap: 100, ygap: 100};
    const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

    const N = 10
    const svg = d3.select(container).append("svg")
        // .style("border", "1px solid red")
        .attr("viewBox", [0, 0, width, height])


    const branchBlock = svg.append("g")
    const trunkBlock = svg.append("g")
    const outputBlock = svg.append("g")
    const maskBlock = svg.append("g")

    const arrow_size = 6;
    svg.append("defs").append("marker")
        .attr("id", "arrowhead_deeponet")
        .attr("markerWidth", arrow_size)
        .attr("markerHeight", arrow_size)
        .attr("refX", arrow_size)
        .attr("refY", arrow_size / 2)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 L " + arrow_size + "," + (arrow_size / 2) + " L 0," + arrow_size + " Z")
        .attr("fill", "#888888");


    // Insert image from /assets/continuous_pde/videos/initial_condition_0.png
    const img_width = 150;
    branchBlock.append("image")
        .attr("xlink:href", "assets/continuous_pde/videos/initial_condition_0.png")
        .attr("x", xScale(0.1) - img_width / 2)
        .attr("y", yScale(0.75) - img_width / 2)
        .attr("width", img_width)
        .attr("height", img_width);

    branchBlock.append("rect")
        .attr("x", xScale(0.1) - img_width / 2)
        .attr("y", yScale(0.75) - img_width / 2)
        .attr("width", img_width)
        .attr("height", img_width)
        .attr("fill", "#000000")
        .attr("fill-opacity", 0.25);

    branchBlock.append("text")
        .attr("x", xScale(0.1))
        .attr("y", yScale(0.75))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "white")
        .attr("font-size", 16)
        .text("Initial Condition");

    branchBlock.append("foreignObject")
        .attr("x", xScale(0.1) + img_width / 2 + 10)
        .attr("y", yScale(0.75) - 25)
        .attr("width", 100)
        .attr("height", 50)
        .append("xhtml:div")
        .html("$\\mathbf{s}_0(\\mathbf{x})$");

    // Branch network
    branchBlock.append("rect")
        .attr("x", xScale(0.4))
        .attr("y", yScale(0.75) - 60)
        .attr("width", 200)
        .attr("height", 120)
        .attr("fill", "var(--ml-light)")
        .attr("rx", 10);

    branchBlock.append("text")
        .attr("x", xScale(0.4) + 100)
        .attr("y", yScale(0.75) - 65)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "#333333")
        .attr("font-size", 14)
        .text("Branch Network");


    // Input position
    trunkBlock.append("rect")
        .attr("x", xScale(0.1) - img_width / 2)
        .attr("y", yScale(0.25) - img_width / 2)
        .attr("width", img_width)
        .attr("height", img_width)
        .attr("fill", "none")
        .attr("stroke", "#888888")
        .attr("stroke-width", 2)

    // Grid lines
    for (let i = 0; i <= N; i++) {
        for (let j = 0; j <= N; j++) {
            trunkBlock.append("line")
                .attr("x1", xScale(0.1) - img_width / 2 + (j * img_width / N))
                .attr("y1", yScale(0.25) - img_width / 2)
                .attr("x2", xScale(0.1) - img_width / 2 + (j * img_width / N))
                .attr("y2", yScale(0.25) + img_width / 2)
                .attr("stroke", "#888888")
                .attr("stroke-width", 1);

            trunkBlock.append("line")
                .attr("x1", xScale(0.1) - img_width / 2)
                .attr("y1", yScale(0.25) - img_width / 2 + (i * img_width / N))
                .attr("x2", xScale(0.1) + img_width / 2)
                .attr("y2", yScale(0.25) - img_width / 2 + (i * img_width / N))
                .attr("stroke", "#888888")
                .attr("stroke-width", 1);
        }
    }

    trunkBlock.append("foreignObject")
        .attr("x", xScale(0.1) + img_width / 2 + 10)
        .attr("y", yScale(0.25) - 100 / 2)
        .attr("width", 100)
        .attr("height", 200)
        .append("xhtml:div")
        .html("$\\begin{bmatrix} x \\\\ y \\\\  t \\end{bmatrix}$");

    trunkBlock.append("foreignObject")
        .attr("x", xScale(0.1) - img_width / 2)
        .attr("y", yScale(0.25) + img_width / 2)
        .attr("width", img_width)
        .attr("height", 50)
        .append("xhtml:div")
        .html("$x$");
    trunkBlock.append("foreignObject")
        .attr("x", xScale(0.1) - img_width / 2 - 50)
        .attr("y", yScale(0.25) - img_width / 2)
        .attr("width", 50)
        .attr("height", img_width)
        .append("xhtml:div")
        .style("height", "100%")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .html("$y$");


    // Trunk network
    trunkBlock.append("rect")
        .attr("x", xScale(0.4))
        .attr("y", yScale(0.25) - 60)
        .attr("width", 200)
        .attr("height", 120)
        .attr("fill", "var(--phy-light)")
        .attr("rx", 10);

    trunkBlock.append("text")
        .attr("x", xScale(0.4) + 100)
        .attr("y", yScale(0.25) - 65)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "#333333")
        .attr("font-size", 14)
        .text("Trunk Network");


    // Join both networks
    outputBlock.append("circle")
        .attr("cx", xScale(0.75))
        .attr("cy", yScale(0.5))
        .attr("r", 20)
        .attr("fill", "#FFFFFF")
        .attr("stroke", "#000000")
        .attr("stroke-width", 1);

    outputBlock.append("text")
        .attr("x", xScale(0.75))
        .attr("y", yScale(0.5) + 11)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("fill", "gray")
        .attr("font-size", 35)
        .text("X");

    // Output video from /assets/continuous_pde/videos/trajectory_0.mp4
    const video_width = 150;
    outputBlock.append("foreignObject")
        .attr("x", xScale(0.85))
        .attr("y", yScale(0.5) - video_width / 2)
        .attr("width", video_width)
        .attr("height", video_width)
        .append("xhtml:video")
        .attr("src", "assets/continuous_pde/videos/trajectory_0.mp4")
        .attr("autoplay", true)
        .attr("loop", true)
        .attr("muted", true)
        .style("width", "100%")
        .style("height", "100%");

    outputBlock.append("text")
        .attr("x", xScale(0.85) + 15)
        .attr("y", yScale(0.5) - video_width / 2 - 10)
        .attr("text-anchor", "start")
        .attr("alignment-baseline", "middle")
        .attr("fill", "#333333")
        .attr("font-size", 14)
        .text("Predicted Trajectory");

    outputBlock.append("foreignObject")
        .attr("x", xScale(0.85) + 25)
        .attr("y", yScale(0.5) + video_width / 2)
        .attr("width", 100)
        .attr("height", 50)
        .append("xhtml:div")
        .html("$\\mathbf{s}(\\mathbf{x}, t)$");


    function drawNetworkIn(x, y, width, height, nLayers, nNeurons, className, group) {
        const layerWidth = width / nLayers;
        const neuronRadius = Math.min(layerWidth, height / (nNeurons + 1 + nLayers)) * 0.4;

        const net = group.append("g")
        const connections = net.append("g")
        const neurons = net.append("g")
        for (let i = 0; i < nLayers; i++) {
            const layerX = x + i * layerWidth + layerWidth / 2;

            for (let j = 0; j < nNeurons + i; j++) {
                const neuronY = y + (j + 1) * height / (i + nNeurons + 1);
                neurons.append("circle")
                    .attr("class", className)
                    .attr("cx", layerX)
                    .attr("cy", neuronY)
                    .attr("r", neuronRadius)
                    .attr("fill", "#FFFFFF")
                    .attr("stroke", "#000000")
                    .attr("stroke-width", 1);
            }
        }

        // Draw connections
        for (let i = 0; i < nLayers - 1; i++) {
            const layerX1 = x + i * layerWidth + layerWidth / 2;
            const layerX2 = x + (i + 1) * layerWidth + layerWidth / 2;
            for (let j = 0; j < nNeurons + i; j++) {
                const neuronY1 = y + (j + 1) * height / (i + nNeurons + 1);
                for (let k = 0; k < nNeurons + i + 1; k++) {
                    const neuronY2 = y + (k + 1) * height / (i + 1 + nNeurons + 1);
                    connections.append("line")
                        .attr("x1", layerX1)
                        .attr("y1", neuronY1)
                        .attr("x2", layerX2)
                        .attr("y2", neuronY2)
                        .attr("stroke", "#C0C0C0")
                        .attr("stroke-width", 1.5)
                }
            }
        }
    }

    drawNetworkIn(xScale(0.4), yScale(0.75) - 60, 200, 120, 4, 3, "neuron branch", branchBlock);
    drawNetworkIn(xScale(0.4), yScale(0.25) - 60, 200, 120, 4, 2, "neuron trunk", trunkBlock);


    function arrow(x1, y1, x2, y2, group) {
        if (y1 === y2) {
            group.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("stroke", "#888888")
                .attr("stroke-width", 2)
                .attr("marker-end", "url(#arrowhead_deeponet)");
        } else {
            group.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y1)
                .attr("stroke", "#888888")
                .attr("stroke-width", 2)
            group.append("line")
                .attr("x1", x2)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("stroke", "#888888")
                .attr("stroke-width", 2)
                .attr("marker-end", "url(#arrowhead_deeponet)");
        }
    }

    arrow(xScale(0.25) + 50, yScale(0.75), xScale(0.4), yScale(0.75), branchBlock);
    arrow(xScale(0.25) + 50, yScale(0.25), xScale(0.4), yScale(0.25), trunkBlock);
    arrow(xScale(0.6) + 20, yScale(0.75), xScale(0.75), yScale(0.5) - 20, outputBlock);
    arrow(xScale(0.6) + 20, yScale(0.25), xScale(0.75), yScale(0.5) + 20, outputBlock);
    arrow(xScale(0.75) + 20, yScale(0.5), xScale(0.85), yScale(0.5), outputBlock);

    trunkBlock.append("g")
        .attr("class", "position_mask")
        .append("rect")
        .attr("x", xScale(0.1) - img_width / 2)
        .attr("y", yScale(0.25) - img_width / 2)
        .attr("width", img_width / N)
        .attr("height", img_width / N)
        .attr("fill", "gray")

    for (let i = 0; i < N; i++) {
        for (let j = 0; j < N; j++) {
            maskBlock.append("rect")
                .attr("class", "video_mask")
                .attr("id", `video_mask_${i}_${j}`)
                .attr("x", xScale(0.85) + (j * video_width / N))
                .attr("y", yScale(0.5) - video_width / 2 + (i * video_width / N) - 4)
                .attr("width", video_width / N)
                .attr("height", video_width / N)
                .attr("fill", "gray")
        }
    }

    let isAnimating = true;
    const GreyScale = d3.scaleSequential(d3.interpolateOranges)
    d3.selectAll(".branch")
        .attr("fill", d => GreyScale(Math.random() / 2));

    let currentMaskPos = [0, 0];

    function animate() {
        if (!isAnimating) return;
        d3.selectAll(".trunk")
            .transition()
            .duration(200)
            .attr("fill", d => GreyScale(Math.random() / 2));

        currentMaskPos[0] = (currentMaskPos[0] + 1);
        if (currentMaskPos[0] >= N) {
            currentMaskPos[0] = 0;
            currentMaskPos[1] = (currentMaskPos[1] + 1) % N;
        }
        d3.select(".position_mask")
            .attr("transform", `translate(${currentMaskPos[0] * img_width / N}, ${currentMaskPos[1] * img_width / N})`)


        d3.selectAll(".video_mask")
            .attr("opacity", 0.9)

        d3.select("#video_mask_" + currentMaskPos[1] + "_" + currentMaskPos[0])
            .attr("opacity", 0.0);
    }

    let interval;
    // let interval = setInterval(animate, 200);
    branchBlock.attr("opacity", 0.0);
    trunkBlock.attr("opacity", 0.0);
    outputBlock.attr("opacity", 0.0);
    maskBlock.attr("opacity", 0.0);

    return {
        steps: [{
            index: 0,
            forward: () => {
                branchBlock.transition().duration(500).attr("opacity", 1.0);
                trunkBlock.attr("opacity", 0.0);
                outputBlock.attr("opacity", 0.0);
                maskBlock.attr("opacity", 0.0);
            },
            backward: () => {
                branchBlock.transition().duration(500).attr("opacity", 0.0);
                trunkBlock.attr("opacity", 0.0);
                outputBlock.attr("opacity", 0.0);
                maskBlock.attr("opacity", 0.0);
            }
        },
            {
                index: 1,
                forward: () => {
                    trunkBlock.transition().duration(500).attr("opacity", 1.0);
                    branchBlock.attr("opacity", 1.0);
                    outputBlock.attr("opacity", 0.0);
                    maskBlock.attr("opacity", 0.0);
                },
                backward: () => {
                    trunkBlock.transition().duration(500).attr("opacity", 0.0);
                    branchBlock.attr("opacity", 1.0);
                    outputBlock.attr("opacity", 0.0);
                    maskBlock.attr("opacity", 0.0);
                }
            },
            {
                index: 2,
                forward: () => {
                    outputBlock.transition().duration(500).attr("opacity", 1.0);
                    branchBlock.attr("opacity", 1.0);
                    trunkBlock.attr("opacity", 1.0);
                    maskBlock.attr("opacity", 0.0);
                },
                backward: () => {
                    outputBlock.transition().duration(500).attr("opacity", 0.0);
                    branchBlock.attr("opacity", 1.0);
                    trunkBlock.attr("opacity", 1.0);
                    maskBlock.attr("opacity", 0.0);
                }
            },
            {
                index: 3,
                forward: () => {
                    outputBlock.attr("opacity", 1.0);
                    branchBlock.attr("opacity", 1.0);
                    trunkBlock.attr("opacity", 1.0);
                    maskBlock.attr("opacity", 1.0);
                    isAnimating = true;
                    interval = setInterval(animate, 200);
                },
                backward: () => {
                    outputBlock.attr("opacity", 1.0)
                    branchBlock.attr("opacity", 1.0);
                    trunkBlock.attr("opacity", 1.0);
                    maskBlock.attr("opacity", 0.0);
                    isAnimating = false;
                    clearInterval(interval);
                }
            }

        ],
        onSlideEnter: () => {
        },
        onSlideLeave: () => {
            isAnimating = false;
            clearInterval(interval);
        }
    }
}
