import * as d3 from "d3";

const width = 1000, height = 350;

const inputs = [
    "$\\mathbf{s}(x_1, t)$",
    "$\\mathbf{s}(x_2, t)$",
    "$\\mathbf{s}(x_3, t)$",
    "$\\mathbf{s}(x_4, t)$",
    "..."
];
const hidden_size = [8, 16, 10, 18];
const outputs = [
    "$\\dot{\\mathbf{s}}(x_1, t)$",
    "$\\dot{\\mathbf{s}}(x_2, t)$",
    "$\\dot{\\mathbf{s}}(x_3, t)$",
    "$\\dot{\\mathbf{s}}(x_4, t)$",
    "..."
];
const graph_margin = {top: 10, right: 60, bottom: 10, left: 60};
const xScale = d3.scaleLinear().domain([0, 1]).range([graph_margin.left, width - graph_margin.right]);
const yScale = d3.scaleLinear().domain([0, 1]).range([height - graph_margin.bottom, graph_margin.top]);

export function create(container, context) {

    const svg = d3.select(container).append("svg")
        .attr("viewBox", [0, 0, width, height]);

    const n_layers = 2 + hidden_size.length;
    const layer_width = 1 / (n_layers - 1);


// Helper vertical bar for layers
    for (let i = 0; i < n_layers; i++) {
        svg.append("line")
            .attr("x1", xScale(i * layer_width))
            .attr("y1", yScale(0))
            .attr("x2", xScale(i * layer_width))
            .attr("y2", yScale(1))
            .attr("stroke", "#CCCCCC")
            .attr("stroke-width", 1);
    }


    function createLabels(label_id, labels, layer_index) {
        svg.selectAll(label_id)
            .data(labels)
            .enter()
            .append("foreignObject")
            .attr("width", 150)
            .attr("height", 50)
            .attr("y", (d, i) => yScale((i + 1) / (labels.length + 1)) - 25)
            .attr("x", xScale(layer_index * layer_width) - 150 / 2)
            .append("xhtml:div")
            .style("background", "#FFFFFF99")
            .style("font-size", "2rem")
            .style("width", "fit-content")
            .style("margin", "auto")
            .html(d => d);
    }


    const neuron_radius = 0.015 * (xScale(1) - xScale(0))

    function createNeurons(n_neurons, layer_index) {
        svg.selectAll(".neuron.layer-" + layer_index)
            .data(d3.range(n_neurons).map(i => ({
                layer: layer_index,
                index: i,
                activation: Math.random()
            })))
            .enter()
            .append("circle")
            .attr("class", "neuron layer-" + layer_index)
            .attr("cx", xScale(layer_index * layer_width))
            .attr("cy", d => yScale((d.index + 1) / (n_neurons + 1)))
            .attr("r", neuron_radius)
            .attr("stroke", "white")
            .attr("stroke-width", 3);
    }


// Create connections
    function createConnections(n_neurons_prev, n_neurons_next, layer_index) {
        const prev_layer_x = xScale((layer_index - 1) * layer_width);
        const next_layer_x = xScale(layer_index * layer_width);

        for (let i = 0; i < n_neurons_prev; i++) {
            for (let j = 0; j < n_neurons_next; j++) {
                svg.append("line")
                    .attr("x1", prev_layer_x)
                    .attr("y1", yScale((i + 1) / (n_neurons_prev + 1)))
                    .attr("x2", next_layer_x)
                    .attr("y2", yScale((j + 1) / (n_neurons_next + 1)))
                    .attr("stroke", "#AAAAAA")
                    .attr("stroke-width", 0.5);
            }
        }
    }

// Create connections between layers
    createConnections(inputs.length, hidden_size[0], 1);
    for (let i = 1; i < hidden_size.length; i++) {
        createConnections(hidden_size[i - 1], hidden_size[i], i + 1);
    }
    createConnections(hidden_size[hidden_size.length - 1], outputs.length, n_layers - 1);
    createLabels("input_labels", inputs, 0);
    createLabels("output_labels", outputs, n_layers - 1);

// Create input layer
    for (let i = 0; i < hidden_size.length; i++) {
        createNeurons(hidden_size[i], i + 1);
    }


    let lastTime = 0;
    const fps = 10;                // target FPS
    const frameDuration = 1000 / fps;

    const activationColor = d3.scaleSequential(d3.interpolateGnBu)
        .domain([0, 1]);

    let animationRunning = true;

    function animateNeurons(timestamp) {
        if (!animationRunning) return;
        if (timestamp - lastTime >= frameDuration) {
            lastTime = timestamp;
            svg.selectAll(".neuron")
                .each(function (d) {
                    d.activation += 0.2 * (Math.random() - 0.5);
                    d.activation = Math.max(0, Math.min(1, d.activation));
                })
                .attr("fill", d => activationColor(d.activation));

        }
        requestAnimationFrame(animateNeurons);
    }


// Hide labels neurons and connections for transition
    svg.selectAll(".neuron")
        .attr("opacity", 0.0)
        .attr("transform", "translate(-50,0)");
    svg.selectAll("line")
        .attr("opacity", 0.0)
    svg.selectAll("foreignObject")
        .attr("opacity", 0.0)
        .attr("transform", "translate(100, 0)");

    function appear() {
        svg.selectAll(".neuron")
            .transition()
            .duration(500)
            .attr("opacity", 1.0)
            .attr("transform", "translate(0,0)");

        svg.selectAll("line")
            .transition()
            .duration(500)
            .attr("opacity", 1.0)
            .attr("transform", "translate(0,0)");

        svg.selectAll("foreignObject")
            .transition()
            .duration(500)
            .attr("opacity", 1.0)
            .attr("transform", "translate(0,0)");
    }

    function disappear() {
        svg.selectAll(".neuron")
            .transition()
            .duration(500)
            .attr("opacity", 0.0)
            .attr("transform", "translate(-50,0)");
        svg.selectAll("line")
            .transition()
            .duration(500)
            .attr("opacity", 0.0);

        svg.selectAll("foreignObject")
            .transition()
            .duration(500)
            .attr("opacity", 0.0)
            .attr("transform", "translate(100, 0)");
    }

    return {
        steps: [{index: 0, forward: () => appear(), backward: () => disappear()}],
        onSlideEnter: () => {
            animationRunning = true;
            requestAnimationFrame(animateNeurons);
        },
        onSlideLeave: () => {
            animationRunning = false;
        },
    }
}
