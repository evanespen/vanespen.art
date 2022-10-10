import {db} from '$lib/services/db.ts';
import {json} from "@sveltejs/kit";
import fs from "fs";
import crypto from "crypto";
import {resize} from "easyimage";
import ExifReader from 'exifreader';
import Moment from "moment";

/** @type {import('./$types').RequestHandler} */
export async function GET() {
    return json({pictures: await db.pictures()});
}

export async function DELETE({url}) {
    const pictureId = Number(url.searchParams.get('id'));

    await db.deletePicture(pictureId);

    return new Response('ok');
}

export async function PUT({url}) {
    const pictureId = Number(url.searchParams.get('id'));
    const action = url.searchParams.get('action');

    if (action === 'star') {
        await db.starPicture(pictureId);
    } else if (action === 'unstar') {
        await db.unstarPicture(pictureId);
    }

    console.log(pictureId, action)

    return new Response('ok');
}

export async function POST({url, request}) {
    const data = await request.formData();
    const count = data.get('count');

    let files = [];
    for (let i = 0; i < count; i++) {
        files.push(data.get(`file_${i}`));
    }

    console.log(`got ${files.length} files : ${files.map(f => f.name)}`);

    const MAIN = import.meta.env.VITE_STORAGE_MAIN;
    const THUMB = import.meta.env.VITE_STORAGE_THUMB;
    const HALF = import.meta.env.VITE_STORAGE_HALF;
    const FULL = import.meta.env.VITE_STORAGE_FULL;

    [MAIN, THUMB, HALF, FULL].forEach(d => {
        if (!fs.existsSync(d)) {
            fs.mkdirSync(d);
        }
    })

    let accepted = [], rejected = [];
    for (const f of files) {
        const buffer = Buffer.from(await f.arrayBuffer());
        const hash = crypto.createHash('md5');
        hash.update(buffer);
        const hex = hash.digest('hex');

        // save full res file
        const fileName = `${hex}.jpg`;
        fs.writeFileSync(FULL + `/${fileName}`, buffer, () => console.log('FULL file saved'));


        const tags = ExifReader.load(buffer, {
            expanded: false,
            includeUnknown: false
        });
        const picture = {
            path: fileName,
            dateString: Moment(tags.CreateDate.description).format('YYYY-MM-DD hh:mm:ss'),
            timestamp: Moment(tags.CreateDate.description).unix(),
            camera: tags.Model?.description || '',
            mode: tags.ExposureProgram?.description || '',
            aperture: tags.FNumber?.description || '',
            iso: tags.ISOSpeedRatings?.description || '',
            exposure: tags.ExposureTime?.description || '',
            focal: tags.FocalLength?.description || '',
            lens: tags.LensModel?.description || '',
            flash: tags.Flash?.description || '',
            height: tags['Image Height'].value,
            width: tags['Image Width'].value,
            landscape: tags['Image Width'].value > tags['Image Height'].value,
        }

        // create half-res file
        const halfres = await resize({
            src: FULL + `/${fileName}`,
            dst: HALF + `/${fileName}`,
            width: picture.width / 2,
            height: picture.height / 2,
        });

        // create thumb
        const thumb = await resize({
            src: FULL + `/${fileName}`,
            dst: THUMB + `/${fileName}`,
            width: picture.width / 3,
            height: picture.height / 3,
        });

        try {
            const res = await db.insertPicture(picture);
            accepted.push(f.name);
        } catch (err) {
            rejected.push(f.name);
        }
    }

    return json({
        accepted,
        rejected
    });
}
