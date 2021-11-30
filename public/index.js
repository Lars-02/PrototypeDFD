const _ = require("lodash");
let files = [];

const submit = document.getElementById('submit')
const upload = document.getElementById('upload')
submit.onclick = analyse;
upload.onchange = addFile;

loadReports()

function loadReports() {
    const reports = document.getElementById('reports');
    reports.innerHTML = '';
    fetch('/report/', {method: "GET"}).then((response) => response.json()).then(data => {
        for (const report of data.reports) {
            const reportName = report.slice(0, report.lastIndexOf('.'))
            reports.innerHTML +=
                `<a href="/report/${reportName}.txt" download="${reportName}.txt">${reportName}</a>`
        }
    })
}

function addFile(event) {
    Array.from(event.target.files).forEach(file => {
        if (!file.name.endsWith('.pdf'))
            return;
        files.push(file)
        document.getElementById('files').innerHTML += "<span>" + file.name + "</span>"
    })
    event.target.value = "";
    submit.disabled = false;
}

async function analyse() {
    submit.disabled = true;
    upload.disabled = true;
    for (let file of files) {
        let data = new FormData()
        data.append('file', file)
        const response = await fetch('/analyse', {
            method: "POST",
            body: data
        });
    }
    document.getElementById('files').innerHTML = "";
    loadReports()
    files = [];
    upload.disabled = false;
}
