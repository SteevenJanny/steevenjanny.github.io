import * as d3 from "d3";

const margin = {
    top: 40,
    right: 10,
    bottom: 10,
    left: 10,
    width: 1000,
    height: 200,
};


// Figure contains the main graph and 3 sliders to control the priming sequence length, output sequence length and stride
// and a "Start" and "Reset" button to control the animation
const innerHTMLContent = `
<div id="graph-endtoend-main"></div>
<div class="d-flex justify-content-center mt-3 fs-6">
    <div class="mx-3">
        <label for="primingSeqLength" class="form-label">Priming Sequence: <span id="priming-seq">1</span></label>
        <input type="range" class="form-range" min="1" max="4" value="1" id="primingSeqLength">
    </div>
    <div class="mx-3">
        <label for="outputSeqLength" class="form-label">Output Sequence: <span id="output-seq">1</span></label>
        <input type="range" class="form-range" min="1" max="4" value="1" id="outputSeqLength">
    </div>
    <div class="mx-3">
        <label for="stride" class="form-label">Stride: <span id="stride-val">1</span></label>
        <input type="range" class="form-range" min="1" max="5" value="1" id="stride">
    </div>
    <div class="mx-3 d-flex align-items-end">
        <button id="start-btn" class="btn btn-primary btn-sm me-2">Start</button>
        <button id="reset-btn" class="btn btn-secondary btn-sm">Reset</button>
    </div>
    
</div>
`

export function create(container, context) {

    container.innerHTML = innerHTMLContent;

    let primingSeqLength = 1;
    let outputSeqLength = 1;
    let stride = 1;


    const sliderPrimingSeqLength = container.querySelector("#primingSeqLength");
    const sliderOutputSeqLength = container.querySelector("#outputSeqLength");
    const sliderStride = container.querySelector("#stride");

    const primingSeqDisplay = container.querySelector("#priming-seq");
    const outputSeqDisplay = container.querySelector("#output-seq");
    const strideDisplay = container.querySelector("#stride-val");

    const startBtn = container.querySelector("#start-btn");
    const resetBtn = container.querySelector("#reset-btn");


    const svg = d3.select(container).select("#graph-endtoend-main")
        .append("svg")
        .attr("viewBox", [0, 0, margin.width, margin.height])
        .append("g");

    const img_urls = [];
    for (let i = 0; i < 10; i++) {
        img_urls.push("assets/sota/gt/" + i + '.jpg');
    }

    const padding = 4;
    const ymid = margin.top + (margin.height - margin.top - margin.bottom) / 2;
    const imgSize = (margin.width - margin.left - margin.right) / img_urls.length;
    const cornerRadius = 3;
    const borderWidth = 1;
    const imgDisplaySize = imgSize - padding * 2;


    const imgs = [];
    img_urls.forEach((img_url, i) => {
        const x = margin.left + i * imgSize + padding;
        const y = ymid - imgDisplaySize / 2;
        const clipId = `clip-rounded-${i}`;

        // Create rounded clip path once
        svg.append("clipPath")
            .attr("id", clipId)
            .append("rect")
            .attr("x", x)
            .attr("y", y)
            .attr("width", imgDisplaySize)
            .attr("height", imgDisplaySize)
            .attr("rx", cornerRadius)
            .attr("ry", cornerRadius);

        // Group for border + image with initial opacity 0
        const imgGroup = svg.append("g")
            .attr("opacity", 0);

        svg.append("rect")
            .attr("x", x - borderWidth / 2)
            .attr("y", y - borderWidth / 2)
            .attr("width", imgDisplaySize + borderWidth)
            .attr("height", imgDisplaySize + borderWidth)
            .attr("rx", cornerRadius + borderWidth / 2)
            .attr("ry", cornerRadius + borderWidth / 2)
            .attr("fill", "none")
            .attr("stroke", "lightgray")
            .attr("stroke-width", borderWidth);

        imgGroup.append("image")
            .attr("xlink:href", img_url)
            .attr("x", x)
            .attr("y", y)
            .attr("width", imgDisplaySize)
            .attr("height", imgDisplaySize)
            .attr("clip-path", `url(#${clipId})`);

        imgGroup.append("foreignObject")
            .attr("x", x)
            .attr("y", y)
            .attr("width", imgDisplaySize)
            .attr("height", imgDisplaySize)
            .append("xhtml:div")
            .style("font-size", "0.5em")
            .style("text-align", "center")
            .style("line-height", `${imgDisplaySize}px`)
            .style("background", "rgba(0, 0, 0, 0.25)")
            .style("color", "white")
            .text(`$ ${i < primingSeqLength ? "s(t" : "\\hat s(t+" + i})$`);


        imgs.push(imgGroup);
    });

    const modelGroup = svg.append("g")
        .attr("class", "model-group");

    const boxWidth = imgSize;
    const boxHeight = 50;
    const Yshift = 10;

    function drawModel(inptSeqLength, outputSeqLength, pos) {
        modelGroup.selectAll("g").remove();

        const model = modelGroup.append("g");

        model.append("rect")
            .attr("x", -boxWidth / 2)
            .attr("y", ymid - pos * (imgSize / 2 + boxHeight + Yshift))
            .attr("width", boxWidth)
            .attr("height", boxHeight)
            .attr("rx", cornerRadius)
            .attr("ry", cornerRadius)
            .attr("fill", "var(--bs-primary)");

        model.append("text")
            .attr("x", 0)
            .attr("y", ymid - pos * (imgSize / 2 + boxHeight / 2 + Yshift))
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "white")
            .attr("font-size", "0.7em")
            .text("Model");

        drawBranch(model, -imgSize * (inptSeqLength - 0.5), -imgSize / 2, pos, "backward", "var(--bs-success)");
        drawBranch(model, imgSize / 2, imgSize * (outputSeqLength - 0.5), pos, "forward", "var(--bs-danger)");
    }

    function drawBranch(model, firstX, lastX, pos, direction = "forward", color = "var(--bs-success)") {
        const historyShiftY = 5;

        const x0 = firstX - imgDisplaySize / 2 - padding / 2;
        const x1 = lastX + imgDisplaySize / 2 + padding / 2;
        const y0 = ymid - pos * (imgDisplaySize / 2 + historyShiftY);
        const y1 = ymid + pos * (imgDisplaySize / 2 + historyShiftY);

        model.append("rect")
            .attr("x", x0)
            .attr("y", y0)
            .attr("width", x1 - x0)
            .attr("height", y1 - y0 + 25)
            .attr("rx", cornerRadius)
            .attr("ry", cornerRadius)
            .attr("fill", color)
            .attr("opacity", 0.5);

        model.append("text")
            .attr("x", (x0 + x1) / 2)
            .attr("y", y0 + (y1 - y0) + 12.5)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("fill", "white")
            .attr("font-size", "0.6em")
            .text(direction === "forward" ? "Output" : "Input");

        const directionSign = direction === "forward" ? 1 : -1;
        model.append("line")
            .attr("x1", (firstX + lastX) / 2 + directionSign * imgSize / 4)
            .attr("y1", ymid - pos * (imgDisplaySize / 2 + historyShiftY))
            .attr("x2", (firstX + lastX) / 2 + directionSign * imgSize / 4)
            .attr("y2", ymid - pos * (imgSize / 2 + boxHeight / 2 + Yshift))
            .attr("stroke", "var(--bs-secondary)")
            .attr("stroke-width", 2);

        model.append("line")
            .attr("x1", (firstX + lastX) / 2 + directionSign * imgSize / 4)
            .attr("y1", ymid - pos * (imgSize / 2 + boxHeight / 2 + Yshift))
            .attr("x2", imgSize / 2 * directionSign)
            .attr("y2", ymid - pos * (imgSize / 2 + boxHeight / 2 + Yshift))
            .attr("stroke", "var(--bs-secondary)")
            .attr("stroke-width", 2);
    }

    drawModel(primingSeqLength, outputSeqLength, 1);

    let currentStep = -stride + primingSeqLength;
    const slideTimer = 500;
    imgs.forEach((img, i) => img.attr("opacity", i < primingSeqLength ? 1 : 0));


    function reset() {
        currentStep = -stride + primingSeqLength;
        imgs.forEach((img, i) => img.interrupt().attr("opacity", i < primingSeqLength ? 1 : 0));
        modelGroup.interrupt().attr("transform", `translate(${margin.left + primingSeqLength * imgSize}, 0)`);
    }

    let playAnimation = false;

    function predict() {
        if (!playAnimation) return; // Prevent multiple concurrent runs


        currentStep += stride;
        if (currentStep + outputSeqLength > img_urls.length) {
            return
        }
        modelGroup.interrupt()
            .transition()
            .duration(slideTimer)
            .attr("transform", `translate(${margin.left + currentStep * imgSize}, 0)`);

        // Update opacity in bulk without chaining transitions per image
        imgs.forEach((img, i) => {
            if (i < currentStep + outputSeqLength) {
                img.interrupt().transition().duration(slideTimer).attr("opacity", 1);
            } else {
                img.interrupt().transition().duration(slideTimer).attr("opacity", 0);
            }
        });
        setTimeout(predict, slideTimer);
    }

    sliderPrimingSeqLength.addEventListener("input", () => {
        primingSeqLength = parseInt(sliderPrimingSeqLength.value);
        primingSeqDisplay.textContent = primingSeqLength;
        drawModel(primingSeqLength, outputSeqLength, 1);
        reset();
    });

    sliderOutputSeqLength.addEventListener("input", () => {
        outputSeqLength = parseInt(sliderOutputSeqLength.value);
        outputSeqDisplay.textContent = outputSeqLength;
        drawModel(primingSeqLength, outputSeqLength, 1);
        reset();
    });

    sliderStride.addEventListener("input", () => {
        stride = parseInt(sliderStride.value);
        strideDisplay.textContent = stride;
    });

    startBtn.addEventListener("click", () => {
        if (!playAnimation) {
            playAnimation = true;
            predict();
        }
    })

    resetBtn.addEventListener("click", () => {
        playAnimation = false;
        reset();
    });


    reset();
    // predict();
    // update();
    let interval; // setInterval(update, 3 * slideTimer);
    return {
        steps: [],
        onSlideEnter() {
            // clearInterval(interval);
            // interval = setInterval(update, 3 * slideTimer);
        },
        onSlideLeave() {
            clearInterval(interval);
        }
    }
}
