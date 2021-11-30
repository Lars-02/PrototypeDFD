import * as GStorage from "@google-cloud/storage";
import * as vision from "@google-cloud/vision";
import * as fs from "fs";
import * as Multer from "multer";
import * as path from "path";
import * as express from "express";
import {format} from "util";
import {resolve} from "dns/promises";

const app = express();
// Instantiate a storage client
const storage = new GStorage.Storage({
    projectId: 'prototype-dfdesign', keyFilename: 'key.json'
});

let client;

// This middleware is available in Express v4.16.0 onwards
app.use(express.json());

// Multer is required to process file uploads and make them available via
// req.files.
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
});

// A bucket is a container for objects (files).
const bucket = storage.bucket('dfd-file-detection');

app.use('/', express.static(path.resolve('../app/dist')))

app.post('/analyse', multer.single('file'), async function (req, res) {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    // Save file
    fs.writeFile("tmp/" + req.file.originalname, req.file.buffer, function (err) {
        if (err) {
            console.log("SAVE: " + err);
            clearTmp()
            return res.status(503)
        }
        console.log("File saved");
    });

    // Setup client
    client = new vision.ImageAnnotatorClient({
        keyFilename: 'key.json'
    });

    if (req.file.originalname.endsWith('.pdf')) {
        await analysePdf(req, res)
    } else if (req.file.originalname.endsWith('.jpg')) {
        await analyseImage(req, res)
    } else {
        return res.status(503)
    }

    return res.status(200)
});

async function analyseImage(req, res) {
    // Get result
    const result = await client.textDetection("tmp/" + req.file.originalname).catch(err => {
        console.error("READ: " + err)
        clearTmp()
    });

    // Print result
    const labels = result[0].textAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label));
}

async function analysePdf(req, res) {
    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file('vision/analyse/' + req.file.originalname);

    await new Promise((resolve) => {
        const blobStream = blob.createWriteStream();

        blobStream.on('error', err => {
            console.log(err);
            resolve(false);
        });

        blobStream.on('finish', async () => {
            resolve(true);
        });

        blobStream.end(req.file.buffer);
    })

    clearTmp()

    // Bucket where the file resides
    const bucketName = 'dfd-file-detection';
    // Path to PDF file within bucket
    const fileName = 'vision/analyse/' + req.file.originalname
    // The folder to store the results
    const outputPrefix = 'vision/result'

    const gcsSourceUri = `gs://${bucketName}/${fileName}`;
    const gcsDestinationUri = `gs://${bucketName}/${outputPrefix}/`;

    const inputConfig = {
        // Supported mime_types are: 'application/pdf' and 'image/tiff'
        mimeType: 'application/pdf',
        gcsSource: {
            uri: gcsSourceUri,
        },
    };
    const outputConfig = {
        gcsDestination: {
            uri: gcsDestinationUri,
        },
    };
    const features = [{type: 'DOCUMENT_TEXT_DETECTION'}];
    const request = {
        requests: [
            {
                inputConfig: inputConfig,
                features: features,
                outputConfig: outputConfig,
            },
        ],
    };

    const [operation] = await client.asyncBatchAnnotateFiles(request);
    const [filesResponse] = await operation.promise();
    const destinationUri = filesResponse.responses[0].outputConfig.gcsDestination.uri;
    console.log('Json saved to: ' + destinationUri);
}

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

const PORT = 4200;
app.listen(PORT, () => {
    console.log(`App listening on port http://localhost:${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
