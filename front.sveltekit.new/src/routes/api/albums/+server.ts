import {json} from '@sveltejs/kit';

import {db} from "$lib/services/db.ts";

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return json({albums: await db.albums()});
}

export async function PUT({request}) {
    const payload = await request.json();
    const pictureId = payload.pictureId;
    const albumId = payload.albumId;
    const action = payload.action;

    if (action === 'add') {
        await db.addToAlbum(albumId, pictureId);
    } else if (action === 'remove') {
        await db.removeFromAlbum(albumId, pictureId);
    }

    return json({status: 'ok'});
}


export async function POST({request}) {
    const payload = await request.json();
    await db.createAlbum(payload.name, payload.description);

    return json({status: 'ok'});
}
