import * as d3 from "d3";

export function create(container, context) {

    const margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        width: 1000,
        height: 200
    }
    const dt = 0.01;

    const svg = d3.select(container)
        .append("svg")
        .attr("viewBox", `0 0 ${margin.width} ${margin.height}`)
        .attr("width", '100%')
        .attr("height", '100%')
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

    const defs = svg.append("svg:defs");
    const N_points = 25;

    const xScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([margin.left, margin.width - margin.right]);
    const yScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([margin.height - margin.bottom, margin.top]);


// Plot the axis
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", "translate(0," + (margin.height / 2 - margin.top) + ")")
        .call(xAxis);
    svg.append("g")
        .attr("transform", "translate(" + (margin.width / 2) + ",0)")
        .call(yAxis);

//draw a grid for x axis (N_points lines)
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0," + (margin.height - margin.top) + ")")
        .call(xAxis
            .tickSize(-margin.height + margin.top + margin.bottom)
            .tickFormat("")
            .ticks(N_points)
        )
        .style("color", "#CECECE")
        .call(g => g.select(".domain").remove())
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(yAxis
            .tickSize(-margin.width + margin.left + margin.right)
            .tickFormat("")
            .ticks(N_points)
        )
        .style("color", "#CECECE")
        .call(g => g.select(".domain").remove())

// Compute vector field for f
    function f(state) {
        var x = state.x;
        var y = state.y;
        var dx = y;
        var dy = -x + (1 - x * x) * y;
        return {x: dx, y: dy};
    }

    let f_vector = [];
    let f_random = [];
    let max_norm = 0;
    const normalization = 8 / N_points * 0.8;
    function initVectorFields(){
        f_vector = [];
        f_random = [];
        for (let i = -4; i <= 4; i += (8 / N_points)) {
            for (let j = -4; j <= 4; j += (8 / N_points)) {
                let delta = f({x: i, y: j});
                let norm = Math.sqrt(delta.x * delta.x + delta.y * delta.y + 1e-6);
                if (norm > max_norm) {
                    max_norm = norm;
                }

                let x2 = i + delta.x / norm * normalization;
                let y2 = j + delta.y / norm * normalization;
                f_vector.push({
                    x: xScale(i),
                    y: yScale(j),
                    x2: xScale(x2),
                    y2: yScale(y2),
                    norm: norm
                });

                delta = {
                    x: 2 * (Math.random() - 0.5),
                    y: 2 * (Math.random() - 0.5)
                }
                norm = Math.sqrt(delta.x * delta.x + delta.y * delta.y + 1e-6);
                f_random.push({
                    x: xScale(i),
                    y: yScale(j),
                    x2: xScale(i + delta.x / norm * normalization),
                    y2: yScale(j + delta.y / norm * normalization),
                    norm: norm
                });
            }
        }
    }

    initVectorFields();

    const gradientColor = d3.scaleSequential()
        .interpolator(d3.interpolateCool)
        .domain([0, 1]);


    const arrowHeads = {}
    const numArrowHeads = 100;
    for (let i = 0; i < numArrowHeads; i++) {
        let color = gradientColor(i / numArrowHeads);
        color = "" + color;
        if (!color || color.indexOf("rgb") < 0) {
            color = d3.rgb(color).toString();
        }
        color = color.replace("rgb(", "").replace(")", "");
        color = color.split(",").map(function (color) {
            return parseInt(color);
        });
        color = color.map(function (color) {
            return ("0" + color.toString(16)).slice(-2);
        });
        color = "#" + color.join("");

        defs.append("svg:marker")
            .attr("id", color.replace("#", ""))
            .attr("refX", 3)
            .attr("refY", 2)
            .attr("markerWidth", 6)
            .attr("markerHeight", 4)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M 0,0 V 4 L6,2 Z")
            .style("fill", color);

        arrowHeads[i] = "url(" + color + ")";

    }


    const arrows = svg.append("g")
        .attr("class", "arrow")
        .selectAll("line")
        .data(f_random)
        .enter()
        .append("line")
        .attr("x1", d => d.x)
        .attr("y1", d => d.y)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("stroke-width", 1.5)
        .attr("stroke", d => gradientColor(d.norm / max_norm))
        .attr("marker-end", d => {
            const arrowIndex = Math.floor(d.norm / max_norm * numArrowHeads);
            return arrowHeads[arrowIndex];
        })

    const particle_set = svg.append("g")
        .attr("id", "particle_set");
    let particles = [];

    function draw_particles(N) {
        particles = [];
        for (let i = 0; i < N; i++) {
            particles.push({
                x: 8 * Math.random() - 4,
                y: 8 * Math.random() - 4,
            })
        }

        particle_set.selectAll("circle")
            .data(particles)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 4)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5)
            .attr("fill", d => d3.interpolateRainbow(Math.random()))
            .attr("opacity", 1);
    }

    function update_particles() {
        for (var i = 0; i < particles.length; i++) {
            var state = {x: particles[i].x, y: particles[i].y}
            var d_state = f(state)
            particles[i].x = state.x + d_state.x * dt
            particles[i].y = state.y + d_state.y * dt
        }

        particle_set.selectAll("circle")
            .data(particles)
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
    }

    let alpha = 0
    let frm_cnt = 0;
    let iter_cnt = 0;

    function update() {
        if (frm_cnt === 100) {
            // Every 100 frames, draw new particles
            draw_particles(100);
            frm_cnt = 0;
            iter_cnt += alpha === 1 ? 1 : 0; // Increment iteration count if alpha is reset
        }
        update_particles();
        frm_cnt++;
        alpha += 0.002;
        if (alpha > 1) {
            alpha = iter_cnt === 4 ? 0 : 1; // Reset alpha after 4 iterations
            iter_cnt = iter_cnt === 4 ? 0 : iter_cnt;
        }
        const f_blend = f_vector.map(function (d, i) {
            return {
                x: d.x,
                y: d.y,
                x2: d.x2 * alpha + f_random[i].x2 * (1 - alpha),
                y2: d.y2 * alpha + f_random[i].y2 * (1 - alpha),
                norm: d.norm * alpha + f_random[i].norm * (1 - alpha)
            }
        });

        arrows.data(f_blend)
            .attr("marker-end", d => {
                const arrowIndex = Math.floor(d.norm / max_norm * numArrowHeads);
                return arrowHeads[arrowIndex];
            })
            .attr("x1", d => d.x)
            .attr("y1", d => d.y)
            .attr("x2", d => d.x2)
            .attr("y2", d => d.y2)
            .attr("stroke-width", 1.5)
            .attr("stroke", d => gradientColor(d.norm / max_norm));
    }

    update()

    let timer = d3.timer(update, 20)
    timer.stop()
    return {
        steps: [
            {
                index: 2,
                forward: () => {
                    draw_particles(100);
                    timer.restart(update, 20);
                },
                backward: () => {
                    timer.stop()
                    particle_set.selectAll("circle")
                        .transition()
                        .duration(500)
                        .style("opacity", 0)
                        .remove();
                }
            }
        ],
        onSlideEnter: () =>{
            timer.stop();
            alpha = 0;
        },
        onSlideLeave: () =>{
            timer.stop();
            alpha = 0;
        }
    }
}
