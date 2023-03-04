import {EventEmitter} from 'node:events';

export const bus = new EventEmitter();

setInterval(() => {
    bus.emit('time', new Date().toLocaleTimeString());
}, 2e3);

setInterval(() => {
    bus.emit('date', new Date().toLocaleDateString());
}, 5e3);