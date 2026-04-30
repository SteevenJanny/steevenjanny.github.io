import * as d3 from "d3";

const _GtColor = "#d34343";
const _PriorColor = "#006EFF";
const _ResidualColor = "#03C15F";

const margin = {
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
    width: 1000,
    height: 500
}

export function create(container, context) {
    container.innerHTML = `
<div class="w-100 text-center fs-5">
    <p style="border: 1px solid #03C15F; padding:10px; border-radius: 8px;">
        $\\dot{\\mathbf{s}} = $
        <span id="eq-gt">$f_{\\theta}(\\mathbf{s})$</span>
        $=$
        <span id="eq-phy">$ f_{\\text{phy}} $ </span>
        $+$
        <span id="eq-ml">$ f_{\\text{ml}} $
    </span>
    </p>
</div>

<div id="figure"></div>
<div class="w-100 text-center mt-2">
    <div class="btn-group block" role="group">
        <button class="btn btn-outline-secondary" id="gt">> ground truth</button>
        <button class="btn btn-outline-secondary" id="prior">> prior</button>
        <button class="btn btn-outline-secondary" id="learned">> learned</button>
    </div>
</div>
`;
    const svg = d3.select(container.querySelector("#figure"))
        .append("svg")
        .attr("viewBox", `0 0 ${margin.width} ${margin.height}`)
        .attr("width", '100%')
        .attr("height", '100%')
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g");

    const defs = svg.append("svg:defs");
    const N_points = 15;

    const xScale = d3.scaleLinear()
        .domain([-2, 2])
        .range([margin.left, margin.width - margin.right]);
    const yScale = d3.scaleLinear()
        .domain([-2, 2])
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
    let f_prior = [];
    let f_residual = [];
    let max_norm = 0;
    const normalization = 8 / N_points * 0.8;
    for (let i = -4; i <= 4; i += (8 / N_points)) {
        for (let j = -4; j <= 4; j += (8 / N_points)) {
            let delta = f({x: i, y: j});
            let norm = Math.sqrt(delta.x * delta.x + delta.y * delta.y + 1e-6);
            if (norm > max_norm) {
                max_norm = norm;
            }

            // f_prior takes the projection on the X axis
            let x2_prior = i + 0.8 * delta.x / norm * normalization;
            let y2_prior = j;
            f_prior.push({
                x: xScale(i),
                y: yScale(j),
                x2: xScale(x2_prior),
                y2: yScale(y2_prior),
                norm: norm
            });

            let x2 = i + delta.x / norm * normalization;
            let y2 = j + delta.y / norm * normalization;
            f_vector.push({
                x: xScale(i),
                y: yScale(j),
                x2: xScale(x2),
                y2: yScale(y2),
                norm: norm
            });

            // residual vector
            f_residual.push({
                x: xScale(x2_prior),
                y: yScale(y2_prior),
                x2: xScale(x2),
                y2: yScale(y2),
                norm: norm
            });
        }
    }

    defs.append("svg:marker")
        .attr("id", "arrowhead_red")
        .attr("refX", 3)
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z")
        .style("fill", _GtColor);

    defs.append("svg:marker")
        .attr("id", "arrowhead_phy")
        .attr("refX", 3)
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z")
        .style("fill", _PriorColor);

    defs.append("svg:marker")
        .attr("id", "arrowhead_ml")
        .attr("refX", 3)
        .attr("refY", 2)
        .attr("markerWidth", 6)
        .attr("markerHeight", 4)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z")
        .style("fill", _ResidualColor);

    const arrows = svg.append("g")
        .attr("class", "arrow")
        .selectAll("line")
        .data(f_vector)
        .enter()
        .append("line")
        .attr("x1", d => d.x)
        .attr("y1", d => d.y)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("stroke-width", 5)
        .attr("stroke", _GtColor)
        .attr("marker-end", "url(#arrowhead_red)");

    const arrowsPrior = svg.append("g")
        .attr("class", "arrow")
        .selectAll("line")
        .data(f_prior)
        .enter()
        .append("line")
        .attr("x1", d => d.x)
        .attr("y1", d => d.y)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("stroke-width", 5)
        .attr("stroke", _PriorColor)
        .attr("marker-end", "url(#arrowhead_phy)");

    const arrowsResidual = svg.append("g")
        .attr("class", "arrow")
        .selectAll("line")
        .data(f_residual)
        .enter()
        .append("line")
        .attr("x1", d => d.x)
        .attr("y1", d => d.y)
        .attr("x2", d => d.x2)
        .attr("y2", d => d.y2)
        .attr("stroke-width", 5)
        .attr("stroke", _ResidualColor)
        .attr("marker-end", "url(#arrowhead_ml)");

    const eqGt = document.getElementById("eq-gt");
    const eqPhy = document.getElementById("eq-phy");
    const eqMl = document.getElementById("eq-ml");

    const gtButton = document.getElementById("gt");
    const priorButton = document.getElementById("prior");
    const learnedButton = document.getElementById("learned");

    const lowAlpha = 0.1

    gtButton.addEventListener("mouseover", function () {
        arrows.style("opacity", 1.0);
        arrowsPrior.style("opacity", lowAlpha);
        arrowsResidual.style("opacity", lowAlpha);
        eqGt.style.color = _GtColor;
        eqPhy.style.color = "gray";
        eqMl.style.color = "gray";

    });
    gtButton.addEventListener("mouseout", function () {
        arrows.style("opacity", 1.0);
        arrowsPrior.style("opacity", 1.0);
        arrowsResidual.style("opacity", 1.0);
        eqGt.style.color = _GtColor;
        eqPhy.style.color = _PriorColor;
        eqMl.style.color = _ResidualColor;
    });

    priorButton.addEventListener("mouseover", function () {
        arrows.style("opacity", lowAlpha);
        arrowsPrior.style("opacity", 1.0);
        arrowsResidual.style("opacity", lowAlpha);
        eqGt.style.color = "gray";
        eqPhy.style.color = _PriorColor;
        eqMl.style.color = "gray";
    });
    priorButton.addEventListener("mouseout", function () {
        arrows.style("opacity", 1.0);
        arrowsPrior.style("opacity", 1.0);
        arrowsResidual.style("opacity", 1.0);
        eqGt.style.color = _GtColor;
        eqPhy.style.color = _PriorColor;
        eqMl.style.color = _ResidualColor;
    });
    learnedButton.addEventListener("mouseover", function () {
        arrows.style("opacity", lowAlpha);
        arrowsPrior.style("opacity", lowAlpha);
        arrowsResidual.style("opacity", 1.0);
        eqGt.style.color = "gray";
        eqPhy.style.color = "gray";
        eqMl.style.color = _ResidualColor;
    });
    learnedButton.addEventListener("mouseout", function () {
        arrows.style("opacity", 1.0);
        arrowsPrior.style("opacity", 1.0);
        arrowsResidual.style("opacity", 1.0);
        eqGt.style.color = _GtColor;
        eqPhy.style.color = _PriorColor;
        eqMl.style.color = _ResidualColor;
    });
    return {
        steps: [], onSlideEnter: () => {
        }, onSlideLeave: () => {
        }
    };
}
