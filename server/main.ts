const express = require("express");
const path = require("path");
const multer = require('multer');
const upload = multer();
const app = express();
const fs = require('fs');
const vision = require('@google-cloud/vision');

app.use('/', express.static(path.resolve('../app/dist')))

app.post('/analyse', upload.single('file'), async function (req, res) {
    fs.writeFile("tmp/" + req.file.originalname, req.file.buffer, function (err) {
        if (err) {
            console.log("SAVE: " + err);
            clearTmp()
            return res.redirect(503, '/')
        }
        console.log("File saved");
    });

    const client = new vision.ImageAnnotatorClient({
        keyFilename: 'key.json'
    });

    const result = await client.labelDetection("tmp/" + req.file.originalname).catch(err => {
        console.error("READ: " + err)
        clearTmp()
        return res.redirect(503, '/')
    });
    console.log(result)
    // const labels = result[0].labelAnnotations;
    // console.log('Labels:');
    // labels.forEach(label => console.log(label));
    clearTmp()
    return res.redirect(200, '/')
});

app.listen(4200, () => console.log('Server running http://localhost:4200'));

function clearTmp() {
    fs.readdir("tmp", (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join("tmp", file), err => {
                if (err) throw err;
            });
        }
    });
}
