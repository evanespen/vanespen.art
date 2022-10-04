import {db} from "$lib/services/db";

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    const album = await db.album(params.name)
    return {
        album: album
    };
}
