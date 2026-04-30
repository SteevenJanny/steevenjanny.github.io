import * as d3 from "d3";

export function create(container, context) {
    const width = 1000, height = 350;

    const margin = {top: 10, right: 50, bottom: 50, left: 50, xgap: 100, ygap: 100};
    const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

    const svg = d3.select(container).append("svg")
        // .style("border", "1px solid red")
        .attr("viewBox", [0, 0, width, height])

    const arrow_size = 6;
    svg.append("defs").append("marker")
        .attr("id", "arrowhead_operator")
        .attr("markerWidth", arrow_size)
        .attr("markerHeight", arrow_size)
        .attr("refX", arrow_size)
        .attr("refY", arrow_size / 2)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 L " + arrow_size + "," + (arrow_size / 2) + " L 0," + arrow_size + " Z")
        .attr("fill", "#888888");

    svg.append("foreignObject")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", 50)
        .append("xhtml:div")
        .html("$\\mathcal{G}: \\mathbf{s}_0(\\mathbf{x}) \\mapsto \\mathbf{s}(\\mathbf{x}, t)$");

    const inputGroup = svg.append("g").attr("class", "input-group");
    const outputGroup = svg.append("g").attr("class", "output-group");

    const xScaleInput = d3.scaleLinear().domain([0, 1]).range([margin.left, width / 2 - margin.xgap]);
    const yScaleInput = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.ygap + margin.top]);
    const xScaleOutput = d3.scaleLinear().domain([0, 1]).range([width / 2 + margin.xgap, width - margin.right]);
    const yScaleOutput = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.ygap + margin.top]);


    // Add grid lines
    function addGridLines(group, xScale, yScale) {
        // Vertical grid lines
        group.selectAll(".grid-line-vertical")
            .data(xScale.ticks(10))
            .enter()
            .append("line")
            .attr("class", "grid-line-vertical")
            .attr("x1", d => xScale(d))
            .attr("y1", yScale.range()[0])
            .attr("x2", d => xScale(d))
            .attr("y2", yScale.range()[1])
            .attr("stroke", "#EEEEEE")
            .attr("stroke-width", 1);

        // Horizontal grid lines
        group.selectAll(".grid-line-horizontal")
            .data(yScale.ticks(10))
            .enter()
            .append("line")
            .attr("class", "grid-line-horizontal")
            .attr("x1", xScale.range()[0])
            .attr("y1", d => yScale(d))
            .attr("x2", xScale.range()[1])
            .attr("y2", d => yScale(d))
            .attr("stroke", "#EEEEEE")
            .attr("stroke-width", 1);
    }

    addGridLines(inputGroup, xScaleInput, yScaleInput);
    addGridLines(outputGroup, xScaleOutput, yScaleOutput);

    // show axis
    inputGroup.append("g")
        .attr("transform", `translate(0, ${yScaleInput(0)})`)
        .call(d3.axisBottom(xScaleInput).ticks(5));

    inputGroup.append("g")
        .attr("transform", `translate(${xScaleInput(0)}, 0)`)
        .call(d3.axisLeft(yScaleInput).ticks(5));

    // Draw a function sin(2 * pi * x) as input
    const inputData = d3.range(0, 1.01, 0.01).map(x => ({x: x, y: 0.5 + 0.4 * Math.sin(2 * Math.PI * x)}));
    const lineGenerator = d3.line()
        .x(d => xScaleInput(d.x))
        .y(d => yScaleInput(d.y));

    inputGroup.append("path")
        .datum(inputData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", lineGenerator);

    function surfaceFunction(x, t) {
        return 0.5 + 0.4 * Math.exp(-3 * t) * Math.sin(2 * Math.PI * x);
    }


    // show axis
    outputGroup.append("g")
        .attr("transform", `translate(0, ${yScaleOutput(0)})`)
        .call(d3.axisBottom(xScaleOutput).ticks(5));

    outputGroup.append("g")
        .attr("transform", `translate(${xScaleOutput(0)}, 0)`)
        .call(d3.axisLeft(yScaleOutput).ticks(5));

    const lineGeneratorOutput = d3.line()
        .x(d => xScaleOutput(d.x))
        .y(d => yScaleOutput(d.y));

    const allPaths = [];
    for (let i = 0; i < 50; i++) {
        const t = i * 0.01;
        const data = d3.range(0, 1.01, 0.01).map(x => ({x: x, y: surfaceFunction(x, t)}));
        allPaths.push(data);
    }
    const outputPaths = outputGroup.selectAll(".output-path")
        .data(allPaths)
        .enter()
        .append("path")
        .attr("class", "output-path")
        .attr("fill", "none")
        .attr("stroke", "tomato")
        .attr("stroke-width", 2)
        .attr("d", lineGeneratorOutput);


    // Add labels to input and output
    inputGroup.append("text")
        .attr("x", xScaleInput(0.5))
        .attr("y", yScaleInput(1) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Initial condition");

    outputGroup.append("text")
        .attr("x", xScaleOutput(0.5))
        .attr("y", yScaleOutput(1) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .text("Output solution");

    inputGroup.append("text")
        .attr("x", xScaleInput(0.5))
        .attr("y", yScaleInput(0) + 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Spatial coordinate (x)");

    outputGroup.append("text")
        .attr("x", xScaleOutput(0.5))
        .attr("y", yScaleOutput(0) + 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .text("Spatial coordinate (x)");

    inputGroup.append("text")
        .attr("x", xScaleInput(0) - 30)
        .attr("y", yScaleInput(0.5))
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("transform", `rotate(-90, ${xScaleInput(0) - 30}, ${yScaleInput(0.5)})`)
        .text("Amplitude");

    outputGroup.append("text")
        .attr("x", xScaleOutput(0) - 30)
        .attr("y", yScaleOutput(0.5))
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("transform", `rotate(-90, ${xScaleOutput(0) - 30}, ${yScaleOutput(0.5)})`)
        .text("Amplitude");


    const pathIC = d3.path();
    pathIC.moveTo(xScale(0.45), yScale(0.85));
    pathIC.quadraticCurveTo(xScale(0.45), yScale(0.5), xScaleInput(1), yScaleInput(0.75));

    const pathSol = d3.path();
    pathSol.moveTo(xScale(0.55), yScale(0.85));
    pathSol.quadraticCurveTo(xScale(0.55), yScale(0.5), xScaleOutput(0), yScaleOutput(0.75));

    svg.append("path")
        .attr("d", pathIC.toString())
        .attr("fill", "none")
        .attr("stroke", "#888888")
        .attr("stroke-width", 2.5)
        .attr("marker-end", "url(#arrowhead_operator)")
    svg.append("path")
        .attr("d", pathSol.toString())
        .attr("fill", "none")
        .attr("stroke", "#888888")
        .attr("stroke-width", 2.5)
        .attr("marker-end", "url(#arrowhead_operator)")


    let currentIndex = 0;
    let isAnimating = false;

    function updateOutput() {
        if (!isAnimating) return;
        currentIndex = (currentIndex + 1) % allPaths.length;
        outputPaths.attr("opacity", (d, i) => {
            return Math.max(0, i > currentIndex ? 0 : 1 - (currentIndex - i) / 10);
        });
    }

    let interval;
    return {
        steps: [],
        onSlideEnter: () => {
            isAnimating = true;
            clearInterval(interval);
            interval = d3.interval(updateOutput, 200);
        },
        onSlideLeave: () => {
            isAnimating = false;
            clearInterval(interval);
        }
    }
}
