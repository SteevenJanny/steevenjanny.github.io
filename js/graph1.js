var axis_fontsize = "30px"

var width = 1000;
var height = 800;

var left_margin = 150;
var right_margin = 100;
var top_margin = 25;
var bottom_margin = 225;

// SVG 1 FOR GRAPH OF NUMBER OF PAPERS
var svg = d3.select("#svg_container1").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0, 0, width, height]);

// create a random dataset with dates and values
var data = d3.range(100).map(function (d) {
    return {
        date: new Date(2018, 0, d),
        value: 0
    };
});

var x = d3.scaleTime()
    .domain(d3.extent(data, function (d) {
        return d.date;
    }))
    .range([left_margin, width - right_margin]);
var y = d3.scaleLinear()
    .domain([0, 1])
    .range([height - bottom_margin, top_margin]);

var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%d %b %Y"));
var yAxis = d3.axisLeft(y);

var gX = svg.append("g")
    .attr("transform", "translate(" + 0 + "," + (height - bottom_margin + top_margin) + ")")
    .call(xAxis);

gX.selectAll("text")
    .attr("transform", "rotate(-65)")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("font-size", axis_fontsize)
    .style("text-anchor", "end");

var gY = svg.append("g")
    .attr("transform", "translate(" + left_margin + ", " + top_margin + ")")
    .call(yAxis);

gY.selectAll("text")
    .attr("font-size", axis_fontsize);

svg.append("g")
    .attr("class", "grid_x")
    .attr("transform", "translate(0," + (height - bottom_margin + top_margin) + ")")
    .call(d3.axisBottom(x)
        .tickSize(-height + bottom_margin + top_margin)
        .tickFormat("")
    )
    .attr('color', 'lightgrey');

svg.append("g")
    .attr("class", "grid_y")
    .attr("transform", "translate(" + left_margin + "," + top_margin + ")")
    .call(d3.axisLeft(y)
        .tickSize(-width + left_margin + right_margin)
        .tickFormat("")
    )
    .attr('color', 'lightgrey');



// add labels
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", -300)
    .attr("dy", "1em")
    .attr("font-size", axis_fontsize)
    .style("text-anchor", "middle")
    .text("Number of papers");

// Add a clipPath: everything out of this area won't be drawn.
var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("id", "clip-rect")
    .attr("width", width - left_margin - right_margin)
    .attr("height", height - bottom_margin + top_margin)
    .attr("x", left_margin)
    .attr("y", top_margin);

var plot = svg.append('g')
    .attr("clip-path", "url(#clip)")

// create a line generator
var line = d3.line()
    .x(function (d) {
        return x(d.date);
    })
    .y(function (d) {
        return y(d.value) + top_margin
    });
var area = d3.area()
    .x(function (d) {
        return x(d.date);
    })
    .y0(height - bottom_margin + top_margin)
    .y1(function (d) {
        return y(d.value) + top_margin;
    });

// add the line to the svg with id chart
plot.append("path")
    .attr("id", "chart")
    .datum(data)
    .attr("d", line)
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("fill", "none");

// Paint the area below the line
plot.append("path")
    .attr("id", "area")
    .datum(data)
    .attr("fill", "steelblue")
    .attr("fill-opacity", .3)
    .attr("stroke", "none")
    .attr("d", area);


function updateChart1(data) {

    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);

    xAxis = d3.axisBottom(x);
    yAxis = d3.axisLeft(y);

    xAxis.tickFormat(d3.timeFormat("%d %b %Y"));

    gX.transition()
        .duration(1000)
        .call(xAxis);
    gX.selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)")
        .attr("font-size", axis_fontsize);

    // Smooth transition for the y axis
    gY.transition()
        .duration(1000)
        .call(yAxis);
    gY.selectAll("text")
        .attr("font-size", axis_fontsize);
    // Smooth transition for the line
    plot.select("#chart")
        .datum(data)
        .transition()
        .duration(1000)
        .attr("d", line);


    plot.select("#area")
        .datum(data)
        .transition()
        .duration(1000)
        .attr("fill", "steelblue")
        .attr("fill-opacity", .3)
        .attr("stroke", "none")
        .attr("d", area);
}


var zoom = d3.zoom()
    .scaleExtent([1, 32])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

svg.append("rect")
    .attr("class", "zoom")
    .attr("width", width - left_margin - right_margin)
    .attr("height", height - bottom_margin - top_margin)
    .attr("transform", "translate(" + left_margin + "," + (top_margin * 2) + ")")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .attr("cursor", "move")
    .attr("stroke-width", 1)
    .call(zoom);



function zoomed() {
    // create new scale ojects based on event
    var new_xScale = d3.event.transform.rescaleX(x);

    // Prevent the line to exit the chart area when zoomed by filtering the data
    var s = d3.event.transform.k / 32;
    var new_data = data.filter(function (d) {
            return (d.date >= new_xScale.domain()[0] && d.date <= new_xScale.domain()[1])
        }
    );



    // update axes
    gX.call(xAxis.scale(new_xScale));
    gX.selectAll("text")
        .attr("transform", "rotate(-65)")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("font-size", axis_fontsize)
        .style("text-anchor", "end");

    // update line
    svg.selectAll("#chart")
        .attr("d", line.x(function (d) {
            return new_xScale(d.date);
        }));

    // update area
    svg.selectAll("#area")
        .attr("d", area.x(function (d) {
            return new_xScale(d.date);
        }));

    // update X axis but keep label rotation
    svg.selectAll(".grid_x")
        .attr("transform", "translate(0," + (height - bottom_margin + top_margin) + ")")
        .call(d3.axisBottom(new_xScale)
            .tickSize(-height + bottom_margin + top_margin)
            .tickFormat("")
        );
    svg.selectAll(".grid_y")
        .attr("transform", "translate(" + left_margin + "," + top_margin + ")")
        .call(d3.axisLeft(y)
            .tickSize(-width + left_margin + right_margin)
            .tickFormat("")
        );

}