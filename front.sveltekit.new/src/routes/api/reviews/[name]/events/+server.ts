import {json} from "@sveltejs/kit";
import fs from 'fs';
import {db} from "$lib/services/db";


/** @type {import('./$types').RequestHandler} */
export async function GET({params}) {
    const MAIN_STORAGE = import.meta.env.VITE_STORAGE_REVIEWS;
    const review = await db.review(params.name);
    const REVIEW_STORAGE = `${MAIN_STORAGE}/${review.name}`;
    const logFileName = `${REVIEW_STORAGE}/events.log`;

    console.log(logFileName)

    let events = [];
    try {
        const rawEvents = fs.readFileSync(logFileName, 'utf-8');
        rawEvents.split('\n').forEach((event) => {
            if (event !== '') events.push(JSON.parse(event));
        })
    } catch (err) {

    }
    return json({events});
}