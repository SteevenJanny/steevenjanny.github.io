import * as d3 from "d3";

const innerHTMLContent = `
<div id="model"></div>
<div class="row fs-6">
    <div class="col-6" id="math">
        <div id="encoder">
            <p class="fw-bold" style="margin:10px">Encoder</p>
            <p>$\\left\\{\\begin{array}{l}
            {\\textcolor{#277C9D}{\\eta_i^1}} = \\phi_{\\text{node}}(v_i, x_i, n_i) \\\\
            {\\textcolor{#E77475} {e_{ij}^1}} = \\phi_{\\text{edge}}( x_i, x_j, \\|x_i - x_j\\|) \\\\
            \\end{array}\\right.
            \\left\\{\\begin{array}{l}
            {\\textcolor{#E77475} {e_{ij}^{\\ell+1}}} = \\psi_{\\text{edge}}^\\ell({\\textcolor{#277C9D} {\\eta_i^\\ell} },
            {\\textcolor{#277C9D} {\\eta_j^\\ell} }, {\\textcolor{#E77475} {e_{ij}^{\\ell}}}) \\\\
            {\\textcolor{#277C9D} {\\eta_i^{\\ell+1}} } = \\psi_{\\text{node}}^\\ell ( {\\textcolor{#277C9D} {\\eta_i^\\ell} },
            {\\textcolor{#E77475} { e_{ij}^{\\ell+1} } }) \\\\
            \\end{array}\\right.
            $
            </p>
        </div>
        <div id="graph-pooling">
            <p class="fw-bold" style="margin:10px">Graph Pooling</p>
            $h_k^{n+1} = \\text{GRU}({\\textcolor{#277C9D} {\\eta_i^L} }, h_k^n), i \\in \\mathcal{C}_k, \\quad
            {\\textcolor{#598938} {w_k^1} } = \\phi_\\text{cluster}(h^N_k)$
        </div>
        <div id="transformer">
            <p class="fw-bold" style="margin:10px">Transformer</p>
            $ {\\textcolor{#598938} {w_k^{m+1}} } = \\text{MHA}(Q{=} {\\textcolor{#598938} {w_k^m}, K{=}V{=} [
            {\\textcolor{#598938} {w_1^m} } }, ... {\\textcolor{#598938} {w_K^m} }]) $$
        </div>
        <div id="decoder">
            <p class="fw-bold" style="margin:10px">Decoder</p>
            $ \\left\\{\\begin{array}{l}
            \\hat{v}^{t+1} = v^t + {\\textcolor{#FF8C00} {\\delta_v}} \\\\
            \\hat{p}^{t+1} = p^t + {\\textcolor{#FF8C00} {\\delta_p}}
            \\end{array}\\right. , \\quad {\\textcolor{#FF8C00} {(\\delta_v, \\delta_p)}} = \\text{GNN}({\\textcolor{#277C9D}
            {\\eta_i^L} }, {\\color{#598938} {w_k^{M}} })$
        </div>

    </div>
    <div class="col-6" id="animation"></div>
</div>
`

export function create(container, context) {

    container.innerHTML = innerHTMLContent;

    const radius = 4;
    const height_ratio = 0.6;
    const transition_duration = 250;
    const message_radius = 3;
    const N_messages = 250;
    const cluster_radius = 15;

    const encoder = d3.select("#encoder")
    const graph_pooling = d3.select("#graph-pooling")
    const transformer = d3.select("#transformer")
    const decoder = d3.select("#decoder")

    encoder.style("opacity", 0)
    graph_pooling.style("opacity", 0)
    transformer.style("opacity", 0)
    decoder.style("opacity", 0)

    const margin = {top: 10, right: 0, bottom: 10, left: 10, width: 1000, height: 500};

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const jet = d3.scaleSequential(d3.interpolateTurbo).domain([0, 1]);

    const model = d3.select("#model").append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", [0, 0, margin.width, margin.height * (1 - height_ratio)])

    var animation = d3.select("#animation").append("svg")
        .style("margin.height", "100%")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", [0, 0, 400, 400])

    var selector = model.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("margin.width", 110)
        .attr("margin.height", margin.height * (1 - height_ratio))
        .attr("fill", "rgb(255, 234, 201)")
        .attr("rx", 10)

    const g_pooling = animation.append("g")
    const g_edges = animation.append("g")
    const g_nodes = animation.append("g")
    const g_transformer = animation.append("g")
    const g_clusters = animation.append("g")
    const g_messages = animation.append("g")


    var y_scale = d3.scaleLinear()
        .domain([0, 1])
        .range([300 - margin.bottom, margin.top])

    const l = margin.height * height_ratio - margin.bottom - margin.top;
    var x_scale = d3.scaleLinear()
        .domain([0, 1])
        .range([margin.left, l + margin.left])

    var line = d3.line()
        .x(function (d) {
            return x_scale(nodes[d][0])
        })
        .y(function (d) {
            return y_scale(nodes[d][1])
        })


    // load svg
    d3.xml("assets/eagle/model/model.svg").then(function (data) {
        model.node().append(data.documentElement);
    });

    var nodes = [];
    var edges = [];
    var clusters = [];
    var U = [];
    var N_clusters = 15;
    var cluster_centers = []


    for (var i = 0; i < 20; i++) {
        g_pooling.append("line")
            .attr("x1", x_scale(1.2))
            .attr("y1", y_scale(i / 20))
            .attr("x2", x_scale(1) + cluster_radius / 2)
            .attr("y2", y_scale(0.5) + cluster_radius / 2)
            .attr("stroke", "black")
            .attr("stroke-margin.width", 1)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0)
    }

    var triangle = d3.symbol().type(d3.symbolTriangle).size(100)
    var blues = d3.scaleSequential(d3.interpolateBlues).domain([0, 1])

    g_transformer.append("circle")
        .attr("cx", x_scale(0.5))
        .attr("cy", y_scale(0.5))
        .attr("r", 30)
        .attr("fill", "white")
        .attr("stroke", "black")
        .attr("stroke-margin.width", 2)

    g_transformer.append("text")
        .attr("x", x_scale(0.5))
        .attr("y", y_scale(0.5))
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .attr("font-size", 40)
        .text("Σ")

    g_transformer.append("line")
        .attr("x1", x_scale(0.5) - 30)
        .attr("y1", y_scale(0.5))
        .attr("x2", x_scale(0))
        .attr("y2", y_scale(0.5))
        .attr("stroke", "black")
        .attr("stroke-margin.width", 2)


    for (var i = 0; i < N_clusters; i++) {
        // Draw triangle
        const g = g_transformer.append("g").attr("class", "cluster cluster_" + i)
        const random_color = d3.randomUniform(0, 1)()
        g.append("line")
            .attr("x1", x_scale(0.8))
            .attr("y1", y_scale(i / N_clusters))
            .attr("x2", x_scale(1))
            .attr("y2", y_scale(i / N_clusters))
            .attr("stroke", blues(random_color))
            .attr("stroke-margin.width", 3)

        g.append("line")
            .attr("x1", x_scale(0.8) - 10)
            .attr("y1", y_scale(i / N_clusters))
            .attr("x2", x_scale(0.5) + 30)
            .attr("y2", y_scale(0.5))
            .attr("stroke", blues(random_color))
            .attr("stroke-margin.width", 2)

        g.append("path")
            .attr("transform", "translate(" + x_scale(0.8) + "," + y_scale(i / N_clusters) + ") rotate(-90)")
            .attr("d", triangle)
            .attr("fill", blues(random_color))
            .attr("stroke", "black")
            .attr("stroke-margin.width", 2)

        g.attr("opacity", 0)
    }
    g_transformer.attr("opacity", 0)


    d3.json("assets/eagle/model/data.json").then(function (data) {
        nodes = data.pointcloud;
        edges = data.edges;
        clusters = data.cluster_id;
        U = data.color

        g_edges.selectAll("path")
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
            .attr("stroke-margin.width", 1)

        g_nodes.selectAll("circle").data(nodes)
            .enter()
            .append("circle")
            .attr("class", (d, i) => {
                return `cluster_${clusters[i]}`
            })
            .attr("id", (d, i) => {
                return `node_${i}`
            })
            .attr("cx", d => {
                return x_scale(d[0])
            })
            .attr("cy", function (d) {
                return y_scale(d[1])
            })
            .attr("r", radius)
            .attr("fill", function (d, i) {
                return jet(U[i])
            })
            .attr("cluster", function (d, i) {
                return clusters[i]
            })
            .attr("u", function (d, i) {
                return U[i]
            })
            .attr("stroke", "none")

        const cluster_int = [];
        for (let i = 0; i < clusters.length; i++) {
            cluster_int.push(parseInt(clusters[i]))
        }
        clusters = cluster_int
        N_clusters = d3.max(clusters) + 1

        for (var i = 0; i < d3.max(clusters) + 1; i++) {
            cluster_centers.push([0., 0.])
        }
        for (var i = 0; i < nodes.length; i++) {
            cluster_centers[clusters[i]][0] += parseFloat(nodes[i][0])
            cluster_centers[clusters[i]][1] += parseFloat(nodes[i][1])
        }
        for (var i = 0; i < cluster_centers.length; i++) {
            cluster_centers[i][0] /= 20
            cluster_centers[i][1] /= 20
        }

        g_clusters.selectAll("rect")
            .data(cluster_centers)
            .enter()
            .append("rect")
            .attr("class", function (d, i) {
                return "cluster_" + i
            })
            .attr("x", function (d) {
                return x_scale(d[0]) - cluster_radius / 2
            })
            .attr("y", function (d) {
                return y_scale(d[1]) - cluster_radius / 2
            })
            .attr("width", cluster_radius)
            .attr("height", cluster_radius)
            .attr("fill", function (d, i) {
                return color(i)
            })
            .attr("stroke", "black")

        g_clusters.style("opacity", 0)

    });

    var current_cluster = -1;

    function align_cluster_centers() {
        current_cluster += 1
        if (current_cluster >= N_clusters) {
            current_cluster = 0
        }
        g_clusters.selectAll("rect")
            .transition()
            .duration(transition_duration)
            .attr("x", x_scale(1))
            .attr("y", function (d, i) {
                return y_scale(i / N_clusters) - cluster_radius / 2
            })
            .on("end", function () {
                g_clusters.selectAll(".cluster_" + current_cluster)
                    .transition()
                    .duration(transition_duration * 2)
                    .attr("x", x_scale(0))
                    .attr("y", y_scale(0.5) - cluster_radius / 2)
                    .on("end", function () {
                        g_transformer.selectAll(".cluster")
                            .attr("opacity", 1)
                            .selectAll("line")
                            .attr("stroke", color(current_cluster))
                            .attr("opacity", function () {
                                return Math.random()
                            })
                        g_transformer.selectAll(".cluster")
                            .select("path")
                            .attr("fill", color(current_cluster))
                        g_transformer.selectAll(".cluster_" + current_cluster)
                            .attr("opacity", 0)
                        g_transformer.attr("opacity", 1)
                        setTimeout(function () {
                            g_transformer.attr("opacity", 0)
                        }, transition_duration * 4)
                    })
            })

    }

    function project_back() {
        reset_cluster_position()
        g_clusters.transition()
            .duration(transition_duration)
            .style("opacity", 1)
    }

    function reset_cluster_position() {
        g_transformer.attr("opacity", 0)
        g_clusters.selectAll("rect").transition().duration(transition_duration)
            .attr("x", function (d) {
                return x_scale(d[0]) - cluster_radius / 2
            })
            .attr("y", function (d) {
                return y_scale(d[1]) - cluster_radius / 2
            })
    }

    function send_message(edge_id) {
        var edge = edges[edge_id]
        var node1 = nodes[edge[0]]
        var node2 = nodes[edge[1]]
        g_messages.append("circle")
            .attr("cx", x_scale(node1[0]))
            .attr("cy", y_scale(node1[1]))
            .attr("r", message_radius)
            .attr("fill", "red")
            .attr("stroke", "none")
            .transition()
            .duration(transition_duration)
            .ease(d3.easeLinear)
            .attr("cx", x_scale(node2[0]))
            .attr("cy", y_scale(node2[1]))
            .remove()
    }

    function message_passing() {
        if (nodes.length === 0) {
            return
        }
        for (var i = 0; i < N_messages; i++) {
            // Select a random edge
            var edge_id = Math.floor(Math.random() * edges.length);
            // wait for a random time
            var wait_time = Math.random() * 1000;
            setTimeout(function (edge_id) {
                send_message(edge_id)
            }, wait_time, edge_id)

        }
    }

    function unroll_graphPooling() {
        g_nodes.selectAll(".cluster_0").transition().duration(1000)
            .attr("cx", x_scale(1.2))
            .attr("cy", function (d, i) {
                return y_scale(i / 20)
            })
        g_clusters.selectAll(".cluster_0").transition().duration(1000)
            .attr("x", x_scale(1))
            .attr("y", function (d) {
                return y_scale(0.5)
            })
        g_pooling.selectAll("line").transition().duration(1000)
            .attr("opacity", 1)

    }


    function roll_graphPooling() {
        g_nodes.selectAll(".cluster_0").transition().duration(1000)
            .attr("cx", function (d) {
                return x_scale(d[0])
            })
            .attr("cy", function (d) {
                return y_scale(d[1])
            })
        g_clusters.selectAll(".cluster_0").transition().duration(1000)
            .attr("x", function (d) {
                return x_scale(d[0]) - cluster_radius / 2
            })
            .attr("y", function (d) {
                return y_scale(d[1]) - cluster_radius / 2
            })
        g_pooling.selectAll("line").transition().duration(1000)
            .attr("opacity", 0)
    }

    var interval;

    function start_message_passing() {
        message_passing()
        interval = setInterval(message_passing, 1000)
    }

    function stop_message_passing() {
        clearInterval(interval)
        g_messages.selectAll("circle").remove()
    }

    function show_clusters() {
        g_nodes.selectAll("circle")
            .transition()
            .duration(transition_duration)
            .attr("fill", function (d, i) {
                return color(clusters[i])
            })
    }

    function show_u() {
        g_nodes.selectAll("circle")
            .transition()
            .duration(transition_duration)
            .attr("fill", function (d, i) {
                return jet(U[i])
            })
        g_clusters.transition().duration(transition_duration)
            .style("opacity", 0)
    }

    function hide_node() {
        g_nodes.transition().duration(transition_duration)
            .attr("opacity", 0.05)
        g_edges.transition().duration(transition_duration)
            .attr("opacity", 0.05)
    }

    function show_node() {
        g_nodes.transition().duration(transition_duration)
            .attr("opacity", 1)
        g_edges.transition().duration(transition_duration)
            .attr("opacity", 1)
    }

    function step1_forward() {
        start_message_passing()
        selector.transition()
            .duration(transition_duration)
            .attr("x", 110)
            .attr("margin.width", 165)
        encoder.transition()
            .duration(transition_duration)
            .style("opacity", 1)
    }

    function step1_backward() {
        stop_message_passing()
        selector.transition()
            .duration(transition_duration)
            .attr("x", 0)
            .attr("margin.width", 110)
        encoder.transition()
            .duration(transition_duration)
            .style("opacity", 0)
    }

    function step2_forward() {
        stop_message_passing()
        show_clusters()
    }

    function step2_backward() {
        show_u()
        start_message_passing()
    }

    function step3_forward() {
        g_clusters.transition().duration(transition_duration)
            .style("opacity", 1)
        unroll_graphPooling()
        selector.transition()
            .duration(transition_duration)
            .attr("x", 275)
            .attr("y", 50)
            .attr("margin.width", 210)
            .attr("margin.height", 150)

        encoder.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        graph_pooling.transition()
            .duration(transition_duration)
            .style("opacity", 1)
    }

    function step3_backward() {
        g_clusters.transition().duration(transition_duration)
            .style("opacity", 0)
        roll_graphPooling()
        selector.transition()
            .duration(transition_duration)
            .attr("x", 110)
            .attr("y", 0)
            .attr("margin.width", 165)
            .attr("margin.height", margin.height * (1 - height_ratio))
        encoder.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        graph_pooling.transition()
            .duration(transition_duration)
            .style("opacity", 0)
    }

    function step4_forward() {
        roll_graphPooling()
        hide_node()
    }

    function step4_backward() {
        unroll_graphPooling()
        show_node()
    }

    function step5_forward() {
        align_cluster_centers()
        interval = setInterval(align_cluster_centers, 2000)
        selector.transition()
            .duration(transition_duration)
            .attr("x", 480)
            .attr("margin.width", 180)

        encoder.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        graph_pooling.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        transformer.transition()
            .duration(transition_duration)
            .style("opacity", 1)
    }

    function step5_backward() {
        reset_cluster_position()
        clearInterval(interval)
        selector.transition()
            .duration(transition_duration)
            .attr("x", 275)
            .attr("margin.width", 210)
        encoder.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        graph_pooling.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        transformer.transition()
            .duration(transition_duration)
            .style("opacity", 0)
    }

    function step6_forward() {
        clearInterval(interval)
        project_back()
        selector.transition()
            .duration(transition_duration)
            .attr("x", 660)
            .attr("margin.width", 190)
        encoder.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        graph_pooling.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        transformer.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        decoder.transition()
            .duration(transition_duration)
            .style("opacity", 1)
    }

    function step6_backward() {
        g_clusters.transition()
            .duration(transition_duration)
            .style("opacity", 1)

        show_clusters()
        hide_node()
        // align_cluster_centers()
        interval = setInterval(align_cluster_centers, 2000)
        selector.transition()
            .duration(transition_duration)
            .attr("x", 480)
            .attr("margin.width", 180)

        encoder.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        graph_pooling.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        transformer.transition()
            .duration(transition_duration)
            .style("opacity", 1)
        decoder.transition()
            .duration(transition_duration)
            .style("opacity", 0)

    }

    function step7_forward() {
        show_node()
        show_u()
    }

    function step7_backward() {
        hide_node()
        show_clusters()
        g_clusters.transition()
            .duration(transition_duration)
            .style("opacity", 1)
    }
    return {
        steps: [
            {index: 0, forward: step1_forward, backward: step1_backward},
            {index: 1, forward: step2_forward, backward: step2_backward},
            {index: 2, forward: step3_forward, backward: step3_backward},
            {index: 3, forward: step4_forward, backward: step4_backward},
            {index: 4, forward: step5_forward, backward: step5_backward},
            {index: 5, forward: step6_forward, backward: step6_backward},
            {index: 6, forward: step7_forward, backward: step7_backward}
        ],
        onSlideEnter: () => {
            step7_backward()
            step6_backward()
            step5_backward()
            step4_backward()
            step3_backward()
            step2_backward()
            step1_backward()
        },
        onSlideLeave: () => {

            step7_backward()
            step6_backward()
            step5_backward()
            step4_backward()
            step3_backward()
            step2_backward()
            step1_backward()
        }
    }

}
