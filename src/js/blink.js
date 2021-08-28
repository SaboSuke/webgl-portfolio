import { COLORS } from './constants.js';

export default class Blink {
    prevCol = 'b';
    isPlaying = false;

    /**
     * @param {Object} position - Vec3 - default (0, 2, 0)
     * @constructor
     * @returns {Object}
     */
    constructor(position = null) {
        this.time = 0;
        this.previousFrameBlinked = false;
        this.clock = new THREE.Clock();
        this.position = position || {
            x: 0,
            y: 2,
            z: 0
        };

        this.init();
        return {
            self: this,
            object: this.circle
        };
    }

    init() {
        const geometry = new THREE.IcosahedronGeometry(0.07, 1);
        const material = new THREE.MeshBasicMaterial({
            color: COLORS.white,
            side: THREE.DoubleSide,
            transparent: true,
            wireframe: true
        });
        this.circle = new THREE.Mesh(geometry, material);
        this.circle.position.set(this.position.x, this.position.y, this.position.z);
    }

    blinkStart(delay = 0) {
        let current = new THREE.Color(this.prevCol === 'b' ? COLORS.white : COLORS.black);
        if (this.prevCol == 'b')
            this.prevCol = 'w';
        else this.prevCol = 'b';

        const tl = gsap.timeline(), that = this;
        setTimeout(() => {
            tl.to(this.circle.scale, {
                duration: 0.8,
                x: 2.5,
                y: 2.5,
                z: 2.5,
                ease: 'Expo.easeInOut',
            }).to(this.circle.material.color, {
                duration: 0.8,
                r: current.r,
                g: current.g,
                b: current.b,
                ease: 'Expo.easeInOut',
            }, '-=0.8').to(this.circle.scale, {
                duration: 1,
                x: 1.5,
                y: 1.5,
                z: 1.5,
                ease: 'Expo.easeInOut',
                onComplete: () => {
                    if (!that.isPlaying) return;

                    that.blinkStart();
                }
            }, '-=.1');
        }, delay);
    }

    togggleBlink(value) {
        this.isPlaying = value;
    }
}