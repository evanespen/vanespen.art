// @ts-ignore
import {db} from '$lib/services/db.ts';

/**
 * @typedef {{
 *   pictures: []
 * }} Specie
 */


/** @type {import('./$types').PageServerLoad} */
export const load = async () => {
    let species = await db.species()
    // @ts-ignore
    species = species.sort((a, b) => {
        if (a.name > b.name) return 1
        else if (a.name < b.name) return -1
        else return 0
    })

    for (const element of species) {
        element.pictures = await db.picturesBySpecieId(element.id)
    }

    return {
        species
    }
};
