import * as d3 from "d3";

export function create(container, context) {

    var width = 1000;
    var height = 200;

    var p = {
        "encoder_pos": 0.25,
        "block_width": 0.15,
        "block_height": 0.3,
        "feature_size": 0.25,
        "feature_radius": 10,
    }

    var margins = {
        "left": 25,
        "right": 25,
        "top": 0,
        "bottom": 0
    }

    const graph_model = d3.select(container).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", [0, 0, width, height]);

    const model_inputs = graph_model.append("g")
    const model_encoder = graph_model.append("g")
    const model_dynamics = graph_model.append("g")
    const model_decoder = graph_model.append("g")
    const model_outputs = graph_model.append("g")
    const model_features = graph_model.append("g")


    const xScale_model = d3.scaleLinear()
        .domain([0, 1])
        .range([margins.left, width - margins.right])
    const yScale_model = d3.scaleLinear()
        .domain([0, 1])
        .range([margins.top, height - margins.bottom])

    const block_width = xScale_model(p.block_width)
    const block_height = yScale_model(p.block_height)

    const imgSize = yScale_model(0.4) - yScale_model(0.0);

    model_inputs.append("foreignObject")
        .attr("x", xScale_model(0))
        .attr("y", yScale_model(0.25) - imgSize / 2)
        .attr("width", imgSize)
        .attr("height", imgSize)
        .append("xhtml:video")
        .attr("src", "assets/cophy/dataset/BT-B.mp4")
        .attr("width", imgSize)
        .attr("autoplay", true)
        .attr("loop", true)
        .style("border", "solid 1px black")

    model_inputs.append("text")
        .attr("x", xScale_model(0))
        .attr("y", yScale_model(0.25) - imgSize / 2)
        .attr("dy", "1rem")
        .attr("dx", "0.2rem")
        .text("AB")
        .style("font-size", "1rem")

    model_inputs.append("foreignObject")
        .attr("x", xScale_model(0))
        .attr("y", yScale_model(0.75) - imgSize / 2)
        .attr("width", imgSize)
        .attr("height", imgSize)
        .append("xhtml:img")
        .attr("src", "assets/cophy/dataset/BT_C.jpg")
        .attr("width", imgSize)
        .style("border", "solid 1px black")
        .style("margin", 0);


    model_inputs.append("text")
        .attr("x", xScale_model(0))
        .attr("y", yScale_model(0.75) - imgSize / 2)
        .attr("dy", "1rem")
        .attr("dx", "0.2rem")
        .text("C")
        .style("font-size", "1rem")

    // ----------------------------------------------------
    // Encoder
    model_encoder.append("rect")
        .attr("x", xScale_model(p.encoder_pos) - block_width / 2)
        .attr("y", yScale_model(0.5) - block_height / 2)
        .attr("width", block_width)
        .attr("height", block_height)
        .attr("rx", 5)
        .attr("stroke-width", 2)
        .attr("stroke", "#277C9D")
        .style("fill", "#90bed0")
        .style("filter", "drop-shadow( 5px 5px 5px rgba(0, 0, 0, .7))");

    model_encoder.append("text")
        .attr("x", xScale_model(p.encoder_pos))
        .attr("y", yScale_model(0.5))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("Encoder")
        .style("font-size", yScale_model(0.1) + "px")
        .style("fill", "black")
        .style("font-family", "sans-serif");

    // ----------------------------------------------------
    // Dynamics

    model_dynamics.append("rect")
        .attr("x", xScale_model(2 * p.encoder_pos) - block_width / 2)
        .attr("y", yScale_model(0.5) - block_height / 2)
        .attr("width", block_width)
        .attr("height", block_height)
        .attr("rx", 5)
        .attr("stroke-width", 2)
        .attr("stroke", "#E77475")
        .style("fill", "#f1a4a4")
        .style("filter", "drop-shadow( 5px 5px 5px rgba(0, 0, 0, .7))");

    model_dynamics.append("text")
        .attr("x", xScale_model(2 * p.encoder_pos))
        .attr("y", yScale_model(0.5))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("Dynamics")
        .style("font-size", yScale_model(0.1) + "px")
        .style("fill", "black")
        .style("font-family", "sans-serif");

    // ----------------------------------------------------
    // Decoder

    model_decoder.append("rect")
        .attr("x", xScale_model(3 * p.encoder_pos) - block_width / 2)
        .attr("y", yScale_model(0.5) - block_height / 2)
        .attr("width", block_width)
        .attr("height", block_height)
        .attr("rx", 5)
        .attr("stroke-width", 2)
        .attr("stroke", "#598938")
        .style("fill", "#a0ce81")
        .style("filter", "drop-shadow( 5px 5px 5px rgba(0, 0, 0, .7))");

    model_decoder.append("text")
        .attr("x", xScale_model(3 * p.encoder_pos))
        .attr("y", yScale_model(0.5))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("Decoder")
        .style("font-size", yScale_model(0.1) + "px")
        .style("fill", "black")
        .style("font-family", "sans-serif");

    // ----------------------------------------------------
    // Outputs

    model_outputs.append("foreignObject")
        .attr("x", xScale_model(4 * p.encoder_pos) - yScale_model(0.7))
        .attr("y", yScale_model(0.5) - yScale_model(0.4) / 2)
        .attr("width", yScale_model(1))
        .attr("height", yScale_model(1))
        .append("xhtml:video")
        .attr("src", "assets/cophy/dataset/BT-D.mp4")
        .attr("width", yScale_model(0.4))
        .attr("autoplay", true)
        .attr("loop", true)
        .style("border", "solid 1px black");

    model_outputs.append("text")
        .attr("x", xScale_model(4 * p.encoder_pos) - yScale_model(0.3))
        .attr("y", yScale_model(0.5) - yScale_model(0.4) / 2 + 5)
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "hanging")
        .text("D")
        .style("font-size", yScale_model(0.1) + "px")
        .style("fill", "black")
        .style("font-family", "sans-serif");


    // ----------------------------------------------
    // Arrows

    // AB to encoder
    model_encoder.append("line")
        .attr("x1", xScale_model(0) + yScale_model(0.4))
        .attr("y1", yScale_model(0.4) / 2)
        .attr("x2", xScale_model(p.encoder_pos) - block_width / 2)
        .attr("y2", yScale_model(0.5) - block_height / 4)
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("marker-end", "url(#arrowhead)");

    // C to encoder
    model_encoder.append("line")
        .attr("x1", xScale_model(0) + yScale_model(0.4))
        .attr("y1", yScale_model(1) - yScale_model(0.4) / 2)
        .attr("x2", xScale_model(p.encoder_pos) - block_width / 2)
        .attr("y2", yScale_model(0.5) + block_height / 4)
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("marker-end", "url(#arrowhead)");

    // Encoder to dynamics
    model_dynamics.append("line")
        .attr("x1", xScale_model(p.encoder_pos) + block_width / 2)
        .attr("y1", yScale_model(0.5))
        .attr("x2", xScale_model(2 * p.encoder_pos) - block_width / 2)
        .attr("y2", yScale_model(0.5))
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("marker-end", "url(#arrowhead)");

    // Dynamics to decoder
    model_decoder.append("line")
        .attr("x1", xScale_model(2 * p.encoder_pos) + block_width / 2)
        .attr("y1", yScale_model(0.5))
        .attr("x2", xScale_model(3 * p.encoder_pos) - block_width / 2)
        .attr("y2", yScale_model(0.5))
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("marker-end", "url(#arrowhead)");


    // Decoder to D
    model_outputs.append("line")
        .attr("x1", xScale_model(3 * p.encoder_pos) + block_width / 2)
        .attr("y1", yScale_model(0.5))
        .attr("x2", xScale_model(4 * p.encoder_pos) - yScale_model(0.4))
        .attr("y2", yScale_model(0.5))
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("marker-end", "url(#arrowhead)");

    // Encoder to decoder (angle connector from below)
    model_features.append("path")
        .attr("d", "M " + (xScale_model(p.encoder_pos)) + " " + (yScale_model(0.5) + block_height / 2) +
            " L " + (xScale_model(p.encoder_pos)) + " " + (yScale_model(0.85)) +
            " L " + (xScale_model(3 * p.encoder_pos)) + " " + (yScale_model(0.85)) +
            " L " + (xScale_model(3 * p.encoder_pos)) + " " + (yScale_model(0.5) + block_height / 2)
        )
        .attr("stroke-width", 2)
        .attr("stroke", "black")
        .attr("fill", "none")
        .style("stroke-dasharray", ("3, 3"))
        .attr("marker-end", "url(#arrowhead)");

    // ------------------------------------------------
    // Features
    model_features.append("foreignObject")
        .attr("x", xScale_model(2 * p.encoder_pos) - yScale_model(3 * p.feature_size))
        .attr("y", yScale_model(0.85) - yScale_model(p.feature_size) / 2 - 5)
        .attr("width", yScale_model(1))
        .attr("height", yScale_model(1))
        .append("xhtml:img")
        .attr("src", "assets/cophy/model/background.jpg")
        .attr("width", yScale_model(p.feature_size))
        .style("border", "solid 1px black")
        .style("margin", 0);

    model_features.append("foreignObject")
        .attr("x", xScale_model(1.5 * p.encoder_pos) - yScale_model(p.feature_size) * 2)
        .attr("y", yScale_model(0.15))
        .attr("width", yScale_model(1))
        .attr("height", yScale_model(1))
        .append("xhtml:img")
        .attr("src", "assets/cophy/model/objects.jpg")
        .attr("width", yScale_model(p.feature_size))
        .style("border", "solid 1px black")
        .style("margin", 0);

    model_features.append("foreignObject")
        .attr("x", xScale_model(2.5 * p.encoder_pos) - yScale_model(p.feature_size) * 2)
        .attr("y", yScale_model(0.15))
        .attr("width", yScale_model(1))
        .attr("height", yScale_model(1))
        .append("xhtml:img")
        .attr("src", "assets/cophy/model/objects_final.jpg")
        .attr("width", yScale_model(p.feature_size))
        .style("border", "solid 1px black")
        .style("margin", 0);

    model_features.append("circle")
        .attr("cx", xScale_model(2 * p.encoder_pos) + p.feature_radius * 2)
        .attr("cy", yScale_model(0.85))
        .attr("r", p.feature_radius)
        .attr("stroke", "none")
        .style("fill", "#be1b00");

    model_features.append("circle")
        .attr("cx", xScale_model(2 * p.encoder_pos) + p.feature_radius * 4)
        .attr("cy", yScale_model(0.85))
        .attr("r", p.feature_radius)
        .attr("stroke", "none")
        .style("fill", "#1118bf");

    model_features.append("circle")
        .attr("cx", xScale_model(2 * p.encoder_pos) + p.feature_radius * 6)
        .attr("cy", yScale_model(0.85))
        .attr("r", p.feature_radius)
        .attr("stroke", "none")
        .style("fill", "#a0a000");

    model_features.append("circle")
        .attr("cx", xScale_model(2 * p.encoder_pos) + p.feature_radius * 8)
        .attr("cy", yScale_model(0.85))
        .attr("r", p.feature_radius)
        .attr("stroke", "none")
        .style("fill", "#259c00");

    model_features.append("text")
        .attr("x", xScale_model(p.encoder_pos))
        .attr("y", yScale_model(0.85) + 5)
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "hanging")
        .text("visual features")
        .style("font-size", yScale_model(0.07) + "px")
        .style("fill", "black")
        .style("font-family", "sans-serif")
        .style("font-style", "italic");

    model_features.append("text")
        .attr("x", xScale_model(1.5 * p.encoder_pos))
        .attr("y", yScale_model(0.15) - 5)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "baseline")
        .text("object-level repr.")
        .style("font-size", yScale_model(0.07) + "px")
        .style("fill", "black")
        .style("font-family", "sans-serif")
        .style("font-style", "italic");

    model_features.append("text")
        .attr("x", xScale_model(2.5 * p.encoder_pos))
        .attr("y", yScale_model(0.15) - 5)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "baseline")
        .text("object-level repr.")
        .style("font-size", yScale_model(0.07) + "px")
        .style("fill", "black")
        .style("font-family", "sans-serif")
        .style("font-style", "italic");

    // ------------------------------------------------
    // Arrows heads


    model_encoder.append("svg:defs").append("svg:marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("markerUnits", "userSpaceOnUse")
        .attr("orient", "auto")
        .attr("fill", "black")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    return {
        steps: [],
        onSlideEnter: () => {
        },
        onSlideLeave: () => {
        },
    }
}
