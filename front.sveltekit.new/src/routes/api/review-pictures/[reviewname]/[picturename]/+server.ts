import fs from 'fs';
import {json} from '@sveltejs/kit';
import {db} from "$lib/services/db.ts";

/** @type {import('./$types').RequestHandler} */
export async function GET({params}) {
    const reviewsStorage = import.meta.env.VITE_STORAGE_REVIEWS;
    const filePath = `${reviewsStorage}/${params.reviewname}/${params.picturename}`;

    return new Response(
        fs.readFileSync(filePath),
        {
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Length': fs.statSync(filePath).size
            }
        }
    );
}

export async function PUT({params, request}) {
    const payload = await request.json();
    console.log(payload.action, payload.value, params);

    if (payload.action === 'setStatus') {
        await db.setReviewPictureStatus(params.reviewname, params.picturename, payload.value);
    } else if (payload.action === 'setComment') {
        console.log(payload.value);
        await db.setReviewPictureComment(params.reviewname, params.picturename, payload.value);
    }

    return json({status: 'ok'});
}