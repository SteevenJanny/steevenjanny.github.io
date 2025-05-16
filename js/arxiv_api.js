function string_sanitizer(str) {
    let formated_str = str.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase()
    formated_str = formated_str.replace(/\+$/, "")
    return formated_str.split(" ")

}

function forge_query(keyword) {
    // Check value of radio buttons
    var radio_buttons = document.getElementsByName("search_type");
    var query = "https://export.arxiv.org/api/query?search_query=";
    query += "(cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CV+OR+cat:cs.NE)"

    let clean_keywords = string_sanitizer(keyword)
    const search_prefix = radio_buttons[2].checked ? "" : radio_buttons[0].checked ? "ti:" : "abs:"
    clean_keywords.forEach(element => {
        if (element !== "") {
            query += "+AND+" + search_prefix + element;
        }
    })
    query += "&start=0&max_results=10000&sortBy=lastUpdatedDate&sortOrder=descending";
    return query;

}

function arxiv_search(keyword) {
    const url = forge_query(keyword);
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            document.getElementById("graph_title").innerHTML = "Results for \"" + keyword + "\"";

            loading_anim.innerHTML = ""
            let results = filterResults(xhr.responseXML);

            // Sort the results by date (ascending)
            results.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });

            var authors = paper_per_author(results);
            updateAuthorBlocks(authors);
            if (results.length > 0) {
                loading_anim.innerHTML = "";
            } else {
                loading_anim.innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">No results found...</div>";
            }

        }
    }
    xhr.send();
}

function filterResults(response) {
    // Only keep the title and the submitted data
    var results = response.getElementsByTagName("entry");
    var filteredResults = [];
    for (var i = 0; i < results.length; i++) {
        var title = results[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
        var date = results[i].getElementsByTagName("published")[0].childNodes[0].nodeValue;
        var authors = results[i].getElementsByTagName("author");
        var authorList = [];
        for (let j = 0; j < authors.length; j++) {
            const author = authors[j].getElementsByTagName("name")[0].childNodes[0].nodeValue;
            authorList.push(author);
        }
        var url = results[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
        filteredResults.push({
            "title": title,
            "date": date,
            "authors": authorList,
            "url": url
        });
    }
    return filteredResults;
}


function paper_per_author(results) {
    var authors = {};
    for (var i = 0; i < results.length; i++) {
        for (var j = 0; j < results[i].authors.length; j++) {
            var author = results[i].authors[j];
            if (author in authors) {
                authors[author].add(results[i]);
            } else {
                authors[author] = new Set();
                authors[author].add(results[i]);
            }
        }
    }
    return authors;
}
document.getElementById('search_form').onsubmit = function () {
    launchSearch(this);
    return false;
}

document.getElementById('myForm2').onsubmit = function () {
    return false;
}

var loading_anim = document.getElementById('loading_anim');


function launchSearch(form) {
    loading_anim.innerHTML = "<div class=\"spinner-border\" role=\"status\"></div><span>This might take a while...</span>";
    arxiv_search(form.keyword.value);
}

