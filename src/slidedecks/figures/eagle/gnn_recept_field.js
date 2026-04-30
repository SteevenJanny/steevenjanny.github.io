import * as d3 from "d3";

const contentHTML = `
    <div class="row fs-6" style="height: 100vh">
        <div class="col-8" style="height: 100vh">
            <div id="graph" style="height: 100vh"></div>
        </div>
        <div class="col text-center">
            <p class="" style="margin-top: 40px; margin-bottom: 70px"> Receptive field of GNNs</p>
            <div class="slider-container col-50" style="width: 100%">
                <div id="graph2" style="height:20vh"></div>
                <input type="range" id="slider" min="1" max="20" value="10" class="slider">
                    <label for="slider">Number of layers: </label> <span id="slider-value">1</span>
            </div>
        </div>
    </div>`


let center_id = 2;
let n_rings = 10;
const max_n_rings = 30;
const radius = 2;

const viridis = d3.scaleSequential(d3.interpolatePlasma).domain([max_n_rings, 0]);

export function create(container, context) {
    container.innerHTML = contentHTML;


    const slider = container.querySelector("#slider");
    const sliderValue = container.querySelector("#slider-value");

    const width = 750;
    const height = 500;

    const width2 = 250;
    const height2 = height;


    const graph = d3.select(container.querySelector("#graph")).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", [0, 0, width, height])

    const graph2 = d3.select(container.querySelector("#graph2")).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", [0, 0, width2, height2])

    const mesh = graph.append("g")
    let nodes = [];
    let edges = [];
    let rings = [];

    const y_scale = d3.scaleLinear()
        .domain([-2.1, 1.7])
        .range([height, 0])

    const k = width * 3.8 / height
    const x_scale = d3.scaleLinear()
        .domain([-k / 2, k / 2])
        .range([0, width])

    const line = d3.line()
        .x(function (d) {
            return x_scale(nodes[d][0])
        })
        .y(function (d) {
            return y_scale(nodes[d][1])
        })
    d3.json("assets/eagle/sota/contours.json").then(function (data) {
        nodes = data.points;
        edges = data.edges;

        compute_rings(nodes, edges, n_rings)

        mesh.selectAll("path")
            .data(edges)
            .enter()
            .append("path")
            .attr("id", function (d, i) {
                var min = Math.min(d[0], d[1]);
                var max = Math.max(d[0], d[1]);
                return "edge_" + min + "_" + max;
            })
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", "#626262")
            .attr("stroke-width", 1)

        mesh.selectAll("circle").data(nodes)
            .enter()
            .append("circle")
            .attr("id", function (d, i) {
                return "node_" + i
            })
            .attr("cx", function (d) {
                return x_scale(d[0])
            })
            .attr("cy", function (d) {
                return y_scale(d[1])
            })
            .attr("r", radius)
            .attr("fill", "black")
            .attr("stroke", "none")
            .on("mouseover", function (event, d) {
                center_id = +d3.select(this).attr("id").split("_")[1];
                update_center()
            });


        update_center()
    });

    function update_ring() {
        viridis.domain([n_rings, 0]);
        mesh.selectAll("circle")
            .attr("fill", "black")
            .attr("r", radius)

        for (let i = 0; i < n_rings; i++) {
            for (let j = 0; j < rings[i].length; j++) {
                mesh.selectAll("#node_" + rings[i][j])
                    .attr("fill", viridis(i))
                    .attr("r", radius + 1)
            }
        }
    }


    // Initial value display
    sliderValue.textContent = slider.value;

    // Update value display on slider change
    slider.addEventListener('input', function () {
        sliderValue.textContent = slider.value;
        n_rings = slider.value - 1
        update_ring()
        mesh.selectAll("#node_" + center_id)
            .attr("fill", "red")
            .attr("r", radius * 2)
        update_rect()
    });


    function update_center() {
        compute_rings()
        update_ring()
        mesh.selectAll("#node_" + center_id)
            .attr("fill", "red")
            .attr("r", radius * 2)
    }

    function compute_rings() {
        rings = [];
        let ring = [center_id];
        let visited = new Set();
        visited.add(center_id);
        rings.push(ring);
        for (let i = 0; i < max_n_rings; i++) {
            const new_ring = [];
            for (let j = 0; j < ring.length; j++) {
                const node = ring[j];
                for (let k = 0; k < edges.length; k++) {
                    const edge = edges[k];
                    if (edge[0] === node && !visited.has(edge[1])) {
                        new_ring.push(edge[1]);
                        visited.add(edge[1]);
                    }
                    if (edge[1] === node && !visited.has(edge[0])) {
                        new_ring.push(edge[0]);
                        visited.add(edge[0]);
                    }
                }
            }
            ring = new_ring;
            rings.push(ring);
        }
    }

    graph2.append("line")
        .attr("x1", 0)
        .attr("y1", width2 * 0.1)
        .attr("x2", width2)
        .attr("y2", width2 * 0.1)
        .attr("stroke", "#9E9E9E")
        .attr("stroke-width", 2)

    const layers = graph2.append("g");
    const staticBlock = graph2.append("g");

    staticBlock.append("image")
        .attr("xlink:href", "assets/eagle/sota/in.jpg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width2 * 0.2)

    staticBlock.append("image")
        .attr("xlink:href", "assets/eagle/sota/out.jpg")
        .attr("x", width2 * 0.8)
        .attr("y", 0)
        .attr("width", width2 * 0.2)

    const layer_list = []
    for (let i = 0; i < max_n_rings; i++) {
        layer_list.push(layers.append("rect")
            .attr("x", width2 * 0.9)
            .attr("y", 5)
            .attr("width", width2 * 0.05)
            .attr("height", width2 * 0.2 - 10)
            .attr("fill", "#FF8C00")
            .attr("stroke", "none")
            .attr("stroke-width", 2)
            .attr("rx", 2)
            .style("filter", "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.10))"))
    }

    const w_scale = d3.scaleLinear()
        .domain([0, max_n_rings])
        .range([width2 * 0.05, width2 * 0.001])

    function update_rect() {
        const start = width2 * 0.2
        const end = width2 * 0.8

        const w = w_scale(n_rings)


        for (let i = 0; i < layer_list.length; i++) {
            if (i <= n_rings) {
                layer_list[i].transition().duration(100)
                    .attr("x", start + (end - start) * (i + 1) / (n_rings + 2) - w / 2)
                    .attr("width", w)
            } else {
                layer_list[i].transition().duration(100)
                    .attr("x", width2 * 0.9)
            }
        }
    }

    update_rect()

    return {
        steps: [],
        onSlideEnter: () => {
        },
        onSlideLeave: () => {
        },
    }
}
