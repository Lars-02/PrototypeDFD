const files = [];

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

function analyse() {
    const http = new XMLHttpRequest();

    http.open("POST", '/analyse', true);
    http.setRequestHeader("Content-Type", "application/json")
    http.onreadystatechange = function () {
        console.log(this.responseText);
    }

    http.send(JSON.stringify({test: 'foo'}));
}
