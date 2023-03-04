import crypto from 'crypto';
import ExifReader from "exifreader";
import Moment from "moment";
import fs from "fs";
import {db} from "$lib/services/db";
import {EventEmitter} from "node:events";
import {resize} from "easyimage";

function sendStatus(fileName: string, step: string, status: boolean, bus: EventEmitter) {
    const payload = {
        fileName,
        step,
        status,
    }
    // controller.enqueue(JSON.stringify(payload));
    bus.emit('status', payload);
    console.log(payload);
}

export async function process(f: Object, bus: EventEmitter) {
    const MAIN = import.meta.env.VITE_STORAGE_MAIN;
    const THUMB = import.meta.env.VITE_STORAGE_THUMB;
    const HALF = import.meta.env.VITE_STORAGE_HALF;
    const FULL = import.meta.env.VITE_STORAGE_FULL;
    [MAIN, THUMB, HALF, FULL].forEach(d => {
        if (!fs.existsSync(d)) {
            fs.mkdirSync(d);
        }
    })


    const buffer = Buffer.from(await f.arrayBuffer());
    const hash = crypto.createHash('md5');
    hash.update(buffer);
    const hex = hash.digest('hex');

    // save full res file
    const fileName = `${hex}.jpg`;
    fs.writeFile(`${FULL}/${fileName}`, buffer, (err) => {
        if (err) console.error(err);
        sendStatus(f.name, 'full', true, bus);
    });

    const tags = ExifReader.load(buffer, {
        expanded: false,
        includeUnknown: false
    });

    let notes = '', dateString, timestamp;
    const notesCharCodes = tags.UserComment?.value.filter(c => c !== 0);
    if (notesCharCodes !== undefined) {
        // this picture has notes, so it's ASTRO or FILM
        notes = String.fromCharCode(...notesCharCodes).replace("'", "''");
        if (notes.includes('UNICODE')) {
            notes = notes.replace('UNICODE', '');
        } else if (notes.includes('ASCII')) {
            notes = notes.replace('ASCII', '');
        }

        const datetimeDescription = tags.DateTime?.description;
        if (datetimeDescription) {
            const date = datetimeDescription.split(' ')[0].replaceAll(':', '/');
            const time = datetimeDescription.split(' ')[1];
            dateString = Moment(`${date}} ${time}`, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD hh:mm:ss');
            timestamp = Moment(`${date}} ${time}`, 'YYYY-MM-DD HH:mm:ss').unix()
        }
    } else {
        // this picture has no notes, so it's a NORMAL picture
        dateString = Moment(tags.CreateDate.description).format('YYYY-MM-DD hh:mm:ss');
        timestamp = Moment(tags.CreateDate.description).unix();
    }

    const picture = {
        path: fileName,
        dateString: dateString,
        timestamp: timestamp,
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
        notes: notes,
    }

    sendStatus(f.name, 'exif', true, bus);

    // create half-res file
    resize({
        src: `${FULL}/${fileName}`,
        dst: `${HALF}/${fileName}`,
        width: Number(picture.width) / 2,
        height: Number(picture.height) / 2,
    }).then(() => {
        sendStatus(f.name, 'half', true, bus);
    }).catch(err => {
        console.error(err);
    });

    // create thumb
    resize({
        src: `${FULL}/${fileName}`,
        dst: `${THUMB}/${fileName}`,
        width: Number(picture.width) / 3,
        height: Number(picture.height) / 3,
    }).then(() => {
        sendStatus(f.name, 'thumb', true, bus);
    }).catch(err => {
        console.error(err);
    });

    db.insertPicture(picture).then(() => {
        sendStatus(f.name, 'db', true, bus);
    }).catch(err => {
        console.error(err);
        sendStatus(f.name, 'db', false, bus);
    });
}