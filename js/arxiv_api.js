function string_sanitizer(str) {
    // Remove special characters, convert to lowercase, replace spaces with +
    // and remove trailing +
    return str.replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase().replace(/ /g, "+").replace(/\+$/, "");
}

function forge_query(keyword){
    // Check value of radio buttons
    var radio_buttons = document.getElementsByName("search_type");
    var query = "http://export.arxiv.org/api/query?search_query=";
    query +=  "(cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CV+OR+cat:cs.NE)"

    if (radio_buttons[2].checked) {
        query +=  "+AND+"+string_sanitizer(keyword);
    }
    else if (radio_buttons[0].checked) {
        query += "+AND+ti:" + string_sanitizer(keyword);
    }
    else if (radio_buttons[1].checked) {
        query += "+AND+abs:" + string_sanitizer(keyword);
    }
    query += "&start=0&max_results=10000&sortBy=lastUpdatedDate&sortOrder=descending";
    return query;

}
function arxiv_search(keyword) {
    // var cat = "(cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CV+OR+cat:cs.NE)"
    // var url = "http://export.arxiv.org/api/query?search_query=" + cat + "+AND+ti:" + string_sanitizer(keyword) + "&start=0&max_results=10000&sortBy=lastUpdatedDate&sortOrder=descending";
    var url = forge_query(keyword);
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            document.getElementById("graph_title").innerHTML = "Results for \"" + keyword + "\"";

            loading_anim.innerHTML = ""
            var results = filterResults(xhr.responseXML);

            // Sort the results by date (ascending)
            results.sort(function (a, b) {
                return new Date(a.date) - new Date(b.date);
            });

            // Compute cumulative sum of the number of papers
            var cumsum = [];
            var sum = 0;
            for (var i = 0; i < results.length; i++) {
                sum += 1;
                cumsum.push({
                    "date": new Date(results[i].date),
                    "value": sum
                });
            }

            updateChart1(cumsum);

            var authors = paper_per_author(results);
            updateChart2(authors);
            if (results.length > 0) {
                loading_anim.innerHTML = "";
            }
            else {
                loading_anim.innerHTML = "<div class=\"alert alert-danger\" role=\"alert\">No results found (maybe check the caveat ?)</div>";
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

// check GET parameters
var urlParams = new URLSearchParams(window.location.search);
var keyword = urlParams.get('keyword');
if (keyword) {
    document.getElementById("keywords_field").value = keyword;

    loading_anim.innerHTML = "<div class=\"spinner-border\" role=\"status\">";
    arxiv_search(keyword);

}

document.getElementById('myForm').onsubmit = function () {
    testResults(this);
    return false;
}

document.getElementById('myForm2').onsubmit = function () {
    return false;
}

var loading_anim = document.getElementById('loading_anim');


function testResults(form) {
    var inputValue = form.keyword.value;
    loading_anim.innerHTML = "<div class=\"spinner-border\" role=\"status\">";
    arxiv_search(inputValue);
}

