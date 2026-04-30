import * as d3 from "d3";

const width = 1000, height = 400;

const margin = {top: 10, right: 20, bottom: 10, left: 10};

export function create(container, context) {
    const svg = d3.select(container).append("svg")
        .attr("viewBox", [0, 0, width, height]);

    const edgeContainer = svg.append("g").attr("id", "edges");
    const nodeContainer = svg.append("g").attr("id", "node");
    const vectorContainer = svg.append("g").attr("id", "vector");

    const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top]);

    const nodePerCircle = 7;
    const circleRadius = xScale(0.17) - xScale(0);
    const nodeSize = 15;
    const nodes = [{
        id: -1, circleNumber: 0, angle: 0, x: xScale(0.5), y: yScale(0.5)
    },];

    let currentRadius = circleRadius;
    const numCircles = Math.floor((xScale(0.5) - xScale(0)) / circleRadius);

    while (currentRadius <= xScale(0.5) - xScale(0)) {
        const numNodes = nodePerCircle * Math.round(currentRadius / circleRadius);
        for (let i = 0; i < numNodes; i++) {
            const angle = i / numNodes * 2 * Math.PI + Math.random() * 0.1;
            nodes.push({
                id: i,
                circleNumber: Math.round(currentRadius / circleRadius),
                angle: angle,
                x: xScale(0.5) + currentRadius * Math.cos(angle),
                y: yScale(0.5) + currentRadius * Math.sin(angle)
            });
        }
        currentRadius += circleRadius;
    }

    //Blue color scale
    const BlueScale = d3.scaleSequential(d3.interpolateBlues)
    const OrangeScale = d3.scaleSequential(d3.interpolateGreys)
    const GreyScale = d3.scaleSequential(d3.interpolateOranges)
    const GreenScale = d3.scaleSequential(d3.interpolateGreens)

    nodeContainer.append("g")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("id", (d, i) => `node-${i}`)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", nodeSize)
        .attr("fill", (d, i) => {
            const distance = Math.sqrt((d.x - xScale(0.5)) ** 2 + (d.y - yScale(0.5)) ** 2);
            return BlueScale(1 - distance / (xScale(0.5) - xScale(0)));
        });


    // Add edges between nodes in the same circle
    for (let i = 1; i <= numCircles; i++) {
        const nodesInCircle = nodes.filter(d => d.circleNumber === i);
        for (let j = 0; j < nodesInCircle.length; j++) {
            const source = nodesInCircle[j];
            const target = nodesInCircle[(j + 1) % nodesInCircle.length];
            edgeContainer.append("line")
                .attr("x1", source.x)
                .attr("y1", source.y)
                .attr("x2", target.x)
                .attr("y2", target.y)
                .attr("stroke", "lightgray")
                .attr("stroke-width", 1);
        }
    }

    const mainNode = nodes[0];
    const firstCircleNodes = nodes.filter(d => d.circleNumber === 1);
    for (let i = 0; i < firstCircleNodes.length; i++) {
        const target = firstCircleNodes[i];
        edgeContainer.append("line")
            .attr("x1", mainNode.x)
            .attr("y1", mainNode.y)
            .attr("x2", target.x)
            .attr("y2", target.y)
            .attr("stroke", "gray")
            .attr("stroke-width", 2);
    }

    // Add edges between nodes in adjacent circles
    for (let i = 1; i < numCircles; i++) {
        const nodesInCircle = nodes.filter(d => d.circleNumber === i);
        const nodesInNextCircle = nodes.filter(d => d.circleNumber === i + 1);
        for (let j = 0; j < nodesInCircle.length; j++) {
            for (let k = 0; k < nodesInNextCircle.length; k++) {
                const source = nodesInCircle[j];
                const target = nodesInNextCircle[k];
                if (Math.abs(source.angle - target.angle) < 2 * Math.PI / nodePerCircle) {
                    edgeContainer.append("line")
                        .attr("x1", source.x)
                        .attr("y1", source.y)
                        .attr("x2", target.x)
                        .attr("y2", target.y)
                        .attr("stroke", "lightgray")
                        .attr("stroke-width", 1);
                }
            }
        }
    }

    const vectorSize = 4;
    const vectorHeight = nodeSize * 4;
    const dy = -10;
    for (let i = 1; i < nodes.length; i++) {
        const source = nodes[i];
        vectorContainer.append("g")
            .attr("id", `vector-${i}`)
            .selectAll("rect")
            .data(d3.range(vectorSize))
            .join("rect")
            .attr("circleNumber", source.circleNumber)
            .attr("x", source.x - 0.5 * vectorHeight / vectorSize)
            .attr("y", source.y - 0.5 * vectorHeight / vectorSize)
            .attr("width", vectorHeight / vectorSize - 1)
            .attr("height", vectorHeight / vectorSize - 1)
            .attr("fill", () => {
                return OrangeScale(Math.random())
            })
            .attr("transform", (d, i) => {
                return `translate(0, ${dy - i * (vectorHeight / vectorSize)})`
            });
    }

    const mainVectorColor = d3.range(vectorSize).map(() => GreyScale(Math.random()));

    for (let i = 0; i < firstCircleNodes.length; i++) {
        vectorContainer.append("g")
            .attr("id", `vector-main-${i}`)
            .selectAll("rect")
            .data(d3.range(vectorSize))
            .join("rect")
            .attr("x", mainNode.x - 0.5 * vectorHeight / vectorSize)
            .attr("y", mainNode.y - 0.5 * vectorHeight / vectorSize)
            .attr("width", vectorHeight / vectorSize - 1)
            .attr("height", vectorHeight / vectorSize - 1)
            .attr("fill", (d, i) => {
                return mainVectorColor[i];
            })
            .attr("transform", (d, i) => {
                return `translate(0, ${dy - i * (vectorHeight / vectorSize)})`
            })
    }
    const vectorMainStates = []
    const vectorSideStates = []
    for (let i = 0; i < firstCircleNodes.length; i++) {
        const node = firstCircleNodes[i];
        // Centered on the main node
        const state1 = {
            fill: (d, j) => {
                return mainVectorColor[j]
            },
            transform: (d, j) => {
                return `translate(0, ${dy - j * (vectorHeight / vectorSize)})`
            },
            opacity: 1
        }

        // Centered on the edge between the main node and the first circle node
        const state2 = {
            fill: (d, j) => {
                return mainVectorColor[j]
            },
            transform: (d, j) => {
                return `translate(${node.x * 0.5 - mainNode.x * 0.5 + (node.x > xScale(0.5) ? -10 : 10)}, ${node.y * 0.5 - mainNode.y * 0.5})`
            },
            opacity: 1
        }

        // Change color and slide in central pose
        const randomGreenColors = d3.range(vectorSize).map(() => GreenScale(Math.random()));
        const state3 = {
            fill: (d, j) => {
                return randomGreenColors[j]
            },
            transform: (d, j) => {
                return `translate(${node.x * 0.5 - mainNode.x * 0.5}, ${node.y * 0.5 - mainNode.y * 0.5})`
            },
            opacity: 1
        }

        // Stack them up near the main node
        const state4 = {
            fill: (d, j) => {
                return randomGreenColors[j]
            },
            transform: (d, j) => {
                const dx = xScale(0.5) - mainNode.x + 2 * nodeSize;
                const dy = (i - numNodeInFirstCircle / 2 + 1) * (vectorHeight);
                return `translate(${dx}, ${dy})`
            },
            opacity: 1
        }

        // Regroup them in blue
        const randomBlueColors = d3.range(vectorSize).map(() => BlueScale(Math.random()));
        const state5 = {
            fill: (d, j) => {
                return randomBlueColors[j]
            },
            transform: (d, j) => {
                const dx = xScale(0.5) - mainNode.x + 2 * nodeSize;
                return `translate(${dx}, 0)`
            },
            opacity: 1
        }
        vectorMainStates.push([state1, state2, state3, state4, state5]);

        // ---------------------------------------------------------


        const sideState1 = {
            fill: (d, j) => {
                return OrangeScale(Math.random())
            },
            transform: (d, j) => {
                return `translate(0, ${dy - j * (vectorHeight / vectorSize)})`
            },
            opacity: 1
        }

        const sideState2 = {
            fill: (d, j) => {
                return OrangeScale(Math.random())
            },
            transform: (d, j) => {
                return `translate(${-node.x * 0.5 + mainNode.x * 0.5 + (node.x > xScale(0.5) ? 10 : -10)}, ${-node.y * 0.5 + mainNode.y * 0.5})`
            },
            opacity: 1
        }

        const sideState3 = {
            fill: (d, j) => {
                return OrangeScale(Math.random())
            },
            transform: (d, j) => {
                return `translate(${-node.x * 0.5 + mainNode.x * 0.5 + (node.x > xScale(0.5) ? 10 : -10)}, ${-node.y * 0.5 + mainNode.y * 0.5})`
            },
            opacity: 0
        }

        vectorSideStates.push([sideState1, sideState2, sideState3]);
    }

    function applyMainState(stateIndex) {
        for (let i = 0; i < numNodeInFirstCircle; i++) {
            const state = vectorMainStates[i][stateIndex];
            d3.select(`#vector-main-${i}`)
                .transition()
                .duration(1000)
                .attr("transform", state.transform)
                .selectAll("rect")
                .attr("fill", state.fill)
                .attr("opacity", state.opacity);
        }
    }

    function applySideState(stateIndex) {
        for (let i = 0; i < numNodeInFirstCircle; i++) {
            const state = vectorSideStates[i][stateIndex];
            d3.select(`#vector-${i + 1}`)
                .transition()
                .duration(1000)
                .attr("transform", state.transform)
                .selectAll("rect")
                .attr("fill", state.fill)
                .attr("opacity", state.opacity);
        }
    }


    function edgeTranslation() {
        applyMainState(1)
        applySideState(1)
    }

    function reverseEdgeTranslation() {
        applyMainState(0)
        applySideState(0)
    }

    function mergeEdgeVectors() {
        applyMainState(2)
        applySideState(2)
    }

    function reverseMergeEdgeVectors() {
        applyMainState(1)
        applySideState(1)
    }

    function aggregateEdgeVectors() {
        applyMainState(3)
        applySideState(2)
    }

    function reverseEdgeVectors() {
        applyMainState(2)
        applySideState(2)
    }

    function finalizeAggregation() {
        applyMainState(4)
        applySideState(2)
    }

    function reverseFinalizeAggregation() {
        applyMainState(3)
        applySideState(2)
    }

    // Now animate the vectors for the first circle nodes
    const numNodeInFirstCircle = firstCircleNodes.length;


    function hideAll() {
        nodeContainer.selectAll("circle")
            .attr("opacity", 0);
    }

    function enterSlide() {
        // Let node fade in one by one with a delay

        // First sort node from bottom left to top right
        const sortedNodes = nodes.sort((a, b) => {
            if (a.y === b.y) {
                return a.x - b.x;
            }
            return a.y - b.y;
        });
        nodeContainer.selectAll("circle")
            .data(sortedNodes, d => d.id)
            .transition()
            .delay((d, i) => i * 50)
            .attr("opacity", 1);
        edgeContainer.selectAll("line")
            .attr("opacity", 0)
            .transition()
            .delay((d, i) => i * 10)
            .attr("opacity", 1);
        vectorContainer.selectAll("rect")
            .attr("opacity", 0)
            .transition()
            .delay((d, i) => i * 10)
            .attr("opacity", 1);
        applyMainState(0)
        applySideState(0)
    }

    hideAll();

    return {
        steps: [{
            index: 0,
            forward: () => {
                edgeTranslation();
            },
            backward: () => {
                reverseEdgeTranslation();
            }
        }, {
            index: 1,
            forward: () => {
                mergeEdgeVectors();
            },
            backward: () => {
                reverseMergeEdgeVectors();
            }
        }, {
            index: 2,
            forward: () => {
                aggregateEdgeVectors();
            },
            backward: () => {
                reverseEdgeVectors();
            }
        }, {
            index: 3,
            forward: () => {
                finalizeAggregation();
            },
            backward: () => {
                reverseFinalizeAggregation();
            }
        }],
        onSlideEnter: () => {
            enterSlide();
        }, onSlideLeave: () => {
            hideAll();
        }
    }

}
