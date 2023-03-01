import {db} from "$lib/services/db";

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const review = await db.review(params.name);
    return {
        review: review
    };
}
