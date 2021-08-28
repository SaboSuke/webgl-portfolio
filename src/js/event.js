/**
 * @desc Handles emitting custom events
 * 
 * @constructor
 */
export default class EventEmitter {
    constructor() { }

    dispatch(name, event) {
        let callbacks = this[name];
        if (callbacks) callbacks.forEach(callback => callback(event));
    };

    on(name, callback) {
        let callbacks = this[name];
        if (!callbacks) this[name] = [callback];
        else callbacks.push(callback);
    };
}