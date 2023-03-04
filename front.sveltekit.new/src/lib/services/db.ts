// import {Pool} from 'pg';
import pkg from 'pg';

const {Pool} = pkg;

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

    async insertPicture(picture) {
        try {
            return client.query(`
                INSERT INTO pictures(aperture, cam_model, exposure, flash, focal, focal_equiv, iso, lens, mode,
                                     timestamp,
                                     path, stared, blured, landscape, notes)
                VALUES ('${picture.aperture}',
                        '${picture.camera}',
                        '${picture.exposure}',
                        '${picture.flash}',
                        '${picture.focal}',
                        '${picture.focal}',
                        '${picture.iso}',
                        '${picture.lens}',
                        '${picture.mode}',
                        timestamp '${picture.dateString}',
                        '${picture.path}',
                        false,
                        false,
                        ${picture.landscape},
                        '${picture.notes}')
            `);
        } catch (err) {
            console.error(err);
        }
    },

    async deletePicture(id) {
        try {
            const query = await client.query(`DELETE
                                              FROM pictures
                                              WHERE id = ${id}`)
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async starPicture(id) {
        try {
            const query = await client.query(`UPDATE pictures
                                              SET stared = true
                                              WHERE id = ${id}`)
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async unstarPicture(id) {
        try {
            const query = await client.query(`UPDATE pictures
                                              SET stared = false
                                              WHERE id = ${id}`)
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async picturesBySpecieId(specieId) {
        try {
            const pictures = await client.query(`SELECT *
                                                 FROM pictures
                                                 WHERE pictures.species_id = ${specieId}`);
            return pictures.rows;
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    async species() {
        try {
            const species = await client.query('SELECT * FROM species');
            return species.rows;
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    async speciesWithPictures() {
        try {
            const _species = await client.query('SELECT * FROM species');

            let species = [];
            for (const s of _species.rows) {
                const picturesQuery = await client.query(`SELECT *
                                                          FROM pictures
                                                          WHERE pictures.species_id IS NOT NULL
                                                            AND pictures.species_id = ${s.id}`);
                s.pictures = picturesQuery.rows;
                species.push(s);
            }

            return species;
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    async specie(name) {
        try {
            const specieQuery = await client.query(`SELECT *
                                                    FROM species
                                                    WHERE name = '${name}'`);
            const specie = specieQuery.rows[0];
            const picturesQuery = await client.query(`SELECT *
                                                      FROM pictures
                                                      WHERE pictures.species_id IS NOT NULL
                                                        AND pictures.species_id = ${specie.id}`);
            const pictures = picturesQuery.rows;
            specie.pictures = pictures;
            return specie;
        } catch (err) {
            console.error(err);
        }
    },

    async addToSpecie(specieId, pictureId) {
        const query = await client.query(`UPDATE pictures
                                          SET species_id = ${specieId}
                                          WHERE id = ${pictureId}`);
    },

    async removeFromSpecie(specieId, pictureId) {
        const query = await client.query(`UPDATE pictures
                                          SET species_id = NULL
                                          WHERE id = ${pictureId}`);
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
    },

    async createAlbum(name, description) {
        const query = await client.query(`INSERT INTO albums(name, description)
                                          VALUES ('${name}', '${description}')`);
        console.log(query);
        return;
    },

    async addToAlbum(albumId, pictureId) {
        try {
            const query = await client.query(`INSERT INTO albums_pictures(picture_id, gallery_id)
                                              VALUES (${pictureId}, ${albumId})`)
            console.log(query.rows);
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async removeFromAlbum(albumId, pictureId) {
        try {
            const query = await client.query(`DELETE
                                              FROM albums_pictures
                                              WHERE picture_id = ${pictureId}
                                                AND gallery_id = ${albumId}`)
            console.log(query.rows);
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async reviews() {
        try {
            const reviews = await client.query('SELECT * FROM reviews');
            for (const review of reviews.rows) {
                const picturesQuery = await client.query('SELECT * FROM review_pictures WHERE review_id = ' + review.id);
                review.pictures = picturesQuery.rows;
            }

            return reviews.rows;
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    async review(name) {
        try {
            const reviewQuery = await client.query(`SELECT *
                                                    FROM reviews
                                                    WHERE name = '${name}'`);
            let review = reviewQuery.rows[0];
            const picturesQuery = await client.query('SELECT * FROM review_pictures WHERE review_id = ' + review.id)
            review.pictures = picturesQuery.rows;
            return review;
        } catch (err) {
            console.error(err);
            return {};
        }
    },

    async createReview(name, password) {
        try {
            const query = await client.query(`INSERT INTO reviews(name, password)
                                              VALUES ('${name}', '${password}')`);
            console.log(query.rows);
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async createReviewPicture(reviewPicture) {
        try {
            const query = await client.query(`INSERT INTO review_pictures(path, name, hash, review_id, review_name, landscape, status, comment)
                                              VALUES ('${reviewPicture.path}', '${reviewPicture.name}',
                                                      '${reviewPicture.hash}',
                                                      '${reviewPicture.review_id}', '${reviewPicture.review_name}',
                                                      ${reviewPicture.landscape}, '${reviewPicture.status}',
                                                      '${reviewPicture.comment}')`);
            console.log(query.rows);
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async setReviewPictureStatus(reviewName, pictureName, value) {
        try {
            console.log('IN DB', reviewName, pictureName, value);
            const query = await client.query(`UPDATE review_pictures
                                              SET status = ${value}
                                              WHERE review_name = '${reviewName}'
                                                AND name = '${pictureName}'`);
            console.log(query.rows);
        } catch (err) {
            console.error(err);
            return;
        }
    },
    async setReviewPictureComment(reviewName, pictureName, value) {
        try {
            console.log('IN DB', reviewName, pictureName, value);
            const query = await client.query(`UPDATE review_pictures
                                              SET comment = '${value}'
                                              WHERE review_name = '${reviewName}'
                                                AND name = '${pictureName}'`);
            console.log(query.rows);
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async deleteReview(name) {
        try {
            const query = await client.query(`
                DELETE
                FROM reviews
                WHERE name = '${name}'`);
            console.log(query.rows);
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async reviewPicture(reviewName, pictureName) {
        try {
            const query = await client.query(`SELECT *
                                              FROM review_pictures
                                              WHERE review_name = '${reviewName}'
                                                AND name = '${pictureName}'`);
            return query.rows[0];
        } catch (err) {
            console.error(err);
            return;
        }
    },

    async reviewPictureUpdateHash(reviewName, pictureName, newHash) {
        try {
            const query = await client.query(`UPDATE review_pictures
                                              SET hash = '${newHash}'
                                              WHERE review_name = '${reviewName}'
                                                AND name = '${pictureName}'`);
            console.log(query.rows);
        } catch (err) {
            console.error(err);
            return;
        }
    }
}
