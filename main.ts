import * as vision from "@google-cloud/vision";
import * as fs from "fs";
import * as Multer from "multer";
import * as path from "path";
import * as express from "express";

const app = express();
const PORT = 4200;

// Multer is required to process file uploads and make them available via
const multer = Multer({
    storage: Multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // no larger than 5mb, you can change as needed.
    },
});

let google;

app.use(express.json());
app.use('/', express.static(path.resolve('./dist')))
app.use('/report', express.static(path.resolve('./resource/report')))

app.get('/report', function (req, res) {
    const files = fs.readdirSync('./resource/report')
    res.status(200).send({'reports': files})
})

app.post('/analyse', multer.single('file'), async function (req, res) {
    if (!req.file) {
        res.status(400).send('No file uploaded.');
        return;
    }

    console.log('\nAnalyse called')

    // Save file
    fs.writeFile(`${__dirname}/tmp/${req.file.originalname}`, req.file.buffer, function (err) {
        if (err) {
            console.log("SAVE: " + err);
            clearTmp()
            return res.status(503)
        }
        console.log("File saved");
    });

    // Setup client
    google = new vision.ImageAnnotatorClient({
        keyFilename: './key.json'
    });

    if (req.file.originalname.endsWith('.pdf')) {
        await analyse(req.file.originalname)
    } else {
        return res.status(503).send()
    }

    clearTmp()
    console.log('Cleared tmp folder')
    return res.status(200).send()
});

async function analyse(filename) {

    // Make the synchronous batch request.
    const [result] = await google.batchAnnotateFiles({
        requests: [{
            inputConfig: {
                mimeType: 'application/pdf',
                content: await fs.promises.readFile(`tmp/${filename}`),
            },
            features: [{type: 'DOCUMENT_TEXT_DETECTION'}],
        }],
    });
    console.log('File analysed')

    // Process the results, just get the first result, since only one file was sent in this
    const responses = result.responses[0].responses;

    let report = '';
    let searches = [{
        key: 'ordernummer',
        value: null,
        confidence: 0,
    }, {
        key: 'client',
        value: null,
        confidence: 0,
    }, {
        key: 'committee',
        value: null,
        confidence: 0,
    }];

    for (const response of responses) {
        report += response.fullTextAnnotation.text + '\n'
    }
    for (const response of responses) {
        for (const page of response.fullTextAnnotation.pages) {
            for (const block of page.blocks) {
                report += `Block confidence: ${block.confidence}\n`
                for (const paragraph of block.paragraphs) {
                    report += ` Paragraph confidence: ${paragraph.confidence}\n`
                    for (const [index, word] of paragraph.words.entries()) {
                        const word_text = word.symbols.map(symbol => symbol.text).join('');
                        report += `  Word text: ${word_text} (confidence: ${word.confidence})\n`
                        for (const search of searches) {
                            if (search.value === null && word_text.toLowerCase() === search.key.toLowerCase()) {
                                if (paragraph.words[index + 1] !== undefined) {
                                    search.value = paragraph.words[index + 1].symbols.map(symbol => symbol.text).join('');
                                    search.confidence = paragraph.confidence
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    report += '\n'
    for (const search of searches) {
        report += `${search.key}: ${search.value} - ${search.confidence}\n`
    }
    fs.writeFileSync(`resource/report/${filename.slice(0, filename.lastIndexOf('.'))}.txt`, report);
    console.log(searches)
    console.log('Report generated')
}

function clearTmp() {
    fs.readdir(`${__dirname}/tmp`, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(`${__dirname}/tmp`, file), err => {
                if (err) throw err;
            });
        }
    });
}

app.listen(PORT, () => {
    console.log(`App listening on port http://localhost:${PORT}`);
    console.log('Press Ctrl+C to quit.');
});
