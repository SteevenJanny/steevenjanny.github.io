var width_graph = document.getElementById("vanderpol_graph").offsetWidth
var height_graph = document.getElementById("vanderpol_graph").offsetHeight

var graph = d3.select("#vanderpol_graph").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0, 0, width_graph, height_graph]);

var initial_state = {x: 0.1, y: 0.1};
var dt = 0.05;
var T = 200;
var plot_delay = 20;

function f(state) {
    var x = state.x;
    var y = state.y;
    var dx = y;
    var dy = -x + (1 - x * x) * y;
    return {x: dx, y: dy};
}

function euler(state) {
    var k1 = f(state);
    return {
        x: state.x + dt * k1.x,
        y: state.y + dt * k1.y
    };
}

var states = [initial_state];
var graph_margin = {
    top: 10,
    right: 10,
    bottom: 35,
    left: 25
};

var xScale_graph = d3.scaleLinear()
    .domain([0, T * dt])
    .range([graph_margin.left, width_graph - graph_margin.right]);
var yScale_graph = d3.scaleLinear()
    .domain([-4, 4])
    .range([height_graph - graph_margin.bottom, graph_margin.top]);

// Plot the axis
var xAxis_graph = d3.axisBottom(xScale_graph);
var yAxis_graph = d3.axisLeft(yScale_graph);


var plot_xaxis_graph = graph.append("g")
    .attr("transform", "translate(0," + (height_graph - graph_margin.bottom) + ")")
    .call(xAxis_graph)
    .style("opacity", 0);
var plot_yaxis_graph = graph.append("g")
    .attr("transform", "translate(" + graph_margin.left + ",0)")
    .call(yAxis_graph)
    .style("opacity", 0);


var line_x = d3.line()
    .x(function (d, i) {
        return xScale_graph(i * dt);
    })
    .y(function (d) {
        return yScale_graph(d.x);
    });

var line_y = d3.line()
    .x(function (d, i) {
        return xScale_graph(i * dt);
    })
    .y(function (d) {
        return yScale_graph(d.y);
    });

graph.append("path")
    .attr("id", "x_path")
    .datum(states)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", line_x);

graph.append("path")
    .attr("id", "y_path")
    .datum(states)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("d", line_y);

// Add a legend
var graph_xlabel = graph.append("text")
    .style("opacity", 0)
    .attr("x", (width_graph / 2))
    .attr("y", (height_graph))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Time");

// Add a title
var graph_title = graph.append("text")
    .style("opacity", 0)
    .attr("x", (width_graph / 2))
    .attr("y", (graph_margin.top + 5))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Time series");

// Run the simulation and update the graph
var i = 0;

function update() {
    if (i < T) {
        var state = euler(states[states.length - 1]);
        states.push(state);
        i++;
        graph.select("#x_path")
            .datum(states)
            .attr("d", line_x);
        graph.select("#y_path")
            .datum(states)
            .attr("d", line_y);
    } else {
        initial_state = {x: 8 * Math.random() - 4, y: 8 * Math.random() - 4};
        states = [initial_state];
        i = 0;
    }
}

function idle() {
    states = [initial_state];
    i = 0;
    graph.select("#x_path")
        .datum(states)
        .attr("d", line_x);
    graph.select("#y_path")
        .datum(states)
        .attr("d", line_y);

    plot_yaxis_graph.style("opacity", 0);
    plot_xaxis_graph.style("opacity", 0);
    graph_xlabel.style("opacity", 0);
    graph_title.style("opacity", 0);
}


var interval;

function return_to_idle() {
    clearInterval(interval)
    idle()
}

function run_simulation() {
    graph_xlabel.transition(1000).style("opacity", 1);
    graph_title.transition(1000).style("opacity", 1);
    plot_yaxis_graph.transition(1000).style("opacity", 1);
    plot_xaxis_graph.transition(1000).style("opacity", 1);
    interval = setInterval(update, plot_delay);
}

var _transitions = [
    {
        transitionForward: () => run_simulation(),
        transitionBackward: () => return_to_idle(),
        index: 3
    },
    // {
    //     transitionForward: () => shufleColorAndResize(10, 0.1, 6),
    //     index: 1
    // },
]


function windowResized() {
    document.getElementById("row1").style.height = "40vh"
    document.getElementById("row2").style.height = "40vh"

    width_graph = document.getElementById("vanderpol_graph").offsetWidth
    height_graph = document.getElementById("vanderpol_graph").offsetHeight


    graph.attr("width", width_graph)
    graph.attr("height", height_graph)

}

window.addEventListener('resize', windowResized);