import fs from 'fs';
import {json} from "@sveltejs/kit";
import {db} from "$lib/services/db.ts";

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


export async function PUT({url, request, params}) {
    const payload = await request.json();

    if (payload.action === 'refresh') {
        const MAIN_STORAGE = import.meta.env.VITE_STORAGE_REVIEWS;
        const review = await db.review(params.name);
        const REVIEW_STORAGE = `${MAIN_STORAGE}/${review.name}`;
        const logFileName = `${REVIEW_STORAGE}/events.log`;
        const picturesList = fs.readdirSync(REVIEW_STORAGE).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));

        fetch(`${url.protocol}//${url.host}/api/internal/reviews/${review.name}`, {
            method: 'POST',
            body: JSON.stringify({
                action: 'refresh',
                logFileName: logFileName
            }),
        })

        return json({picturesList});
    }
}