import {json} from "@sveltejs/kit";
import {db} from "$lib/services/db.ts";
import fs from "fs";
import JSZip from "jszip";
import crypto from "crypto";
import {resize} from "easyimage";
import ExifReader from 'exifreader';
import {EventEmitter} from "node:events";
import {createSSE} from "$lib/services/sse/sse";

function sendStatus(fileName: string, step: string, status: boolean, bus: EventEmitter) {
    const payload = {
        fileName,
        step,
        status,
    }
    // controller.enqueue(JSON.stringify(payload));
    bus.emit('status', payload);
    console.log(payload);
}


/** @type {import('./$types').RequestHandler} */

export async function DELETE({params, url}) {
    console.log(params.name);
    await db.deleteReview(params.name);
    return json({status: 'ok'});
}

async function process(fileName: string, review: Object, bus: EventEmitter) {
    const MAIN_STORAGE = import.meta.env.VITE_STORAGE_REVIEWS;
    const REVIEW_STORAGE = `${MAIN_STORAGE}/${review.name}`;

    if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {

        const filePath = `${REVIEW_STORAGE}/${fileName}`;
        const buffer = fs.readFileSync(filePath);
        const HALF_DIR = REVIEW_STORAGE + '/half';
        if (!fs.existsSync(HALF_DIR)) {
            fs.mkdirSync(HALF_DIR);
        }
        ;
        const tags = ExifReader.load(buffer, {
            expanded: false,
            includeUnknown: false
        });
        resize({
            src: filePath,
            dst: HALF_DIR + `/${fileName}`,
            width: tags['Image Width'].value / 2,
            height: tags['Image Height'].value / 2,
        }).then(() => {
            sendStatus(fileName, 'half', true, bus);
        }).catch(err => {
            sendStatus(fileName, 'half', false, bus);
        });

        const hash = crypto.createHash('md5');
        hash.update(buffer);
        const hex = hash.digest('hex');

        const reviewPicture = {
            path: filePath,
            name: fileName,
            hash: hex,
            review_id: review.id,
            review_name: review.name,
            status: 0,
            comment: '',
            landscape: false,
        }

        const reviewQuery = await db.review(review.name);
        const picturesInReview = reviewQuery.pictures.map(rp => rp.name);
        if (picturesInReview.includes(reviewPicture.name)) {

            const existingPicture = await db.reviewPicture(review.name, reviewPicture.name);
            if (reviewPicture.hash !== existingPicture.hash) {
                console.log(reviewPicture.name, 'already exists but hash differs, updating hash');
                db.reviewPictureUpdateHash(review.name, reviewPicture.name, reviewPicture.hash).then(() => {
                    sendStatus(fileName, 'db', true, bus);
                }).catch(err => {
                    console.error(err);
                    sendStatus(fileName, 'db', false, bus);
                })
            } else {
                sendStatus(fileName, 'db', true, bus);
            }
        } else {
            console.log(reviewPicture.name, 'does not exist, creating')
            db.createReviewPicture(reviewPicture).then(() => {
                sendStatus(fileName, 'db', true, bus);
            }).catch(err => {
                console.error(err);
                sendStatus(fileName, 'db', false, bus);
            })
        }


    }
}

export async function PUT({request, params}) {
    const payload = await request.json();
    const bus = new EventEmitter();
    const {readable, subscribe} = createSSE(0);
    subscribe(bus, 'status');

    if (payload.action === 'refresh') {
        const MAIN_STORAGE = import.meta.env.VITE_STORAGE_REVIEWS;
        const REVIEW_STORAGE = `${MAIN_STORAGE}/${params.name}`;

        const review = await db.review(params.name);
        for (const fileName of fs.readdirSync(REVIEW_STORAGE)) {
            process(fileName, review, bus);
        }

        // ARCHIVES CREATION
        let maxCount = 50, currentCount = 0;
        const picturesList = fs.readdirSync(REVIEW_STORAGE).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
        console.log(picturesList);


        let neededArchives = Math.round(picturesList.length / maxCount);
        neededArchives = neededArchives === 0 ? 1 : neededArchives;
        let archives = [];
        for (let i = 0; i < neededArchives; i++) {
            const fname = `${review.name}-partie-${i + 1}.zip`;
            console.log('creating archive', fname);
            archives[i] = {
                fname: fname,
                zip: new JSZip(),
                files: picturesList.slice(currentCount, currentCount + maxCount)
            };
            currentCount += maxCount;

            for (const fileName of archives[i].files) {
                archives[i].zip.file(fileName, fs.readFileSync(`${REVIEW_STORAGE}/${fileName}`));
            }

            const zipFname = `${import.meta.env.VITE_STORAGE_REVIEWS}/${review.name}/${archives[i].fname}`;
            archives[i].zip
                .generateNodeStream({type: 'nodebuffer', streamFiles: true})
                .pipe(fs.createWriteStream(zipFname))
                .on('finish', () => {
                    console.log('zipfile created -> ', zipFname);
                    sendStatus('archive', 'archive', true, bus);
                })
        }


    }


    return new Response(readable, {
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'text/event-stream',
        }
    });
}