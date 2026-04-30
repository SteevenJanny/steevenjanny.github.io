import { $ } from "jquery"
import * as d3 from "d3";
function create_buttons(data) {
    var buttons = "";
    if (data["url_pdf"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_pdf"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">PDF</a>`
    }
    if (data["url_code"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_code"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Code</a>`
    }
    if (data["url_dataset"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_dataset"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Dataset</a>`
    }
    if (data["url_poster"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_poster"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Poster</a>`
    }
    if (data["url_project"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_project"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Project Page</a>`
    }
    if (data["url_source"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_source"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Source Document</a>`
    }
    if (data["url_video"] !== "") {
        buttons += `<a class="btn btn-outline-primary btn-sm" href="${data["url_video"]}" target="_blank" rel="noopener" style=" margin: 8px 8px 8px 0">Video</a>`
    }
    return buttons;
}

function create_cite_button(folder_name) {
    // Read the bibtex file as a string
    var bibtex_file = "/content/" + folder_name + "/cite.bib";
    return `<button type="button" class="btn btn-outline-primary btn-page-header btn-sm" data-toggle="modal" data-target="#exampleModal" data-folder="${bibtex_file}">Cite</button>`;
}


$('#exampleModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('folder') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    d3.text(recipient).then(function (text) {
        modal.find('.model-bib').text(text)
    });
})

function loadPapers() {
    d3.json("/content/papers.json").then(function (json) {
        // Step 1: Extract all tags from the dataset
        const allTagsSet = new Set(["All"]); // "all" as default
        for (let key in json) {
            let paperTags = json[key].tags || [];
            paperTags.forEach(tag => allTagsSet.add(tag));
        }

        const allTags = Array.from(allTagsSet).sort();

        // Step 2: Build filter buttons dynamically if not already done
        const filterContainer = document.getElementById("tag_filters");
        if (filterContainer.dataset.initialized==="false") {
            filterContainer.innerHTML = ""; // clear if necessary

            // Sort tags
            allTags.sort((a, b) => a.localeCompare(b));

            allTags.forEach((tag, i) => {
                const label = document.createElement("label");
                label.className = "btn btn-outline-primary"

                const input = document.createElement("input");
                input.type = "radio";
                input.name = "tags";
                input.id = tag;
                input.className = "btn-check";
                if (tag === "all") input.checked = true;

                label.appendChild(input);
                label.appendChild(document.createTextNode(" " + tag));
                filterContainer.appendChild(label);
            });

            filterContainer.dataset.initialized = "true";
            // Rebind event listeners
            const tag_elements = document.getElementsByName("tags");
            for (let i = 0; i < tag_elements.length; i++) {
                tag_elements[i].addEventListener("change", function () {
                    loadPapers(); // reload on filter change
                });
            }
        }

        // Step 3: Filter papers by selected tag
        let selectedTag = "All";
        const tag_elements = document.getElementsByName("tags");
        for (let i = 0; i < tag_elements.length; i++) {
            if (tag_elements[i].checked) {
                selectedTag = tag_elements[i].id;
            }
        }

        const keys = Object.keys(json);
        const filteredPapers = keys.filter(k => selectedTag === "All" || json[k]["tags"].includes(selectedTag));

        const div = document.getElementById("papers_items");
        div.innerHTML = ""; // Clear list

        const n_papers_div = document.getElementById("n_papers");
        n_papers_div.innerHTML = filteredPapers.length + " elements";

        // Step 4: Add filtered papers with animation
        filteredPapers.forEach((key, index) => {
            const paper = json[key];
            const authors = paper["authors"].replace("Steeven Janny", "<b>Steeven Janny</b>");
            let buttons = create_buttons(paper) + create_cite_button(key);

            const card = document.createElement("div");
            const badges = paper["tags"].map(tag => `<span class="badge bg-secondary p-1 m-1">#${tag}</span>`).join(" ");
            card.className = "paper-card card mb-2";
            card.style.maxHeight = "200px";
            card.innerHTML = `
                <div class="row g-0 h-100">
                    <div class="col-md-2 h-100 border-end text-center align-content-center overflow-hidden">
                        <img src="/content/${key}/featured.png" class="rounded img-fluid w-75" alt="...">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${paper["title"]}</h5>
                            <div class="card-text">${paper["venue"]} - ${paper["year"]}</div>
                            <div class="card-text"><small class="text-body-secondary">${authors}</small></div>
                            <div class="btn-links">${buttons}</div>
                        </div>
                    </div>
                    <div class="col">
                        ${badges}
                    </div>
                </div>
            `;

            div.appendChild(card);

            // Animate each card with a staggered delay
            setTimeout(() => {
                card.classList.add("visible");
            }, index * 100);
        });
    });
}


window.addEventListener("DOMContentLoaded", loadPapers);
