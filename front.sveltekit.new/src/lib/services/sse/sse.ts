export function createSSE(last_id = 0, retry = 0) {
    let id = last_id;
    const {readable, writable} = new TransformStream({
        start(controller) {
            // controller.enqueue(': hello\n\n');

            if (retry > 0) controller.enqueue(`retry: ${retry}\n\n`);
        },
        transform({event, data}, controller) {
            let msg = {
                id: ++id,
                event,
                data
            };
            // // let msg = `id: ${++id}\n`;
            // if (event) msg += `event: ${event}\n`;
            // if (typeof data === 'string') {
            //     msg += 'data: ' + data.trim().replace(/\n+/gm, '\ndata: ') + '\n';
            // } else {
            //     msg += `data: ${JSON.stringify(data)}\n`;
            // }
            controller.enqueue(JSON.stringify(msg));
        }
    });

    const writer = writable.getWriter();

    return {
        readable,
        /**
         * @param {import('node:events').EventEmitter} eventEmitter
         * @param {string} event
         */
        async subscribe(eventEmitter, event) {
            function listener(/** @type {any} */ data) {
                writer.write({event, data});
            }

            eventEmitter.on(event, listener);
            await writer.closed.catch(() => {
            });
            eventEmitter.off(event, listener);
        }
    };
}