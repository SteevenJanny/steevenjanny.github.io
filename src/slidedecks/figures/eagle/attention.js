import * as d3 from "d3";
import {sliderBottom} from "d3-simple-slider";

const innerHTMLContent = `

<div class="row text-center">
    <div class="col-9">
        <div id="my_dataviz"></div>
        <div id="slider-step"><p>Timestep: </p></div>
    </div>
    <div class="col" style="font-size: 12px">
        <div class="d-flex flex-column align-items-center">
            <p class="m-0">First Attention Layer, Head #3</p>
            <div id="attention_1" style="text-align:center;width:90%;margin:auto;"></div>
            <p class="m-0">Second Attention Layer, Head #1</p>
            <div id="attention_2" style="text-align:center;width:90%;margin:auto"></div>
            <p class="m-0">Third Attention Layer, Head #3</p>
            <div id="attention_3" style="text-align:center;width:90%;margin:auto"></div>
            <p class="m-0">Fourth Attention Layer, Head #2</p>
            <div id="attention_4" style="text-align:center;width:90%;margin:auto"></div>
        </div>
    </div>

</div>
`

export function create(container, context) {
    container.innerHTML = innerHTMLContent;
    const margin = {top: 0, right: 0, bottom: 0, left: 0},
        width = 900 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;
    var rect_cluster_size = 15;

    let selected = 0;

    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        // .attr("width", width )
        // .attr("height", height)
        .style("margin", "auto")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .style("display", "block")
        .style("margin", "auto");

    var svg_attention_1 = d3.select(container).select("#attention_1")
        .append("svg")
        .attr("viewBox", [0, 0, width / 2, height / 2])
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .style("margin", "auto");
    var svg_attention_2 = d3.select(container).select("#attention_2")
        .append("svg")
        .attr("viewBox", [0, 0, width / 2, height / 2])
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    var svg_attention_3 = d3.select(container).select("#attention_3")
        .append("svg")
        .attr("viewBox", [0, 0, width / 2, height / 2])
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    var svg_attention_4 = d3.select(container).select("#attention_4")
        .append("svg")
        .attr("viewBox", [0, 0, width / 2, height / 2])
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Initialize the X axis
    var x_scale = d3.scaleLinear().range([0, width])
    var x_scale_attention = d3.scaleLinear().range([0, width / 2])

    // Initialize the Y axis
    var y_scale = d3.scaleLinear().range([height, 0]);
    var y_scale_attention = d3.scaleLinear().range([height / 2, 0]);


    x_scale.domain([-3, 3]);
    y_scale.domain([-1.6, 1.6]);

    x_scale_attention.domain([-3, 3]);
    y_scale_attention.domain([-2, 1.5]);


    function degToRad(degrees) {
        return degrees * Math.PI / 180;
    }

    function arcTween(newAngle, angle) {
        return function (d) {
            var interpolate = d3.interpolate(d[angle], newAngle);
            return function (t) {
                d[angle] = interpolate(t);
                return arc(d);
            };
        };
    }

    const animationTime = 1200;
    const loaderRadius = 100;
    const loaderColor = '#ccc';

    var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(loaderRadius);

    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    var loader = g.append("path")
        .datum({endAngle: 0, startAngle: 0})
        .style("fill", loaderColor)
        .attr("d", arc);

    d3.interval(function () {
        loader.datum({endAngle: 0, startAngle: 0})

        loader.transition()
            .duration(animationTime)
            .attrTween("d", arcTween(degToRad(360), 'endAngle'));

        loader.transition()
            .delay(animationTime)
            .duration(animationTime)
            .attrTween("d", arcTween(degToRad(360), 'startAngle'));
    }, animationTime * 2);

    d3.json("assets/eagle/results/mesh.json").then(function (json) {
        svg.selectAll('g').remove()

        function getdata(t) {
            const vmin = d3.min(json.velocity[t]);
            const vmax = d3.max(json.velocity[t]);
            const myColor = d3.scaleSequential().interpolator(d3.interpolateTurbo).domain([vmin, vmax]);

            const color_attention_1 = d3.scaleSequential().interpolator(d3.interpolateBlues).domain([d3.min(json.attention_one[0][0]), d3.max(json.attention_one[0][0])]);
            const color_attention_2 = d3.scaleSequential().interpolator(d3.interpolateBlues).domain([d3.min(json.attention_two[0][0]), d3.max(json.attention_two[0][0])]);
            const color_attention_3 = d3.scaleSequential().interpolator(d3.interpolateBlues).domain([d3.min(json.attention_three[0][0]), d3.max(json.attention_three[0][0])]);
            const color_attention_4 = d3.scaleSequential().interpolator(d3.interpolateBlues).domain([d3.min(json.attention_four[0][0]), d3.max(json.attention_four[0][0])]);

            const dataset_mesh = []
            for (let i = 0; i < json.X[t].length; i++) {
                dataset_mesh.push({"x": json.X[t][i], "y": json.Y[t][i], "v": json.velocity[t][i]});
            }
            var dataset_cluster = []
            for (var i = 0; i < json.cluster_X[t].length; i++) {
                dataset_cluster.push({
                    'x': json.cluster_X[t][i], 'y': json.cluster_Y[t][i],
                    'attention_one': json.attention_one[t][selected][i],
                    'attention_two': json.attention_two[t][selected][i],
                    'attention_three': json.attention_three[t][selected][i],
                    'attention_four': json.attention_four[t][selected][i],
                    'i': i
                })
            }

            var u = svg.selectAll("circle").data(dataset_mesh);
            u.enter().append("circle").merge(u)
                .attr("r", 4)
                .attr("cx", function (d) {
                    return x_scale(d.x);
                })
                .attr("cy", function (d) {
                    return y_scale(d.y);
                })
                .style('fill', function (d) {
                    return myColor(d.v)
                });

            var u = svg.selectAll("rect").data(dataset_cluster);
            u.enter().append("rect").merge(u)
                .attr("x", function (d) {
                    return x_scale(d.x) - rect_cluster_size / 2;
                })
                .attr("y", function (d) {
                    return y_scale(d.y) - rect_cluster_size / 2;
                })
                .attr("width", rect_cluster_size).attr("height", rect_cluster_size)
                .attr("fill", function (d, i) {
                    if (i === selected) {
                        return "#FF0000";
                    } else {
                        return "#270a56"
                    }
                })
                .attr('stroke', '#FFFFFF')
                .attr('stroke-width', '2')
                .attr("fill-opacity", function (d, i) {
                    if (i.i === selected) {
                        return 1;
                    } else {
                        return 0.5;
                    }
                })
                .on('click', function (d, i, n) {
                    selected = i.i;
                    getdata(t)
                });

            // ATTENTION 1
            var u = svg_attention_1.selectAll("rect").data(dataset_cluster);
            u.enter().append("rect").merge(u)
                .attr("x", function (d) {
                    return x_scale_attention(d.x) - rect_cluster_size / 4;
                })
                .attr("y", function (d) {
                    return y_scale_attention(d.y) - rect_cluster_size / 4;
                })
                .attr("width", rect_cluster_size / 2).attr("height", rect_cluster_size / 2)
                .attr("fill", function (d) {
                    return color_attention_1(d.attention_one);
                })
            // ATTENTION 2
            var u = svg_attention_2.selectAll("rect").data(dataset_cluster);
            u.enter().append("rect").merge(u)
                .attr("x", function (d) {
                    return x_scale_attention(d.x) - rect_cluster_size / 4;
                })
                .attr("y", function (d) {
                    return y_scale_attention(d.y) - rect_cluster_size / 4;
                })
                .attr("width", rect_cluster_size / 2).attr("height", rect_cluster_size / 2)
                .attr("fill", function (d) {
                    return color_attention_2(d.attention_two);
                })
            // ATTENTION 1
            var u = svg_attention_3.selectAll("rect").data(dataset_cluster);
            u.enter().append("rect").merge(u)
                .attr("x", function (d) {
                    return x_scale_attention(d.x) - rect_cluster_size / 4;
                })
                .attr("y", function (d) {
                    return y_scale_attention(d.y) - rect_cluster_size / 4;
                })
                .attr("width", rect_cluster_size / 2).attr("height", rect_cluster_size / 2)
                .attr("fill", function (d) {
                    return color_attention_3(d.attention_three);
                })
            // ATTENTION 1
            var u = svg_attention_4.selectAll("rect").data(dataset_cluster);
            u.enter().append("rect").merge(u)
                .attr("x", function (d) {
                    return x_scale_attention(d.x) - rect_cluster_size / 4;
                })
                .attr("y", function (d) {
                    return y_scale_attention(d.y) - rect_cluster_size / 4;
                })
                .attr("width", rect_cluster_size / 2).attr("height", rect_cluster_size / 2)
                .attr("fill", function (d) {
                    return color_attention_4(d.attention_four);
                })

        }

        getdata(1);
        var sliderStep = sliderBottom()
            .min(1)
            .max(json.velocity.length)
            .width(width - 15)
            .ticks(5)
            .step(0.005)
            .default(0.015)
            .on('onchange', val => {
                getdata(parseInt(val))
            });

        var gStep = d3
            .select('div#slider-step')
            .append('svg')
            .attr("viewBox", [0, 0, width + 15, 100])
            // .attr("width", width + 15)
            // .attr("height", 100)
            .append("g")
            .attr("transform",
                "translate(" + 15 + "," + 15 + ")");
        gStep.call(sliderStep);
        d3.select('p#value-step').text(d3.format('.2%')(sliderStep.value()));
    })
    return {steps: []}
}
