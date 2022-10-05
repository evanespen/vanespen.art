import {Pool} from 'pg';

const client = new Pool({
    user: import.meta.env.VITE_PG_USER,
    password: import.meta.env.VITE_PG_PASS,
    host: import.meta.env.VITE_PG_HOST,
    port: import.meta.env.VITE_PG_PORT,
    database: import.meta.env.VITE_PG_DB,
});

export const db = {
    async pictures() {
        try {
            const pictures = await client.query('SELECT * FROM pictures ORDER BY timestamp DESC');
            return pictures.rows;
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    async picturesBySpecieId(specieId) {
        try {
            const pictures = await client.query(`SELECT * FROM pictures WHERE pictures.species_id = ${specieId}`);
            return pictures.rows;
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    // async picturesByAlbumId (albumId) {
    //     try {
    //         const pictures = await client.query(`SELECT * FROM pictures WHERE pictures._id = ${specieId}`)
    //         return pictures.rows
    //     } catch (err) {
    //         console.error(err)
    //         return []
    //     }
    // },

    async species() {
        try {
            const species = await client.query('SELECT * FROM species');
            return species.rows;
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    async specie(name) {
        try {
            const specieQuery = await client.query(`SELECT * FROM species WHERE name = '${name}'`);
            const specie = specieQuery.rows[0];
            const picturesQuery = await client.query(`SELECT * FROM pictures WHERE pictures.species_id IS NOT NULL AND pictures.species_id = ${specie.id}`);
            const pictures = picturesQuery.rows;
            specie.pictures = pictures;
            return specie;
        } catch (err) {
            console.error(err);
        }
    },

    async albums() {
        try {
            const albumsQuery = await client.query('SELECT * FROM albums');
            const albums = albumsQuery.rows;

            const albumsPicturesJoinQuery = await client.query('SELECT * FROM albums_pictures');
            const albumsPicturesJoin = albumsPicturesJoinQuery.rows;

            const picturesQuery = await client.query('SELECT * FROM pictures');
            const pictures = picturesQuery.rows;

            albums.forEach(album => {
                const picturesIds = albumsPicturesJoin.filter(apj => apj.gallery_id === album.id).map(apj => apj.picture_id);
                album.pictures = [];
                album.pictures = pictures.filter(picture => picturesIds.includes(picture.id));
            })

            return albums;
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    async album(name) {
        try {
            const albums = await this.albums();
            return albums.filter(album => album.name == name)[0];
        } catch (err) {
            console.error(err);
        }
    }
}
