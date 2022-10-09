import {db} from '$lib/services/db.ts';
import {json} from "@sveltejs/kit";

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return json({species: await db.speciesWithPictures()});
}

export async function PUT({request}) {
    const payload = await request.json();
    const pictureId = payload.pictureId;
    const specieId = payload.specieId;
    const action = payload.action;

    if (action === 'add') {
        await db.addToSpecie(specieId, pictureId);
    } else if (action === 'remove') {
        await db.removeFromSpecie(specieId, pictureId);
    }

    return json({status: 'ok'});
}
