// listen to the submit event of the form

var square_space_factor = 0.75


var svg2 = d3.select("#svg_container2").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", [0, 0, 1000, 1000]);

var N = 10000;

var x2_scale = d3.scaleLinear()
    .domain([0, Math.floor(Math.sqrt(N))])
    .range([0, 900]);

var y2_scale = d3.scaleLinear()
    .domain([0, Math.floor(Math.sqrt(N))])
    .range([0, 800]);

gap_x = 980 / 5;
gap_y = 120 / 2;


var color_scale = d3.scaleOrdinal(d3.schemePaired)
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

svg2.append("text")
    .attr("x", 500)
    .attr("y", 850)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .attr('alignment-baseline', 'middle')
    .attr("font-size", 30)
    .style("font-weight", "bold")
    .text("Number of authors with ...");

for (i = 0; i < 2; i++) {
    for (j = 0; j < 5; j++) {
        n_papiers = i * 5 + j + 1;
        svg2.append("rect")
            .attr("x", 5 + j * gap_x)
            .attr("y", 880 + i * gap_y)
            .attr("width", 50)
            .attr("height", 50)
            .attr("fill", color_scale(n_papiers))
            .attr("rx", 10)
            .attr("ry", 10);
        svg2.append("text")
            .attr("x", 60 + j * gap_x)
            .attr("y", 905 + i * gap_y)
            .attr('text-anchor', 'start')
            .attr('font-family', 'sans-serif')
            .attr('alignment-baseline', 'middle')
            .attr("font-size", 30)
            .text("" + n_papiers + "+ papers");
    }
}
var list_rects = svg2.append("g")
    .attr("transform", "translate(0,0)")
    .attr("id", "list_rects")
    .attr("opacity", 1);


// Make a box to display author name when mouse is over a rect
var author_name_box = svg2.append("g")
    .attr("transform", "translate(0,0)")
    .attr("id", "author_name_box")
    .attr("opacity", 0);

author_name_box.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 300)
    .attr("height", 50)
    .attr("fill", "lightgrey")
    .attr("stroke", "black")
    .attr("rx", 10)
    .attr("ry", 10);

author_name_box.append("text")
    .attr("x", 150)
    .attr("y", 25)
    .attr('text-anchor', 'middle')
    .attr('font-family', 'sans-serif')
    .attr('alignment-baseline', 'middle')
    .attr("font-size", 20)
    .attr("id", "author_name_text")
    .text("Author name");

authors_init = {}
for (var i = 0; i < 99; i++) {
    authors_init["author" + i] = new Set();
    for (var j = 0; j < i % 11; j++) {
        authors_init["author" + i].add("paper" + j);
    }
}
updateChart2(authors_init);

function updateChart2(papers_by_author) {
    // papers_by_author is a dictionary with author name as key and set of papers as value

    var include_singletons = document.getElementById("singleton").checked;
    // Step 1 : create a dictionary with number of papers as key and number of authors as value
    var authors = {};
    for (var author in papers_by_author) {
        if (papers_by_author[author].size === 1 && !include_singletons) {
            continue;
        }
        authors[author] = papers_by_author[author].size;
    }

    // Number of authors with more than 1 paper
    var N_authors = Object.keys(authors).length;


    var sorted_authors = Object.keys(authors).sort(function (a, b) {
            return authors[b] - authors[a];
        }
    );

    var dim = findBestRectangleDimensions(N_authors);
    rect_size_x = (900 / dim[0]) * square_space_factor;
    rect_size_y = (800 / dim[1]) * square_space_factor;

    var delta = (1000 - (dim[0] * rect_size_x)) / (dim[0] - 1);
    x2_scale.domain([0, dim[0]]);
    y2_scale.domain([0, dim[1]]);
    x2_scale.range([0, 1000]);


    // Remove all rects
    list_rects.selectAll("rect").remove();

    var x = 0;
    var y = 0;
    var limit = 0;
    for (var i = 0; i < N_authors; i++) {
        var current_author = sorted_authors[i];
        var n_papers = authors[current_author];
        var color_indx = Math.min(n_papers, 10);
        var r = list_rects.append("rect")
            .attr("x", x2_scale(x))
            .attr("y", y2_scale(y))
            .attr("width", 0)
            .attr("height", 0)
            .attr("fill", "darkblue")
            .attr("stroke", "none")
            .attr("rx", 0)
            .attr("ry", 0)
            .attr("transform", "translate(5,5)")
            .attr("rx", rect_size_x / 10).attr("ry", rect_size_x / 10)
            .attr("id", "rect" + x + "_" + y)
            .attr("author_name", current_author)
            .attr("x_index", x).attr("y_index", y)
            .attr("n_papers", n_papers)
            .attr("identified", false);

        r.transition().duration(1000)
            .attr("width", rect_size_x).attr("height", rect_size_y)
            .attr("fill", color_scale(color_indx)).attr("transform", "translate(5,5)");
        x += 1;
        if (x >= dim[0]) {
            x = 0;
            y += 1;
        }
        r.on("mouseover", function () {
            var author_name = d3.select(this).attr("author_name");
            var n_papers = d3.select(this).attr("n_papers");
            var x = d3.select(this).attr("x_index");
            var y = d3.select(this).attr("y_index");
            author_name_box.attr("opacity", 1);
            var yshift = 0;
            if (y > dim[1] / 2) {
                yshift = -rect_size_y - 20 - 25;
            }
            var xshift = 0;
            if (x > dim[0] / 2) {
                xshift = -rect_size_x - 20 - 300
            }
            author_name_box.attr("transform", "translate(" + (x2_scale(x) + rect_size_x + 10 + xshift) + "," + (y2_scale(y) + rect_size_y + 10 + yshift) + ")");
            d3.select("#author_name_text").text(author_name + " (" + n_papers + " papers)");
            d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
            // Set font size of author name to fit in box
            var font_size = 25;
            d3.select("#author_name_text").attr("font-size", font_size);
            var text_width = d3.select("#author_name_text").node().getBBox().width;

            while (text_width > 300) {
                font_size -= 1;
                d3.select("#author_name_text").attr("font-size", font_size);
                text_width = d3.select("#author_name_text").node().getBBox().width;
            }

        })
            .on("mouseout", function () {
                author_name_box.attr("opacity", 0);
                if (d3.select(this).attr("identified") === "false") {
                    d3.select(this).attr("stroke", "none");
                } else {
                    d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
                }
            })
            .on("click", function () {
                // Display papers by author in div id="paper_list"
                var author_name = d3.select(this).attr("author_name");
                var paper_list = papers_by_author[author_name];
                var paper_list_html = "<h3>" + author_name + "</h3>";
                paper_list.forEach(function (paper) {
                        var paper_title = paper.title;
                        var paper_authors_list = paper.authors;
                        var paper_date = paper.date;
                        var url = paper.url;
                        var paper_authors = "";
                        paper_authors_list.forEach(function (author) {
                                paper_authors += author + ", ";
                            }
                        );
                        paper_authors = paper_authors.slice(0, -2);
                        paper_list_html += "<p><a href='" + url + "' target='_blank'>" + paper_title + "</a><br>" + paper_authors + "<br>" + paper_date + "</p>";
                    }
                );
                d3.select("#paper_list").html(paper_list_html);
            });
    }
    highlightAuthor(document.getElementById("myForm2"));
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
        }
    );

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


