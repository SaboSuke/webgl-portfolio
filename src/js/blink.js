import { COLORS, ENV_PATH } from './constants.js';

export default class Blink {
    prevCol = 'b';
    isPlaying = false;

    /**
     * @param {Sketch} sketch
     * @param {Object} position - Vec3 - default (0, 2, 0)
     * @param {String} text - default 'Click'
     * @param {Object} textPosition - Vec3 - default(0, 0, 0)
     * @constructor
     * @returns {Object} - { Blink, Shape, TextShape}
     */
    constructor(sketch, blinkPosition = null, text = null, textPosition, textRotation) {
        this.time = 0;
        this.blinkingText = null;
        this.previousFrameBlinked = false;
        this.clock = new THREE.Clock();
        this.sketch = sketch;
        this.position = blinkPosition || {
            x: 0,
            y: 2,
            z: 0
        };
        this.textPosition = textPosition || {
            x: blinkPosition ? blinkPosition.x : 0,
            y: blinkPosition ? blinkPosition.y + 0.25 : 0,
            z: blinkPosition ? blinkPosition.z : 0
        };
        this.textRotation = textRotation || { x: 0, y: 0, z: 0 };
        this.text = text || 'Click';

        this.#INIT();

        return {
            self: this,
            object: this.shape
        };
    }

    #INIT() {
        const geometry = new THREE.IcosahedronGeometry(0.07, 1);
        const material = new THREE.MeshBasicMaterial({
            color: COLORS.white,
            side: THREE.DoubleSide,
            transparent: true,
            wireframe: true
        });
        this.shape = new THREE.Mesh(geometry, material);
        this.shape.position.set(this.position.x, this.position.y, this.position.z);
    }

    #initText() {
        const loader = new THREE.FontLoader(), that = this;
        // couldn't animte textGeometry outside of the function
        loader.load(ENV_PATH + 'fonts/Poppins_Regular.json', function (font) {
            that.textGeometry = new THREE.TextGeometry(that.text, {
                font: font,
                size: 2,//80
                height: 0.5, //5
                curveSegments: 5, //12
            });
            that.textMaterial = new THREE.MeshStandardMaterial({
                color: COLORS.black,
            });
            const blinkText = new THREE.Mesh(that.textGeometry, that.textMaterial);
            blinkText.scale.set(0.1, 0.1, 0.1);
            blinkText.position.set(that.textPosition.x, that.textPosition.y, that.textPosition.z);
            blinkText.rotation.set(that.textRotation.x, that.textRotation.y, that.textRotation.z);

            that.sketch.scene.add(blinkText);
        });
    }

    blinkStart(delay = 0) {
        let current = new THREE.Color(this.prevCol === 'b' ? COLORS.white : COLORS.black);
        if (this.prevCol == 'b')
            this.prevCol = 'w';
        else this.prevCol = 'b';

        const tl = gsap.timeline(), that = this;
        setTimeout(() => {
            tl.to(this.shape.scale, {
                duration: 0.8,
                x: 2.5,
                y: 2.5,
                z: 2.5,
                ease: Back.easeOut.config(4),
            }).to(this.shape.material.color, {
                duration: 0.8,
                r: current.r,
                g: current.g,
                b: current.b,
                ease: 'Expo.easeInOut',
            }, '-=0.8').to(this.shape.scale, {
                duration: 1,
                x: 1.5,
                y: 1.5,
                z: 1.5,
                ease: Back.easeOut.config(4),
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