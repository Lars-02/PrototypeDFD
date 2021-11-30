const _ = require("lodash");
const files = [];

document.getElementById('submit').onclick = analyse;
document.getElementById('upload').onchange = addFile;

function addFile(event) {
    Array.from(event.target.files).forEach(file => {
        if (!file.name.endsWith('.pdf') && !file.name.endsWith('.png') && !file.name.endsWith('.jpg'))
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
}
