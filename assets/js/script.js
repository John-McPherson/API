const API_KEY = "sl6TnDjcXmsXjD9udTksMzwMa7U";
const API_URL = "https://ci-jshint.herokuapp.com/api";
const resultsModal = new bootstrap.Modal(document.getElementById('resultsModal'));

document.getElementById('status').addEventListener("click", e => getStatus(e));
document.getElementById('submit').addEventListener("click", e => postForm(e));

function processOptions(form) {
    let options = [];
    for (let entry of form.entries()) {
        if (entry[0] === "options") {
            options.push(entry[1])
        }
    }
    form.delete("options");
    form.append("options", options.join());

    return form;

}

async function postForm(e) {
    const form = processOptions(new FormData(document.getElementById('checksform')));

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": API_KEY,
        },
        body: form,
    });

    const data = await response.json();

    if (response.ok) {
        displayErrors(data)
    } else {
        displayException(data)
        throw new Error(data.error);
    }

}

function displayErrors(data) {
    document.getElementById('resultsModalTitle').innerText = `JsHint Results ${data.file}`
    let results = ''

    if (data.total_errors === 0) {
        results = `<div class="no-errors">No errors reported!</div>`;
    } else {
        for (let error of data.error_list) {
            results += `<div>At line <span class="line>${error.line}</span>`
            results += `column <span class="column>${error.col}</span></div>`
            results += `<div class="error">${error.error}</div>`
        }
        document.getElementById('results-content').innerHTML = `<div>${results}</div>`
        resultsModal.show()
    }
}

async function getStatus(e) {
    const queryString = `${API_URL}?api_key=${API_KEY}`;
    const response = await fetch(queryString);
    const data = await response.json();

    if (response.ok) {
        displayStatus(data);
    } else {
        displayException(data)
        throw new Error(data.error);
    }
}

function displayStatus(data) {
    document.getElementById('resultsModalTitle').innerText = `API Key Status`
    document.getElementById('results-content').innerHTML = `<div>Your key is valid until </div><div>${data.expiry}</div>`
    resultsModal.show()
}

function displayException(data) {

    document.getElementById('resultsModalTitle').innerText = `An Exception Occured`
    document.getElementById('results-content').innerHTML = `<div>The Api returned status code ${data.status_code}</div>
    <div>Error Number: ${data.error_no}</div><div>Error text: <strong>${data.error}</strong></div>`
    resultsModal.show()
}