import {json} from '@sveltejs/kit';
import {db} from "$lib/services/db.ts";
import fs from "fs";
import crypto from "crypto";
import JSZip from "jszip";

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

        const zip = new JSZip();

        for (const fileName of fs.readdirSync(REVIEW_STORAGE)) {
            if (!fileName.endsWith('.zip')) {

                const filePath = `${REVIEW_STORAGE}/${fileName}`;

                const buffer = fs.readFileSync(filePath);
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
                        console.log('already exists but hash differs, updating hash');
                        await db.reviewPictureUpdateHash(review.name, reviewPicture.name, reviewPicture.hash);
                    } else {
                        console.log('already exists but same')
                    }
                } else {
                    console.log('does not exist, creating')
                    await db.createReviewPicture(reviewPicture);
                }

                zip.file(fileName, buffer);
            }
        }

        zip.generateAsync({type: "nodebuffer"}).then(function (content) {
            fs.writeFile(`${import.meta.env.VITE_STORAGE_REVIEWS}/${review.name}/${review.name}.zip`, content, err => {
                console.error(err);
            });
            console.log('zipfile saved successfully')
        });
    }

    return json({status: 'ok'});
}