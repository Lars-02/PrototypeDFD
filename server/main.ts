const express = require("express");
const path = require("path");
const app = express();
const vision = require('@google-cloud/vision');

const client = new vision.ImageAnnotatorClient({
    keyFilename: 'key.json'
});

app.use(express.json());

app.use('/', express.static(path.resolve('../app/dist')))

app.post('/analyse', async function (req, res) {
    console.log('Setup connection')

    console.log(req.body)
    // const result = await client.labelDetection(path).catch(err => {
    //     console.error('ERROR:', err);
    // });
    // const labels = result[0].labelAnnotations;
    //
    // console.log('Labels:');
    // labels.forEach(label => console.log(label));
    return res.redirect(200, 'great')
});

app.listen(4200, () => console.log('Server running http://localhost:4200'));
