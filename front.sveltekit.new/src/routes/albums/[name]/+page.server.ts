import {db} from "$lib/services/db";

/** @type {import('./$types').PageServerLoad} */
export async function load({params}) {
    console.log('toto', await db.albums.get('test'))
    const album = await db.albums.get(params.name);
    return {
        album: album
    };
}
