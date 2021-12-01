let files = [];

const submit = document.getElementById('submit')
const upload = document.getElementById('upload')
submit.onclick = analyse;
upload.onchange = addFile;

function addFile(event) {
    Array.from(event.target.files).forEach(file => {
        if (!file.name.endsWith('.pdf'))
            return;
        files.push(file)
        document.getElementById('files').innerHTML += "<li>" + file.name + "</li>"
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
    files = [];
    upload.disabled = false;
}
