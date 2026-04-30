import * as d3 from "d3";

const width = 300, height = 230;

const margin = {top: 10, right: 50, bottom: 10, left: 50};

export function create(container, context) {
    const svg = d3.select(container).append("svg")
        // .style("border", "1px solid red")
        .attr("viewBox", [0, 0, width, height]);

    const pathContainer = svg.append("g");
    const pointContainer = svg.append("g");

    const arrow_size = 6;
    svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("markerWidth", arrow_size)
        .attr("markerHeight", arrow_size)
        .attr("refX", arrow_size)
        .attr("refY", arrow_size / 2)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M 0,0 L " + arrow_size + "," + (arrow_size / 2) + " L 0," + arrow_size + " Z")
        .attr("fill", "#4E5458");


    // Add a database icon (from fontawesome) on the top center
    const DB_ICON_SIZE = 75
    svg.append("foreignObject")
        .attr("x", width / 2 - DB_ICON_SIZE / 2)
        .attr("y", margin.top)
        .attr("width", DB_ICON_SIZE)
        .attr("height", DB_ICON_SIZE)
        .append("xhtml:div")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("background-color", "white")
        .html(`<i class="fas fa-database" style="color:#006EFF; font-size: ${DB_ICON_SIZE}px;"></i>`);

    // Label "Traj. Database" below the icon
    const TEXT_SIZE = 20
    const TEXT_Y_OFFSET = 20
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top + DB_ICON_SIZE + TEXT_Y_OFFSET)
        .attr("text-anchor", "middle")
        .attr("fill", "#4E5458")
        .attr("font-size", TEXT_SIZE)
        .text("Training Data");

    // Add a rounded box under the icon and label
    const GAP = 50;
    const boxH = margin.top + DB_ICON_SIZE + TEXT_Y_OFFSET + TEXT_SIZE + GAP;
    const box = svg.append("g")
        .attr("transform", `translate(${width / 2}, ${boxH})`);

    const BOX_WIDTH = 150, BOX_HEIGHT = 50;
    box.append("rect")
        .attr("x", -BOX_WIDTH / 2)
        .attr("y", 0)
        .attr("width", BOX_WIDTH)
        .attr("height", BOX_HEIGHT)
        .attr("rx", 10) // rounded corners
        .attr("fill", "#D5EFDA");

    // Add text "Neural ODE" inside the box
    box.append("text")
        .attr("x", 0)
        .attr("y", BOX_HEIGHT / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "#4E5458")
        .attr("font-size", 20)
        .text("Neural ODE");

    // Add line U arrow from the box to the database icon
    const line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    // Start from right of DB, right, down, left to the box
    const ARROW_GAP = 40;
    const pointsArrow1 = [
        {x: width / 2 + DB_ICON_SIZE / 2, y: margin.top + DB_ICON_SIZE / 2},
        {x: width / 2 + Math.max(DB_ICON_SIZE / 2, BOX_WIDTH / 2) + ARROW_GAP, y: margin.top + DB_ICON_SIZE / 2},
        {x: width / 2 + Math.max(DB_ICON_SIZE / 2, BOX_WIDTH / 2) + ARROW_GAP, y: boxH + BOX_HEIGHT / 2},
        {x: width / 2 + BOX_WIDTH / 2, y: boxH + BOX_HEIGHT / 2}
    ];

    pathContainer.append("path")
        .datum(pointsArrow1)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#4E5458")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrowhead)");

    const pointsArrow2 = [
        {x: width / 2 - BOX_WIDTH / 2, y: boxH + BOX_HEIGHT / 2},
        {x: width / 2 - Math.max(DB_ICON_SIZE / 2, BOX_WIDTH / 2) - ARROW_GAP, y: boxH + BOX_HEIGHT / 2},
        {x: width / 2 - Math.max(DB_ICON_SIZE / 2, BOX_WIDTH / 2) - ARROW_GAP, y: margin.top + DB_ICON_SIZE / 2},
        {x: width / 2 - DB_ICON_SIZE / 2, y: margin.top + DB_ICON_SIZE / 2},
    ];


    pathContainer.append("path")
        .datum(pointsArrow2)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#4E5458")
        .attr("stroke-width", 3)
        .attr("marker-end", "url(#arrowhead)");


    const travelPoints = [
        {x: width / 2 + Math.max(DB_ICON_SIZE / 2, BOX_WIDTH / 2) + ARROW_GAP, y: margin.top + DB_ICON_SIZE / 2},
        {x: width / 2 + Math.max(DB_ICON_SIZE / 2, BOX_WIDTH / 2) + ARROW_GAP, y: boxH + BOX_HEIGHT / 2},
        {x: width / 2 - Math.max(DB_ICON_SIZE / 2, BOX_WIDTH / 2) - ARROW_GAP, y: boxH + BOX_HEIGHT / 2},
        {x: width / 2 - Math.max(DB_ICON_SIZE / 2, BOX_WIDTH / 2) - ARROW_GAP, y: margin.top + DB_ICON_SIZE / 2},
        {x: width / 2 + Math.max(DB_ICON_SIZE / 2, BOX_WIDTH / 2) + ARROW_GAP, y: margin.top + DB_ICON_SIZE / 2},
    ]

    const totalLength = travelPoints.reduce((acc, p, i) => {
        if (i === 0) return 0;
        return acc + Math.sqrt((p.x - travelPoints[i - 1].x) ** 2 + (p.y - travelPoints[i - 1].y) ** 2);
    }, 0);
    const segmentLengths = travelPoints.slice(1).map((p, i) => {
        const prev = travelPoints[i];
        return Math.sqrt((p.x - prev.x) ** 2 + (p.y - prev.y) ** 2);
    });
    const cumulativeSegmentLengths = segmentLengths.reduce((acc, len) => {
        if (acc.length === 0) return [len];
        return [...acc, acc[acc.length - 1] + len];
    }, []);

    // Now animate some points flowing from the box to the database and back
    const NUM_POINTS = 15;
    const pointsData = d3.range(NUM_POINTS).map((d, i) => ({
        x: width / 2,
        y: boxH + BOX_HEIGHT / 2,
        progress: (totalLength / NUM_POINTS) * i
    }));


    const points = pointContainer.selectAll(".point")
        .data(pointsData)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("r", 10)
        .attr("fill", "#006EFF")
        .attr("stroke", "white")
        .attr("stroke-width", 5)

    function animate() {
        pointsData.forEach(d => {
            d.progress += 1
            if (d.progress > totalLength) {
                d.progress = 0;
            }

            // Find the segment we are on
            let segmentIndex = 0;
            while (segmentIndex < cumulativeSegmentLengths.length && d.progress > cumulativeSegmentLengths[segmentIndex]) {
                segmentIndex++;
            }

            const start = travelPoints[segmentIndex];
            const end = travelPoints[segmentIndex + 1];
            const segmentStartProgress = segmentIndex === 0 ? 0 : cumulativeSegmentLengths[segmentIndex - 1];
            const segmentProgress = (d.progress - segmentStartProgress) / segmentLengths[segmentIndex];
            d.x = start.x + (end.x - start.x) * segmentProgress;
            d.y = start.y + (end.y - start.y) * segmentProgress;
        });

        points.attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

    let interval;
    d3.interval(animate, 20); // Adjust animation frame rate here

    return {
        steps: [],
        onSlideEnter: () => {
            clearInterval(interval);
            interval = d3.interval(animate, 20);
        },
        onSlideLeave: () => {
            clearInterval(interval);
        }
    }

}
