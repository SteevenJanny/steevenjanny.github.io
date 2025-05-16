var square_space_factor = 0.75

const arxivParams = {
    legendHeight: 100,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 5,
    marginRight: 5,
    width: 1000,
    height: 1000,
    gapFactor: 0.75,
}

const svgArxiv = d3.select("#author_block_container").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0, 0, arxivParams.width, arxivParams.height]);


var colorScale = d3.scaleOrdinal(d3.schemePaired)
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);

const legendItemWidth = (arxivParams.width - arxivParams.marginLeft - arxivParams.marginRight) / 12;
const legendStartY = arxivParams.height - arxivParams.legendHeight;
const boxSize = 65;


// LEGEND
svgArxiv.append("rect")
    .attr("x", arxivParams.marginLeft)
    .attr("y", legendStartY)
    .attr("width", arxivParams.width - arxivParams.marginLeft - arxivParams.marginRight)
    .attr("height", arxivParams.legendHeight)
    .attr("fill", "#EFEFEF")
    .attr("rx", 10)
    .attr("ry", 10);

for (n = 1; n < 13; n++) {

    svgArxiv.append("rect")
        .attr("x", (n - 0.5) * legendItemWidth + arxivParams.marginLeft - boxSize / 2)
        .attr("y", legendStartY + arxivParams.legendHeight / 2 - boxSize / 2)
        .attr("width", boxSize)
        .attr("height", boxSize)
        .attr("fill", colorScale(n))
        .attr("rx", 10)
        .attr("ry", 10);
    svgArxiv.append("text")
        .attr("x", (n - 0.5) * legendItemWidth + arxivParams.marginLeft)
        .attr("y", legendStartY + arxivParams.legendHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'sans-serif')
        .attr('alignment-baseline', 'middle')
        .attr("font-size", 25)
        .text((n === 12 ? "+" : "") + n + "p.");
}

const list_rects = svgArxiv.append("g")
    .attr("transform", "translate(0,0)")
    .attr("id", "list_rects")
    .attr("opacity", 1);


// Make a box to display author name when mouse is over a rect
const authorNameBox = svgArxiv.append("g")
    .attr("transform", "translate(0,0)")
    .attr("id", "author_name_box")
    .attr("opacity", 0);

authorNameBox.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 300)
    .attr("height", 50)
    .attr("fill", "lightgrey")
    .attr("stroke", "black")
    .attr("rx", 10)
    .attr("ry", 10);

authorNameBox.append("text")
    .attr("x", 150)
    .attr("y", 25)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .attr('alignment-baseline', 'middle')
    .attr("font-size", 20)
    .attr("id", "author_name_text")
    .text("Author name");


var xScaleArxiv = d3.scaleLinear()
    .range([arxivParams.marginLeft, 1000 - arxivParams.marginRight]);

var yScaleArxiv = d3.scaleLinear()
    .range([arxivParams.marginTop, 1000 - arxivParams.marginBottom - arxivParams.legendHeight]);

let lastAuthor = {};

function updateAuthorBlocks(papersByAuthor) {
    document.getElementById("placeholder").style.display = "none";
    document.getElementById("main_container").style.display = "block";
    // PapersByAuthor is a dictionary with author name as key and set of papers as value
    lastAuthor = papersByAuthor;
    // papers_by_author is a dictionary with author name as key and set of papers as value
    const withSingleton = document.getElementById("singleton").checked;
    const firstAuthors = document.getElementById("first_authors").checked;

    // Step 1 : create a dictionary with number of papers as key and number of authors as value
    let validAuthors = {...papersByAuthor};
    if (firstAuthors) {
        // Remove authors with name that do not appear at first position in at least one paper
        validAuthors = {};
        for (const author in papersByAuthor) {
            const papers = papersByAuthor[author];
            for (const paper of papers) {
                if (paper.authors[0] === author) {
                    validAuthors[author] = papers;
                    break;
                }
            }
        }
    }
    if (!withSingleton) {
        // Remove authors with only one paper
        for (const author in validAuthors) {
            if (validAuthors[author].size === 1) {
                delete validAuthors[author];
            }
        }
    }

    const startDate = new Date(document.getElementById("start_date").value);
    // Filter papers by date
    for (const author in validAuthors) {
        const papers = validAuthors[author];
        const filteredPapers = new Set();
        papers.forEach(function (paper) {
            let date = new Date(paper.date);
            if (date >= startDate) {
                filteredPapers.add(paper);
            }
        });
        if (filteredPapers.size === 0) {
            delete validAuthors[author];
        } else {
            validAuthors[author] = filteredPapers;
        }

    }
    console.log(startDate);

    // Number of authors with more than 1 paper
    const N_authors = Object.keys(validAuthors).length;


    const sortedAuthors = Object.keys(validAuthors).sort(function (a, b) {
        return validAuthors[b].size - validAuthors[a].size;
    });

    const dim = findBestRectangleDimensions(N_authors);
    const width = 1000 - arxivParams.marginLeft - arxivParams.marginRight;
    const height = 1000 - arxivParams.marginTop - arxivParams.marginBottom - arxivParams.legendHeight;
    const rectX = (width / dim[0]) * arxivParams.gapFactor
    const rectY = (height / dim[1]) * arxivParams.gapFactor

    xScaleArxiv.domain([0, dim[0]]);
    yScaleArxiv.domain([0, dim[1]]);


    // Remove all rects
    list_rects.selectAll("rect").remove();

    var x = 0;
    var y = 0;
    for (var i = 0; i < N_authors; i++) {
        let current_author = sortedAuthors[i];
        let n_papers = validAuthors[current_author].size;
        let color_indx = Math.min(n_papers, 12);
        list_rects.append("rect")
            .attr("x", xScaleArxiv(x))
            .attr("y", yScaleArxiv(y))
            .attr("width", 0)
            .attr("height", 0)
            .attr("fill", "darkblue")
            .attr("stroke", "none")
            .attr("rx", 0)
            .attr("ry", 0)
            .attr("transform", "translate(5,5)")
            .attr("rx", rectX / 10).attr("ry", rectX / 10)
            .attr("id", "rect" + x + "_" + y)
            .attr("author_name", current_author)
            .attr("x_index", x).attr("y_index", y)
            .attr("n_papers", n_papers)
            .attr("identified", false)
            .on("mouseover", function () {
                let x = d3.select(this).attr("x_index");
                let y = d3.select(this).attr("y_index");
                authorNameBox.attr("opacity", 1);
                const yshift = (y > dim[1] / 2) ? -rectY - 45 : 0;
                const xshift = (x > dim[0] / 2) ? -rectX - 330 : 0;

                authorNameBox.attr("transform", "translate(" + (xScaleArxiv(x) + rectX + 10 + xshift) + "," + (yScaleArxiv(y) + rectY + 10 + yshift) + ")");
                d3.select("#author_name_text").text(d3.select(this).attr("author_name") + " (" + d3.select(this).attr("n_papers") + " papers)");
                d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
                // Set font size of author name to fit in box
                let fontSize = 25;
                let textWidth = d3.select("#author_name_text").node().getBBox().width;

                d3.select("#author_name_text").attr("font-size", fontSize);
                while (textWidth > 300) {
                    fontSize -= 1;
                    d3.select("#author_name_text").attr("font-size", fontSize);
                    textWidth = d3.select("#author_name_text").node().getBBox().width;
                }

            })
            .on("mouseout", function () {
                authorNameBox.attr("opacity", 0);
                // prevent mouse to interact with author name box
                d3.select("#author_name_box").attr("pointer-events", "none");
                if (d3.select(this).attr("identified") === "false") {
                    d3.select(this).attr("stroke", "none");
                } else {
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
                }
            })
            .on("click", function () {
                // Display papers by author in div id="paper_list"
                let authorName = d3.select(this).attr("author_name");
                let paperTitle = "<h2 class='text-center'>" + authorName + "</h2>";
                let paperElem = ""
                validAuthors[authorName].forEach(function (paper) {
                    let paper_authors = "";
                    paper.authors.forEach(function (author) {
                        paper_authors += author + ", ";
                    });
                    paper_authors = paper_authors.slice(0, -2);
                    paperElem += `<li class='list-group-item'>
                        <a href=${paper.url} target='_blank' class='link-dark'> <b>${paper.title}</b></a><br>${paper_authors}<br>${paper.date}</li>`;
                });

                const paperListContainer = `
                    ${paperTitle}
                    <ul class="list-group mt-2">
                        ${paperElem}
                    </ul>`;
                d3.select("#paper_list").html(paperListContainer);
            })
            .transition().duration(1000)
            .attr("width", rectX).attr("height", rectY)
            .attr("fill", colorScale(color_indx)).attr("transform", "translate(5,5)");
        x += 1;
        if (x >= dim[0]) {
            x = 0;
            y += 1;
        }
    }
    highlightAuthor(document.getElementById("myForm2"));
    generateTabs(validAuthors);
}

function generateTabs(validAuthors) {
    const tabList = document.getElementById("categoryTabs");
    const tabContent = document.getElementById("tabContent");

    // Count unique n_papers in papersByAuthor
    let uniqueNumPapers = new Set();
    for (const author in validAuthors) {
        const n_papers = Math.min(validAuthors[author].size, 12);
        uniqueNumPapers.add(n_papers);
    }

    // Sort
    uniqueNumPapers = Array.from(uniqueNumPapers).sort((a, b) => a - b);
    tabList.innerHTML = "";
    tabContent.innerHTML = "";

    let first = true;
    for (const n_papers of uniqueNumPapers) {
        const tabId = "tab-" + n_papers;
        const tab = `<li class="nav-item">
                        <a class="nav-link ${first ? 'active' : ''}" data-bs-toggle="tab" href="#${tabId}">${n_papers === 12 ? "+" : ""}${n_papers} papers</a>
                     </li>`;
        tabList.innerHTML += tab;
        let rows = []
        let index = 0;
        for (const author in validAuthors) {
            if (validAuthors[author].size === n_papers || (n_papers === 12 && validAuthors[author].size > 12)) {

                let papers = validAuthors[author];
                let paperList = [];
                papers.forEach(function (paper) {
                    // Format paper date from YYYY-MM-DDTHH:MM:SSZ to YYYY-MM-DD
                    let date = new Date(paper.date);
                    date = date.toISOString().split("T")[0];
                    paper.date = date;
                    paperList.push({title: paper.title, date: paper.date, url: paper.url});
                });
                rows.push(`<tr>
                            <td>${author}</td>
                            <td style="width: 75%;">
                                <button class="btn btn-primary btn-sm" data-bs-toggle="collapse" data-bs-target="#papers${n_papers}${index}">
                                    Show Papers
                                </button>
                                <div class="collapse" id="papers${n_papers}${index}">
                                    <ul class="list-group mt-2">
                                        ${paperList.map(paper => `<li class="list-group-item"><a href="${paper.url}" target="_blank" class="link-dark"><b>${paper.title}</b></a> (${paper.date})</li>`).join("")}
                                    </ul>
                                </div>
                            </td>
                        </tr>`);
                index++;
            }
        }
        // Alphabetically sort rows
        rows = rows.sort((a, b) => {
            const authorA = a.match(/<td>(.*?)<\/td>/)[1];
            const authorB = b.match(/<td>(.*?)<\/td>/)[1];
            return authorA.localeCompare(authorB);
        })
        rows = rows.join("");
        const tabContentHtml = `<div id="${tabId}" class="tab-pane fade ${first ? 'show active' : ''}">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Author</th>
                                                <th>Number of Papers</th>
                                            </tr>
                                        </thead>
                                        <tbody>${rows}</tbody>
                                    </table>
                                </div>`;
        tabContent.innerHTML += tabContentHtml;
        first = false;

    }

}

function highlightAuthor(input) {
    pattern = input.name.value
    // Simply look if pattern is in author name for each author in list_rects

    list_rects.selectAll("rect").each(function (d) {
        var author_name = d3.select(this).attr("author_name");
        if (author_name.toLowerCase().includes(pattern.toLowerCase()) && pattern !== "") {
            // Highlight rectangle and glowing effect
            d3.select(this).attr("stroke", "black").attr("stroke-width", 2)
                .attr("identified", true)

        } else {
            d3.select(this).attr("stroke", "none").attr("identified", false).attr("stroke-width", 2);
        }
    });

}


function findBestRectangleDimensions(N) {
    let bestCost = Infinity;
    let bestDimensions = [N, 1]; // Default to a single column

    for (let a = 2; a <= N; a++) {
        const b = Math.ceil(N / a);
        const waste = a * b - N;
        const aspectRatio = Math.max(a / b, b / a);
        const cost = waste + 10 * aspectRatio;
        if (cost < bestCost) {
            bestCost = cost;
            bestDimensions = [Math.max(a, b), Math.min(a, b)];
        }
    }

    return bestDimensions;
}


document.getElementById("singleton").onclick = function () {
    updateAuthorBlocks(lastAuthor);
}

document.getElementById("first_authors").onclick = function () {
    updateAuthorBlocks(lastAuthor);
}

document.getElementById("start_date").onchange = function () {
    updateAuthorBlocks(lastAuthor);
}