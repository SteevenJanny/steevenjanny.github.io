import * as d3 from "d3";

export function create(container, context) {
    const width = 1000, height = 150;

    const margin = {top: 10, right: 10, bottom: 10, left: 10};
    const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

    const svg = d3.select(container).append("svg")
        // .style("border", "1px solid red")
        .attr("viewBox", [0, 0, width, height])

    const imgSize = 100;
    const cornerRadius = 10;
    const arrow_size = 6;
    const defs = svg.append("defs");
    defs.append("marker")
        .attr("id", "arrowhead_fno")
        .attr("markerWidth", arrow_size)
        .attr("markerHeight", arrow_size)
        .attr("refX", arrow_size)
        .attr("refY", arrow_size / 2)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 L " + arrow_size + "," + (arrow_size / 2) + " L 0," + arrow_size + " Z")
        .attr("fill", "#888888");

    function addRoundedImage(href, x, y, id, size, r = cornerRadius, group = svg) {
        const clipId = `clip-${id}`;

        defs.append("clipPath")
            .attr("id", clipId)
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", size)
            .attr("height", size)
            .attr("rx", r)
            .attr("ry", r);

        group.append("image")
            .attr("xlink:href", href)
            .attr("x", x)
            .attr("y", y)
            .attr("width", size)
            .attr("height", size)
            .attr("clip-path", `url(#${clipId})`);
    }

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

    const fnoBlock = svg.append("g").attr("class", "fno-block");
    addRoundedImage("assets/sota/gt/1.jpg", xScale(0.05) - imgSize / 2, yScale(0.5) - imgSize / 2, "fno", imgSize, cornerRadius)
    addRoundedImage("assets/sota/fft/1_fft.jpg", xScale(0.25) - imgSize / 2, yScale(0.5) - imgSize / 2, "fft", imgSize, cornerRadius, fnoBlock)


    svg.append("foreignObject")
        .attr("width", 150)
        .attr("height", 20)
        .attr("x", xScale(0.0) - 25)
        .attr("y", yScale(0.5) + imgSize / 2)
        .append("xhtml:div")
        .style("font-size", "1rem")
        .html(`$\\mathbf{s}_0(\\mathbf{x})$`);

    fnoBlock.append("line")
        .attr("x1", xScale(0.05) + imgSize / 2)
        .attr("y1", yScale(0.5))
        .attr("x2", xScale(0.25) - imgSize / 2)
        .attr("y2", yScale(0.5))
        .attr("stroke", "#888888")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead_fno)");

    fnoBlock.append("line")
        .attr("x1", xScale(0.25) + imgSize / 2)
        .attr("y1", yScale(0.5))
        .attr("x2", xScale(0.5) - imgSize)
        .attr("y2", yScale(0.5))
        .attr("stroke", "#888888")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead_fno)");

    fnoBlock.append("text")
        .attr("x", xScale(0.15))
        .attr("y", yScale(0.5) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", 16)
        .text("FFT");


    // Model block
    fnoBlock.append("rect")
        .attr("x", xScale(0.5) - imgSize)
        .attr("y", yScale(0.5) - imgSize / 2)
        .attr("width", imgSize * 2)
        .attr("height", imgSize)
        .attr("rx", cornerRadius)
        .attr("ry", cornerRadius)
        .attr("fill", "#D5EFDA");

    fnoBlock.append("text")
        .attr("x", xScale(0.5))
        .attr("y", yScale(0.5) - imgSize / 2 - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", 16)
        .text("FNO");

    drawNetworkIn(
        xScale(0.5) - imgSize,
        yScale(0.5) - imgSize / 2,
        imgSize * 2,
        imgSize,
        3, 4, "fno-neuron", fnoBlock
    )


    // Stacked array of outputs
    const outputBlock = svg.append("g").attr("class", "outputs");
    const N_OUTPUTS = 5;
    const outputSize = (height - margin.top - margin.bottom) / N_OUTPUTS - 5;
    for (let i = 0; i < N_OUTPUTS; i++) {
        addRoundedImage(
            "assets/sota/fft/" + (i + 1) + "_fft.jpg",
            xScale(0.8) - imgSize / 2,
            yScale(0.5) - (N_OUTPUTS / 2 - i) * (outputSize + 5),
            "fno-output-" + i,
            outputSize, 2, outputBlock
        );
        addRoundedImage(
            "assets/sota/gt/" + (i + 1) + ".jpg",
            xScale(0.93) - imgSize / 2,
            yScale(0.5) - (N_OUTPUTS / 2 - i) * (outputSize + 5),
            "gt-output-" + i,
            outputSize, 2, outputBlock
        );

        outputBlock.append("foreignObject")
            .attr("width", 150)
            .attr("height", 20)
            .attr("x", xScale(0.9) - 25)
            .attr("y", yScale(0.5) - (N_OUTPUTS / 2 - i) * (outputSize + 5) + outputSize / 2 - 10)
            .append("xhtml:div")
            .style("font-size", "1rem")
            .html(`$\\mathbf{s}(\\mathbf{x}, t{+}${i + 1})$`);

        outputBlock.append("line")
            .attr("x1", xScale(0.5) + imgSize)
            .attr("y1", yScale(0.5))
            .attr("x2", xScale(0.8) - imgSize / 2)
            .attr("y2", yScale(0.5) - (N_OUTPUTS / 2 - i) * (outputSize + 5) + outputSize / 2)
            .attr("stroke", "#888888")
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#arrowhead_fno)");

        outputBlock.append("line")
            .attr("x1", xScale(0.79) - outputSize)
            .attr("y1", yScale(0.5) - (N_OUTPUTS / 2 - i) * (outputSize + 5) + outputSize / 2)
            .attr("x2", xScale(0.93) - imgSize / 2)
            .attr("y2", yScale(0.5) - (N_OUTPUTS / 2 - i) * (outputSize + 5) + outputSize / 2)
            .attr("stroke", "#888888")
            .attr("stroke-width", 1)
            .attr("marker-end", "url(#arrowhead_fno)");
    }

    outputBlock.append("text")
        .attr("x", xScale(0.825))
        .attr("y", yScale(0))
        .attr("text-anchor", "middle")
        .attr("font-size", 16)
        .text("Inverse FFT");

    let isAnimating = true;
    const GreyScale = d3.scaleSequential(d3.interpolateOranges)

    function animate() {
        if (!isAnimating) return;
        d3.selectAll(".fno-neuron")
            .transition()
            .duration(200)
            .attr("fill", d => GreyScale(Math.random() / 2));
    }

    let animationInterval = d3.interval(animate, 200);

    return {
        steps: [],
        onSlideEnter: () => {
        },
        onSlideLeave: () => {
        }
    }
}
