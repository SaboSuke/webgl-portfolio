import Settings from './settings.js';
import { Stats } from '../../dist/stats.module.js';


export default class DevHelper {

    /**
     * @desc Handles gui settings, performance stats and
     * any other debugging methods.
     * 
     * @param {Sketch} sketch 
     * @param {Boolean} eSettings - enable gui settings 
     * @param {Boolean} eStats - enable performance stats
     * @constructor
     * @returns {Stats}
     */
    constructor(sketch, eSettings, eStats) {
        if (!sketch) return;
        this.sketch = sketch;

        eSettings && this.#initSettings();
        eStats && this.#initStats();

        return this.stats;
    }

    #initSettings() {
        new Settings(this.sketch, {
            camera: true,
            tvSettings: true,
            initStage2Interface: false,
            lights: false,
            bedRoom: false,
            livingRoom: false,
            cat: false,
            planeHolder: false,
            socials: false,
        });
    }

    #initStats() {
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        this.sketch.showPerformance(helper);
    }
}