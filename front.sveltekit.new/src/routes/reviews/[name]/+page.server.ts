import fs from "fs";
import {db} from "$lib/services/db";


/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const review = await db.review(params.name);

    const reviewPath = import.meta.env.VITE_STORAGE_REVIEWS + '/' + review.name;
    const archives = fs.readdirSync(reviewPath).filter(f => f.endsWith('.zip'));

    return {
        review: review,
        archives: archives
    };
}
