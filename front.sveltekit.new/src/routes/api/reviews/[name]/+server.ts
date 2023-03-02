import {json} from "@sveltejs/kit";
import {db} from "$lib/services/db.ts";
import fs from "fs";
import JSZip from "jszip";

// import crypto from "crypto";

/** @type {import('./$types').RequestHandler} */
// export async function GET() {
//     return json({reviews: await db.reviews()});
// }

export async function DELETE({params, url}) {
    console.log(params.name);
    await db.deleteReview(params.name);
    return json({status: 'ok'});
}


export async function PUT({request, params}) {
    const payload = await request.json();

    if (payload.action === 'refresh') {
        const MAIN_STORAGE = import.meta.env.VITE_STORAGE_REVIEWS;
        const REVIEW_STORAGE = `${MAIN_STORAGE}/${params.name}`;
        const review = await db.review(params.name);


        // for (const fileName of fs.readdirSync(REVIEW_STORAGE)) {
        //     if (!fileName.endsWith('.zip')) {
        //
        //         const filePath = `${REVIEW_STORAGE}/${fileName}`;
        //
        //         const buffer = fs.readFileSync(filePath);
        //         const hash = crypto.createHash('md5');
        //         hash.update(buffer);
        //         const hex = hash.digest('hex');
        //
        //
        //         const reviewPicture = {
        //             path: filePath,
        //             name: fileName,
        //             hash: hex,
        //             review_id: review.id,
        //             review_name: review.name,
        //             status: 0,
        //             comment: '',
        //             landscape: false,
        //         }
        //
        //         const reviewQuery = await db.review(review.name);
        //         const picturesInReview = reviewQuery.pictures.map(rp => rp.name);
        //         if (picturesInReview.includes(reviewPicture.name)) {
        //
        //             const existingPicture = await db.reviewPicture(review.name, reviewPicture.name);
        //             if (reviewPicture.hash !== existingPicture.hash) {
        //                 console.log(reviewPicture.name, 'already exists but hash differs, updating hash');
        //                 await db.reviewPictureUpdateHash(review.name, reviewPicture.name, reviewPicture.hash);
        //             } else {
        //                 console.log(reviewPicture.name, 'already exists but same')
        //             }
        //         } else {
        //             console.log(reviewPicture.name, 'does not exist, creating')
        //             await db.createReviewPicture(reviewPicture);
        //         }
        //
        //
        //     }
        // }

        // const zip = new JSZip();

        let maxCount = 50, currentCount = 0;
        const picturesList = fs.readdirSync(REVIEW_STORAGE).filter(f => !f.endsWith('.zip'));
        console.log(picturesList);

        if (picturesList.length > maxCount) {
            const neededArchives = Math.round(picturesList.length / maxCount);
            const archives = [];
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
                        console.log('zipfile created -> ', zipFname)
                    })
            }

        }
    }

    return json({status: 'ok'});
}