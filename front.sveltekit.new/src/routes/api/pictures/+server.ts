import {db} from '$lib/services/db.ts';
import {json} from "@sveltejs/kit";
import {process} from "$lib/picturesProcessor";
import {createSSE} from "$lib/services/sse/sse";
import {EventEmitter} from 'node:events';

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

    let files: any[] = [];
    for (let i = 0; i < count; i++) {
        files.push(data.get(`file_${i}`));
    }

    console.log(`got ${files.length} files : ${files.map(f => f.name)}`);


    const last_event_id = 0;
    const {readable, subscribe} = createSSE(last_event_id);

    console.log('stream started')

    const bus = new EventEmitter();
    // bus.emit('status', 'start');

    subscribe(bus, 'status');

    for (const f of files) {
        process(f, bus)
    }

    console.log('sending response');

    return new Response(readable, {
        headers: {
            'cache-control': 'no-cache',
            'content-type': 'text/event-stream',
        }
    });


    //
    // old code next
    //

    const MODE = 'stream';
    // const MODE = 'stream';

    if (MODE === 'stream') {
        const ac = new AbortController();
        const stream = new ReadableStream({
            async start(controller) {
                for (const f of files) {
                    process(f, controller)
                }
                controller.close();
            },
            cancel() {
                console.log("cancel and abort");
                ac.abort();
            }
        })

        return new Response(stream, {
            headers: {
                'content-type': 'text/event-stream',
            }
        });
    } else if (MODE === 'normal') {
        for (const f of files) {
            process(f)
        }

        return json({status: 200, body: 'ok'});
    }
}
