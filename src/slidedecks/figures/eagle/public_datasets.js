import * as d3 from "d3";

export function create(container, context) {

    const margin = {
        top: 100,
        right: 350,
        bottom: 200,
        left: 300,
        width: 1000,
        height: 500,
    };

    const graph = d3.select(container)
        .append("svg")
        .attr("viewBox", [0, 0, margin.width, margin.height])
        .append("g");

    const p = {
        radius: 7,
        strokeWidth: 2,
    }

    const points = {
        cylinder_flow: [9, 1],
        airfoil: [8.5, 3],
        vascular: [7.5, 2],
        scalarflow: [1, 8],
        jhtd: [0.5, 7.5],
        eagle: [6, 7],
    }

    const xScale = d3.scaleLinear()
        .domain([0, 10])
        .range([margin.left, margin.width - margin.right]);
    const yScale = d3.scaleLinear()
        .domain([0, 10])
        .range([margin.height - margin.bottom, margin.top]);

    const chart = graph.append("g");
    const cylinder_flow = graph.append("g").attr("visibility", "hidden")
    const airfoil = graph.append("g").attr("visibility", "hidden")
    const vascular = graph.append("g").attr("visibility", "hidden")
    const scalarflow = graph.append("g").attr("visibility", "hidden")
    const jhtd = graph.append("g").attr("visibility", "hidden")
    const eagle = graph.append("g").attr("visibility", "hidden")
    const pareto = graph.append("g").attr("visibility", "hidden")

    chart.append("g")
        .attr("transform", "translate(0," + (margin.height - margin.bottom) + ")")
        .call(d3.axisBottom(xScale).ticks(0));

    chart.append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(d3.axisLeft(yScale).ticks(0));

    chart.append("text")
        .attr("x", xScale(5))
        .attr("y", yScale(0) + 30)
        .attr("font-size", 30)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("Scale");

    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -yScale(5))
        .attr("y", xScale(0) - 30)
        .attr("font-size", 30)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text("Difficulty");

    chart.append("rect")
        .attr("x", xScale(0))
        .attr("y", yScale(10))
        .attr("width", xScale(10) - xScale(0))
        .attr("height", yScale(0) - yScale(10))
        .attr("fill", "#EFEFEF")
        .attr("opacity", 1);

// Add a grid
    chart.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + (margin.height - margin.bottom) + ")")
        .attr("opacity", 0.2)
        .call(d3.axisBottom(xScale)
            .tickSize(-margin.height + margin.top + margin.bottom)
            .tickFormat("")
            .ticks(10)
        )
    chart.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + margin.left + ",0)")
        .attr("opacity", 0.2)
        .call(d3.axisLeft(yScale)
            .tickSize(-margin.width + margin.left + margin.right)
            .tickFormat("")
            .ticks(10)
        )


    cylinder_flow.append("circle")
        .attr("cx", xScale(points.cylinder_flow[0]))
        .attr("cy", yScale(points.cylinder_flow[1]))
        .attr("r", p.radius)
        .attr("fill", "#598938")
        .attr("opacity", 1)
        .attr("stroke", "#314b1f")
        .attr("stroke-width", p.strokeWidth);

    airfoil.append("circle")
        .attr("cx", xScale(points.airfoil[0]))
        .attr("cy", yScale(points.airfoil[1]))
        .attr("r", p.radius)
        .attr("fill", "#598938")
        .attr("opacity", 1)
        .attr("stroke", "#314b1f")
        .attr("stroke-width", p.strokeWidth);

    vascular.append("circle")
        .attr("cx", xScale(points.vascular[0]))
        .attr("cy", yScale(points.vascular[1]))
        .attr("r", p.radius)
        .attr("fill", "#598938")
        .attr("opacity", 1)
        .attr("stroke", "#314b1f")
        .attr("stroke-width", p.strokeWidth);

    scalarflow.append("circle")
        .attr("cx", xScale(points.scalarflow[0]))
        .attr("cy", yScale(points.scalarflow[1]))
        .attr("r", p.radius)
        .attr("fill", "#E77475")
        .attr("opacity", 1)
        .attr("stroke", "#733a3b")
        .attr("stroke-width", p.strokeWidth);

    jhtd.append("circle")
        .attr("cx", xScale(points.jhtd[0]))
        .attr("cy", yScale(points.jhtd[1]))
        .attr("r", p.radius)
        .attr("fill", "#E77475")
        .attr("opacity", 1)
        .attr("stroke", "#733a3b")
        .attr("stroke-width", p.strokeWidth);

    eagle.append("circle")
        .attr("cx", xScale(points.eagle[0]))
        .attr("cy", yScale(points.eagle[1]))
        .attr("r", p.radius)
        .attr("fill", "#277C9D")
        .attr("opacity", 1)
        .attr("stroke", "#123a49")
        .attr("stroke-width", p.strokeWidth);

    pareto.append("path")
        .attr("id", "pareto")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 3)
        .attr("opacity", 0.5)
        .attr("d", "M" + xScale(0) + "," + yScale(9.5) + " L" + xScale(10) + "," + yScale(2.5))
        .attr("stroke-dasharray", "5,5");
    pareto.append("text")
        .append("textPath")
        .attr("xlink:href", "#pareto")
        .attr("startOffset", "50%")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "text-bottom")
        .attr("font-size", 30)
        .attr("fill", "black")
        .attr("opacity", 0.5)
        .text("↑ ↑ ↑ Pareto frontier ↑ ↑ ↑");


    // VIDEOS
    const root = "assets/eagle/public_datasets/"
    const video_cylinder = cylinder_flow.append("foreignObject")
        .attr("x", margin.width - 450)
        .attr("y", margin.height - 150)
        .attr("width", 450)
        .attr("height", 150)
        .style("display", "flex");

    video_cylinder.append("xhtml:video")
        .attr("class", "theorem_content")
        .attr("width", 400)
        .attr("height", 104)
        .attr("src", root + "cylinder.mp4")
        .attr("autoplay", "true")
        .attr("loop", "loop")
        .attr("muted", "muted")

    var video_airfoil = airfoil.append("foreignObject")
        .attr("x", margin.width - 200 - 50)
        .attr("y", 30)
        .attr("width", 450)
        .attr("height", 250)
        .style("display", "flex");

    video_airfoil.append("xhtml:video")
        .attr("class", "theorem_content")
        .attr("width", 400 / 3)
        .attr("height", 306 / 3)
        .attr("src", root + "airfoil.mp4")
        .attr("autoplay", "true")
        .attr("loop", "loop")
        .attr("muted", "muted")

    var video_vascular = vascular.append("foreignObject")
        .attr("x", margin.width - 200 - 50)
        .attr("y", margin.height / 2 - 100 + 25 + 30)
        .attr("width", 450)
        .attr("height", 250)
        .style("display", "flex");

    video_vascular.append("xhtml:video")
        .attr("class", "theorem_content")
        .attr("width", 400 / 3)
        .attr("height", 294 / 3)
        .attr("src", root + "vascular.mp4")
        .attr("autoplay", "true")
        .attr("loop", "loop")
        .attr("muted", "muted")
        .on("loadedmetadata", function (e) {
            this.playbackRate = 5;
        });

    var video_scalarflow = scalarflow.append("foreignObject")
        .attr("x", 0)
        .attr("y", 30)
        .attr("width", 375)
        .attr("height", 275)
        .style("display", "flex");

    video_scalarflow.append("xhtml:img")
        .attr("class", "theorem_content")
        .attr("width", 375 / 2)
        .attr("height", 275 / 2)
        .attr("src", root + "scalar.gif")
        .attr("autoplay", "true")
        .attr("loop", "loop")
        .attr("muted", "muted")

    var video_jhtd = jhtd.append("foreignObject")
        .attr("x", 0)
        .attr("y", margin.height / 2 - 50 + 25 + 30)
        .attr("width", 450)
        .attr("height", 250)
        .style("display", "flex");

    video_jhtd.append("xhtml:video")
        .attr("class", "theorem_content")
        .attr("width", 400 / 2)
        .attr("height", 226 / 2)
        .attr("src", root + "jhtd.mp4")
        .attr("autoplay", "true")
        .attr("loop", "loop")
        .attr("muted", "muted")
        //play it faster
        .on("loadedmetadata", function (e) {
            this.playbackRate = 5;
        });


    eagle.append("foreignObject")
        .attr("x", xScale(points.eagle[0]) + p.radius)
        .attr("y", yScale(points.eagle[1]) - p.radius - 60)
        .attr("width", 40)
        .attr("height", 100)
        .append("xhtml:img")
        .attr("width", 40)
        .attr("height", 40)
        .attr("src", root + "eagle.ico")


// Titles
    cylinder_flow.append("foreignObject")
        .attr("x", margin.width - 400 - 50)
        .attr("y", margin.height - 100 - 50 - 30)
        .attr("width", 200)
        .attr("height", 30)
        .append("xhtml:div")
        .attr("class", "theorem_title")
        .style("width", "150px")
        .style("background-color", "#598938")
        .style("height", "28px")
        .style("font-family", "sans-serif")
        .html("Cylinder flow [1]");

    airfoil.append("foreignObject")
        .attr("x", margin.width - 200 - 50)
        .attr("y", 0)
        .attr("width", 200)
        .attr("height", 30)
        .append("xhtml:div")
        .attr("class", "theorem_title")
        .style("width", "100px")
        .style("height", "28px")
        .style("font-family", "sans-serif")
        .style("background-color", "#598938")
        .html("Airfoil [1]");

    vascular.append("foreignObject")
        .attr("x", margin.width - 200 - 50)
        .attr("y", margin.height / 2 - 100 + 25)
        .attr("width", 200)
        .attr("height", 30)
        .append("xhtml:div")
        .attr("class", "theorem_title")
        .style("width", "125px")
        .style("height", "28px")
        .style("background-color", "#598938")
        .style("font-family", "sans-serif")
        .html("Vascular [2]");

    scalarflow.append("foreignObject")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 200)
        .attr("height", 30)
        .append("xhtml:div")
        .attr("class", "theorem_title")
        .style("width", "150px")
        .style("height", "28px")
        .style("background-color", "#E77475")
        .style("font-family", "sans-serif")
        .html("ScalarFlow [3]");

    jhtd.append("foreignObject")
        .attr("x", 0)
        .attr("y", margin.height / 2 - 50 + 25)
        .attr("width", 200)
        .attr("height", 30)
        .append("xhtml:div")
        .attr("class", "theorem_title")
        .style("width", "150px")
        .style("height", "28px")
        .style("font-family", "sans-serif")
        .style("background-color", "#E77475")
        .html("JHTD [4]");


// ARROWS
    cylinder_flow.append("line")
        .attr("x1", xScale(points.cylinder_flow[0]))
        .attr("y1", yScale(points.cylinder_flow[1]))
        .attr("x2", parseFloat(video_cylinder.attr("x")) + 200)
        .attr("y2", video_cylinder.attr("y") - 10)
        .attr("stroke", "#598938")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrow)");

    airfoil.append("line")
        .attr("x1", xScale(points.airfoil[0]))
        .attr("y1", yScale(points.airfoil[1]))
        .attr("x2", parseFloat(video_airfoil.attr("x")) - 15)
        .attr("y2", parseFloat(video_airfoil.attr("y")) + 75)
        .attr("stroke", "#598938")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrow)");

    vascular.append("line")
        .attr("x1", xScale(points.vascular[0]))
        .attr("y1", yScale(points.vascular[1]))
        .attr("x2", parseFloat(video_vascular.attr("x")) - 20)
        .attr("y2", parseFloat(video_vascular.attr("y")) + 50)
        .attr("stroke", "#598938")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrow)");

    scalarflow.append("line")
        .attr("x1", xScale(points.scalarflow[0]))
        .attr("y1", yScale(points.scalarflow[1]))
        .attr("x2", parseFloat(video_scalarflow.attr("x")) + 225)
        .attr("y2", parseFloat(video_scalarflow.attr("y")) + 75)
        .attr("stroke", "#E77475")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrowred)");

    jhtd.append("line")
        .attr("x1", xScale(points.jhtd[0]))
        .attr("y1", yScale(points.jhtd[1]))
        .attr("x2", parseFloat(video_jhtd.attr("x")) + 230)
        .attr("y2", parseFloat(video_jhtd.attr("y")) + 60)
        .attr("stroke", "#E77475")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrowred)");


    var defs = graph.append("defs");
    defs.append("marker")
        .attr("id", "arrow")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 0)
        .attr("refY", 3)
        .attr("orient", "auto")
        .attr("markerUnits", "strokeWidth")
        .append("path")
        .attr("d", "M0,0 L0,6 L6,3 z")
        .attr("fill", "#598938");

    defs.append("marker")
        .attr("id", "arrowred")
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("refX", 0)
        .attr("refY", 3)
        .attr("orient", "auto")
        .attr("markerUnits", "strokeWidth")
        .append("path")
        .attr("d", "M0,0 L0,6 L6,3 z")
        .attr("fill", "#E77475");

    function toggle_green_on() {
        cylinder_flow.attr("visibility", "visible")
        airfoil.attr("visibility", "visible")
        vascular.attr("visibility", "visible")
    }

    function toggle_green_off() {
        cylinder_flow.attr("visibility", "hidden")
        airfoil.attr("visibility", "hidden")
        vascular.attr("visibility", "hidden")
    }

    function toggle_red_on() {
        scalarflow.attr("visibility", "visible")
        jhtd.attr("visibility", "visible")
    }

    function toggle_red_off() {
        scalarflow.attr("visibility", "hidden")
        jhtd.attr("visibility", "hidden")
    }

    function toggle_eagle_on() {
        toggle_red_on()
        toggle_green_on()
        pareto.attr("visibility", "visible")
        eagle.attr("visibility", "visible")
    }

    function toggle_eagle_off() {
        pareto.attr("visibility", "hidden")
        eagle.attr("visibility", "hidden")
    }


    return {
        steps:[
            {
                index: 0,
                forward: toggle_green_on,
                backward: toggle_green_off,
            },
            {
                index: 1,
                forward: toggle_red_on,
                backward: toggle_red_off,
            },
            {
                index: 2,
                forward: toggle_eagle_on,
                backward: toggle_eagle_off,
            }
        ],
        onSlideEnter: () =>{
            toggle_green_off();
            toggle_green_off();
            toggle_green_off();
        },
        onSlideLeave: () =>{
            toggle_green_off();
            toggle_green_off();
            toggle_green_off();
        }
    }
}
