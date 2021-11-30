const _ = require("lodash");
let files = [];

document.getElementById('submit').onclick = analyse;
document.getElementById('upload').onchange = addFile;

function addFile(event) {
    Array.from(event.target.files).forEach(file => {
        if (!file.name.endsWith('.pdf'))
            return;
        files.push(file)
        document.getElementById('files').innerHTML += "<span>" + file.name + "</span>"
    })
    event.target.value = "";
}

async function analyse() {
    for (let file of files) {
        let data = new FormData()
        data.append('file', file)
        const response = await fetch('/analyse', {
            method: "POST",
            body: data
        });
    }
    document.getElementById('files').innerHTML = "";
    files = [];
}
