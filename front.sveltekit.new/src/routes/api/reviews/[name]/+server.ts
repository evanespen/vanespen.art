import {json} from '@sveltejs/kit';
import {db} from "$lib/services/db.ts";
import fs from "fs";

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

        for (const fileName of fs.readdirSync(REVIEW_STORAGE)) {
            const filePath = `${REVIEW_STORAGE}/${fileName}`;
            const reviewPicture = {
                path: filePath,
                name: fileName,
                review_id: review.id,
                review_name: review.name,
                status: 0,
                comment: '',
                landscape: false,
            }
            await db.createReviewPicture(reviewPicture);
        }
    }

    return json({status: 'ok'});
}