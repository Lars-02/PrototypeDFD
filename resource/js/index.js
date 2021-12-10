let files = [];

const submit = document.getElementById('submit')
const upload = document.getElementById('upload')
const deleteButton = document.getElementById('delete')
submit.onclick = analyse;
deleteButton.onclick = deleteReports;
upload.onchange = addFile;

loadReports()

function loadReports() {
    const reports = document.getElementById('reports');
    reports.innerHTML = '';
    fetch('/report/', {method: "GET"}).then((response) => response.json()).then(data => {
        for (const report of data.reports) {
            const reportName = report.slice(0, report.lastIndexOf('.'))
            reports.innerHTML += `<a href="/report/${reportName}.txt" download="${reportName}.txt"><li>${reportName}</li></a>`
            deleteButton.disabled = false
        }
    })
}

function addFile(event) {
    Array.from(event.target.files).forEach(file => {
        if (!file.name.endsWith('.pdf')) return;
        files.push(file)
        document.getElementById('files').innerHTML += "<li>" + file.name + "</li>"
    })
    event.target.value = "";
    submit.disabled = false;
}

async function deleteReports() {
    submit.disabled = true;
    upload.disabled = true;
    deleteButton.disabled = true;
    await fetch('/report/delete', {
        method: "POST"
    })
    loadReports();
    submit.disabled = false;
    upload.disabled = false;
}

async function analyse() {
    submit.disabled = true;
    upload.disabled = true;
    deleteButton.disabled = true;
    for (let file of files) {
        let data = new FormData()
        data.append('file', file)
        await fetch('/analyse', {
            method: "POST",
            body: data
        });
    }
    document.getElementById('files').innerHTML = "";
    loadReports()
    files = [];
    deleteButton.disabled = false;
    upload.disabled = false;
}
