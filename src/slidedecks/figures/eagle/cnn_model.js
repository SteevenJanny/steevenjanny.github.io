import * as d3 from "d3";

const p = {
    square_size: 0.8,
    img_size: 8,
    kernel_size: [3, 3, 3, 1],
    n_channels: [1, 4, 8, 10],
    space: 6,
    interval: 100,
}

const width = 1000;
const height = 200;

const layers_width = width / (2 * p.kernel_size.length - 1);
const block_size = layers_width * p.square_size;

const color = d3.scaleOrdinal(d3.schemeCategory10);

export function create(container, context) {
    const svg = d3.select(container).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", [0, 0, width, height])

    function create_layer(n) {
        const layer = svg.append("g")
            .attr("transform", "translate(" + layers_width * n + ",0)")
        const kernel = svg.append('g')
            .attr("transform", "translate(" + layers_width * n + ",0)")

        const true_n = n;
        if (n > p.kernel_size.length - 1) {
            n = p.kernel_size.length - (n - p.kernel_size.length) - 2
        }

        let dimension = p.img_size
        for (let i = 0; i < n; i++) {
            dimension = (dimension - p.kernel_size[i] + 1)
        }

        // (n-1) * pixel_size + block = block_size
        const correct_blocksize = block_size - p.space * (p.n_channels[n] - 1)
        const x0 = (layers_width - block_size) / 2
        const y0 = (height - block_size) / 2

        const pixel_size = correct_blocksize / dimension

        const scale_x = d3.scaleLinear()
            .domain([0, dimension])
            .range([x0 + p.space * (p.n_channels[n] - 1), x0 + p.space * (p.n_channels[n] - 1) + correct_blocksize])
        const scale_y = d3.scaleLinear()
            .domain([0, dimension])
            .range([y0 + p.space * (p.n_channels[n] - 1), y0 + p.space * (p.n_channels[n] - 1) + correct_blocksize])


        for (let k = 0; k < p.n_channels[n]; k++) {
            const g = layer.append('g')
            g.append("rect")
                .attr('x', x0 + p.space * k)
                .attr('y', y0 + p.space * k)
                .attr('width', correct_blocksize)
                .attr('height', correct_blocksize)
                .attr('fill', "white")
                .attr('stroke', 'black')
                .attr('stroke-width', 1)

            if (true_n === 2 * p.kernel_size.length - 2) {
                g.append("image")
                    .attr("transform", "translate(" + (layers_width - block_size) / 2 + "," + (height - block_size) / 2 + ")")
                    .attr("xlink:href", "assets/eagle/sota/out.jpg")
                    .attr("width", block_size)
                    .attr("height", block_size);
            }

            for (let i = 0; i < dimension; i++) {
                for (let j = 0; j < dimension; j++) {
                    if (true_n === 2 * p.kernel_size.length - 2) {
                        g.append('rect')
                            .attr("class", "pixel_" + i + "_" + j + " pixel")
                            .attr('x', x0 + p.space * k + pixel_size * i - 1)
                            .attr('y', y0 + p.space * k + pixel_size * j - 1)
                            .attr('width', pixel_size + 2)
                            .attr('height', pixel_size + 2)
                            .attr('stroke', "none")
                            .attr("fill", "white")
                            .attr("opacity", 1)
                            .attr("visibility", "visible")
                    } else {
                        g.append('rect')
                            .attr("class", "pixel_" + i + "_" + j + " pixel")
                            .attr('x', x0 + p.space * k + pixel_size * i)
                            .attr('y', y0 + p.space * k + pixel_size * j)
                            .attr('width', pixel_size)
                            .attr('height', pixel_size)
                            .attr('stroke', "none")
                            .attr("fill", color(true_n))
                            .attr("opacity", d3.randomUniform(0.1, 0.9)())
                            .attr("visibility", "hidden")
                    }
                }
            }
        }


        const blocks = kernel.append('g')

        for (let i = 0; i < p.kernel_size[n]; i++) {
            for (let j = 0; j < p.kernel_size[n]; j++) {
                blocks.append('rect')
                    .attr('x', scale_x(i))
                    .attr('y', scale_y(j))
                    .attr('width', pixel_size)
                    .attr('height', pixel_size)
                    .attr('stroke', 'black')
                    .attr('stroke-width', 1)
                    .attr("fill", "black")
                    .attr("opacity", 0)
            }
        }
        const pixel = layer.append('rect')
            .attr('x', scale_x(0))
            .attr('y', scale_y(0))
            .attr('width', pixel_size)
            .attr('height', pixel_size)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr("fill", "black")
            .attr("opacity", 0)


        return {
            layer: layer,
            scale_x: scale_x,
            scale_y: scale_y,
            pixel_size: pixel_size,
            dimension: dimension,
            kernel: kernel,
            pixel: pixel,
            x: 0,
            y: 0,
        }
    }


    let layers = []
    for (var i = 0; i < 2 * p.kernel_size.length - 1; i++) {
        layers.push(create_layer(i))
    }

    for (let i = 0; i < layers.length; i++) {
        if (i === 0) {
            svg.append("text")
                .attr("x", layers_width * i + layers_width / 2)
                .attr("y", height / 2 + block_size / 2 + 20)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .style("font-size", "2rem")
                .text("Input")
        } else if (i === layers.length - 1) {
            svg.append("text")
                .attr("x", layers_width * i + layers_width / 2)
                .attr("y", height / 2 + block_size / 2 + 20)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .style("font-size", "2rem")
                .text("Output")
        } else {
            svg.append("text")
                .attr("x", layers_width * i + layers_width / 2)
                .attr("y", height / 2 + block_size / 2 + 20)
                .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
                .style("font-size", "2rem")
                .text("Layer " + (i))

        }
    }

    layers[0].layer.append("image")
        .attr("transform", "translate(" + (layers_width - block_size) / 2 + "," + (height - block_size) / 2 + ")")
        .attr("xlink:href", "assets/eagle/sota/in.jpg")
        .attr("width", block_size)
        .attr("height", block_size);


    var line_g = svg.append("g")
        .attr("transform", "translate(" + layers_width + ",0)")
        .attr("opacity", 0);
    var lines = []

    for (var i = 0; i < 4; i++) {
        lines.push(line_g.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 100)
            .attr("y2", 100)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("opacity", 1)
            .attr("stroke-dasharray", "5,5"))
    }

    function move(layer_id) {
        const layer1 = layers[layer_id]
        const layer2 = layers[layer_id + 1]

        var flag = false;
        if (layer_id < p.kernel_size.length - 1) {

            layer1.x = layer1.x + 1
            if (layer1.x > layer1.dimension - p.kernel_size[layer_id]) {
                layer1.x = 0
                layer1.y = layer1.y + 1
                if (layer1.y > layer1.dimension - p.kernel_size[layer_id]) {
                    layer1.x = 0
                    layer1.y = 0
                    flag = true;
                }
            }
            layer1.kernel.selectAll('rect')
                .attr("opacity", 0.5)
                .attr('x', function (d, i) {
                    return layer1.scale_x(i % p.kernel_size[layer_id] + layer1.x)
                })
                .attr('y', function (d, i) {
                    return layer1.scale_y(Math.floor(i / p.kernel_size[layer_id]) + layer1.y)
                })

            layer2.pixel.attr("opacity", 0.5)
                .attr('x', layer2.scale_x(layer1.x))
                .attr('y', layer2.scale_y(layer1.y))

            layer2.layer.selectAll(".pixel_" + layer1.x + "_" + layer1.y)
                .attr("visibility", "visible")

            line_g.attr("transform", "translate(" + layers_width * (layer_id) + ",0)").attr("opacity", 1);

            lines[0].attr("x1", layer1.scale_x(layer1.x))
                .attr("y1", layer1.scale_y(layer1.y))
                .attr("x2", layer2.scale_x(layer1.x) + layers_width)
                .attr("y2", layer2.scale_y(layer1.y))

            lines[1].attr("x1", layer1.scale_x(layer1.x + p.kernel_size[layer_id]))
                .attr("y1", layer1.scale_y(layer1.y))
                .attr("x2", layer2.scale_x(layer1.x) + layers_width + layer2.pixel_size)
                .attr("y2", layer2.scale_y(layer1.y))

            lines[2].attr("x1", layer1.scale_x(layer1.x))
                .attr("y1", layer1.scale_y(layer1.y + p.kernel_size[layer_id]))
                .attr("x2", layer2.scale_x(layer1.x) + layers_width)
                .attr("y2", layer2.scale_y(layer1.y) + layer2.pixel_size)

            lines[3].attr("x1", layer1.scale_x(layer1.x + p.kernel_size[layer_id]))
                .attr("y1", layer1.scale_y(layer1.y + p.kernel_size[layer_id]))
                .attr("x2", layer2.scale_x(layer1.x) + layers_width + layer2.pixel_size)
                .attr("y2", layer2.scale_y(layer1.y) + layer2.pixel_size)
        } else {
            var correct_layer_id = p.kernel_size.length - (layer_id - p.kernel_size.length) - 2
            layer1.x = layer1.x + 1
            if (layer1.x > layer1.dimension - 1) {
                layer1.x = 0
                layer1.y = layer1.y + 1
                if (layer1.y > layer1.dimension - 1) {
                    layer1.x = 0
                    layer1.y = 0
                    flag = true;
                }
            }
            layer2.kernel.selectAll('rect')
                .attr("opacity", 0.5)
                .attr('x', function (d, i) {
                    return layer2.scale_x(i % p.kernel_size[correct_layer_id - 1] + layer1.x)
                })
                .attr('y', function (d, i) {
                    return layer2.scale_y(Math.floor(i / p.kernel_size[correct_layer_id - 1]) + layer1.y)
                })
            layer1.pixel.attr("opacity", 0.5)
                .attr('x', layer1.scale_x(layer1.x))
                .attr('y', layer1.scale_y(layer1.y))

            for (var i = 0; i < p.kernel_size[correct_layer_id - 1]; i++) {
                for (var j = 0; j < p.kernel_size[correct_layer_id - 1]; j++) {
                    if (layer_id == layers.length - 2) {
                        layer2.layer.selectAll(".pixel_" + (layer1.x + i) + "_" + (layer1.y + j))
                            .attr("visibility", "hidden")
                    } else {
                        layer2.layer.selectAll(".pixel_" + (layer1.x + i) + "_" + (layer1.y + j))
                            .attr("visibility", "visible")
                    }
                }
            }

            line_g.attr("transform", "translate(" + layers_width * (layer_id) + ",0)").attr("opacity", 1);

            lines[0].attr("x1", layer1.scale_x(layer1.x))
                .attr("y1", layer1.scale_y(layer1.y))
                .attr("x2", layer2.scale_x(layer1.x) + layers_width)
                .attr("y2", layer2.scale_y(layer1.y))

            lines[1].attr("x1", layer1.scale_x(layer1.x) + layer1.pixel_size)
                .attr("y1", layer1.scale_y(layer1.y))
                .attr("x2", layer2.scale_x(layer1.x) + layers_width + p.kernel_size[correct_layer_id - 1] * layer2.pixel_size)
                .attr("y2", layer2.scale_y(layer1.y))

            lines[2].attr("x1", layer1.scale_x(layer1.x))
                .attr("y1", layer1.scale_y(layer1.y) + layer1.pixel_size)
                .attr("x2", layer2.scale_x(layer1.x) + layers_width)
                .attr("y2", layer2.scale_y(layer1.y) + p.kernel_size[correct_layer_id - 1] * layer2.pixel_size)

            lines[3].attr("x1", layer1.scale_x(layer1.x) + layer1.pixel_size)
                .attr("y1", layer1.scale_y(layer1.y) + layer1.pixel_size)
                .attr("x2", layer2.scale_x(layer1.x) + layers_width + p.kernel_size[correct_layer_id - 1] * layer2.pixel_size)
                .attr("y2", layer2.scale_y(layer1.y) + p.kernel_size[correct_layer_id - 1] * layer2.pixel_size)

        }

        return flag;
    }

    var current_layer = 0;

    function animate() {
        var flag = move(current_layer)
        if (flag) {
            layers[current_layer].kernel.selectAll('rect')
                .attr("opacity", 0)
            layers[current_layer].pixel.attr("opacity", 0)
            layers[current_layer + 1].pixel.attr("opacity", 0)
            layers[current_layer + 1].kernel.selectAll('rect')
                .attr("opacity", 0)
            line_g.attr("opacity", 0)

            current_layer = current_layer + 1


            if (current_layer === layers.length - 1) {
                current_layer = 0
                for (var i = 1; i < layers.length; i++) {
                    if (i < layers.length - 1) {
                        layers[i].layer.selectAll(".pixel")
                            .attr("visibility", "hidden")

                    } else {
                        layers[i].layer.selectAll(".pixel")
                            .attr("visibility", "visible")
                    }
                }
            }

            if (current_layer + 1 < layers.length - 1) {
                layers[current_layer + 1].layer.selectAll(".pixel_0_0")
                    .attr("visibility", "visible")
            } else {
                layers[current_layer + 1].layer.selectAll(".pixel_0_0")
                    .attr("visibility", "hidden")
            }
        }
    }

    let interval;

    return {
        steps: [],
        onSlideEnter: () => {
            clearInterval(interval);
            interval = setInterval(animate, p.interval)
        },
        onSlideLeave: () => {
            clearInterval(interval)
        }
    }
}
