export default class EventEmitter {
    /**
     * @desc emits a custom event
     *
     * @constructor
     */
    constructor() { return this; }

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