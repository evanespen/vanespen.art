import {json} from '@sveltejs/kit';
import fs from 'fs';
import {db} from "$lib/services/db.ts";

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return json({reviews: await db.reviews()});
}

export async function POST({request}) {
    const payload = await request.json();
    await db.createReview(payload.name, payload.password);

    const MAIN_STORAGE = import.meta.env.VITE_STORAGE_REVIEWS;
    const REVIEW_STORAGE = `${MAIN_STORAGE}/${payload.name}`;
    if (!fs.existsSync(REVIEW_STORAGE)) {
        fs.mkdirSync(REVIEW_STORAGE, {recursive: true});
    }

    return json({status: 'ok'});
}

