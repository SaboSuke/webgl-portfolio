import Blink from './blink.js';
import {
    showStageBackButton,
    hideStageBackButton,
} from '../js/_animation.js';
import { ENV_PATH, COLORS, RAND } from '../js/_constants.js';

export default class Stage2 {

    paused = false;
    closed = true;
    animationOn = null;
    /**
     * @desc Hanldes the second stage logic
     * 
     * @param {Sketch} sketch 
     * @constructor
     */
    constructor(sketch) {
        this.sketch = sketch;
        this.#initStageInterface();
    }

    resetStage() {
        this.closed = false;
        let that = this;
        if (this.animationOn) {
            let x = 3, y = 2.7, z = -2.5;
            let xx = -1.55, yy = 0, zz = 0;
            if (this.animationOn === 'a') {
                x = 5.6, y = 3.09, z = -4.2;
                xx = -1.55, yy = 0, zz = -1.5;
            }
            gsap.to(this.animatedObject.position, {
                duration: 2,
                x, y, z,
                ease: 'Expo.easeInOut',
            });
            gsap.to(this.animatedObject.rotation, {
                duration: 2,
                x: xx, y: yy, z: zz,
                ease: 'Expo.easeInOut',
            });
        } else {
            gsap.to(this.skillsClipboard.position, {
                duration: 2,
                x: 3, y: 2.7, z: -2.5,
                ease: 'Expo.easeInOut',
            });
            gsap.to(this.skillsClipboard.rotation, {
                duration: 2,
                x: -1.55, y: 0, z: 0,
                ease: 'Expo.easeInOut',
            });
            gsap.to(this.achievementsClipboard.position, {
                duration: 2,
                x: 5.6, y: 3.09, z: -4.2,
                ease: 'Expo.easeInOut',
            });
            gsap.to(this.achievementsClipboard.rotation, {
                duration: 2,
                x: -1.55, y: 0, z: -1.5,
                ease: 'Expo.easeInOut',
            });
        }
        this.sketch.controls.enabled = true;
        hideStageBackButton();
        setTimeout(() => {
            this.closed = true;
        }, 800);
    }

    #initStageEvents() {
        let that = this;
        this.sketch.domEvents.addEventListener(this.skillsBlinker.object, 'click', () => {
            if (this.paused) return;

            this.animationOn = 's';
            this.paused = false;
            this.sketch.controls.enabled = false;
            showStageBackButton();

            gsap.to(that.skillsClipboard.position, {
                duration: 0.6,
                x: -1.15, y: 5.8, z: 12.9,
                ease: Back.easeOut.config(0.1),
            });
            gsap.to(that.skillsClipboard.rotation, {
                duration: 0.6,
                x: -0.3, y: -0.2, z: 0,
                ease: Back.easeOut.config(0.1),
                onComplete: () => {
                    that.animateClipboards();
                }
            });
        });

        document.querySelector('.btn-set#back')
            .addEventListener('click', this.resetStage.bind(this));

        this.sketch.domEvents.addEventListener(this.achievementsBlinker.object, 'click', () => {
            if (this.paused) return;

            this.animationOn = 'a';
            this.paused = false;
            this.sketch.controls.enabled = false;
            showStageBackButton();

            gsap.to(that.achievementsClipboard.position, {
                duration: 0.6,
                x: -1.15, y: 5.8, z: 12.9,
                ease: Back.easeOut.config(0.1),
            });
            gsap.to(that.achievementsClipboard.rotation, {
                duration: 0.6,
                x: -0.3, y: -0.2, z: 0,
                ease: Back.easeOut.config(0.1),
                onComplete: () => {
                    that.animateClipboards();
                }
            });
        });

        document.querySelector('.btn-set#back')
            .addEventListener('click', this.resetStage.bind(this));
    }

    #initStageInterface() {
        this.objects = [];
        let loader = new THREE.TextureLoader();
        let geometry = new THREE.PlaneGeometry(0.35, 0.5, 10, 10);

        // init clipboards
        this.#createSkillsClipboard(loader, geometry);
        this.#createAchievementsClipboard(loader, geometry);

        this.#initStageEvents();
    }

    resumeStageBlinkHeplers() {
        this.skillsBlinker.self.togggleBlink(true);
        this.achievementsBlinker.self.togggleBlink(true);
        this.skillsBlinker.self.blinkStart();
        this.achievementsBlinker.self.blinkStart(1200);
    }

    pauseStageBlinkHeplers() {
        this.skillsBlinker.self.togggleBlink(false);
        this.achievementsBlinker.self.togggleBlink(false);
    }

    #createSkillsClipboard(loader, geometry) {
        let material = new THREE.MeshBasicMaterial({
            color: COLORS.white,
            side: THREE.DoubleSide,
            map: loader.load(ENV_PATH + 'img/skills.png'),
            transparent: true,
        }), that = this;

        this.skillsClipboard = new THREE.Mesh(geometry, material);
        this.skillsClipboard.position.set(3, 2.7, -2.5);
        this.skillsClipboard.rotation.set(-1.55, 0, 0);
        this.sketch.scene.add(this.skillsClipboard);

        // skill helper
        this.skillsBlinker = new Blink(this.sketch, {
            x: 3, y: 2.9, z: -2.5
        }, 'Skills!', null, {
            x: 0, y: -0.5, z: 0
        });
        this.skillsBlinker.self.blinkStart();
        this.sketch.scene.add(this.skillsBlinker.object);

        this.objects.push({
            name: 'skillsClipboard',
            element: this.skillsClipboard,
            helper: this.skillsBlinker,
        });
    }

    #createAchievementsClipboard(loader, geometry) {
        let material = new THREE.MeshBasicMaterial({
            color: COLORS.white,
            side: THREE.DoubleSide,
            map: loader.load(ENV_PATH + 'img/achievements.png'),
            transparent: true,
        });

        this.achievementsClipboard = new THREE.Mesh(geometry, material);
        this.achievementsClipboard.position.set(5.6, 3.09, -4.2);
        this.achievementsClipboard.rotation.set(-1.55, 0, -1.5);
        this.sketch.scene.add(this.achievementsClipboard);

        // skill helper
        this.achievementsBlinker = new Blink(this.sketch, {
            x: 5.6, y: 3.3, z: -4.2
        }, 'Achievements!', null, {
            x: 0, y: -0.6, z: 0
        });
        this.achievementsBlinker.self.blinkStart(1200);
        this.sketch.scene.add(this.achievementsBlinker.object);

        this.objects.push({
            name: 'achievementsClipboard',
            element: this.achievementsClipboard,
            helper: this.achievementsBlinker,
        });
    }

    animateClipboards() {
        let that = this;
        if (!this.closed) return;

        this.animatedObject = this.animationOn === 's' ? this.skillsClipboard : this.achievementsClipboard;
        let x = RAND(-1, 1);
        let y = RAND(-1, 1);
        let z = RAND(-1, 1);
        gsap.to(this.animatedObject.rotation, {
            duration: 1.2,
            x: Math.sin(2) * (x ?? 1) * 0.05,
            y: Math.sin(2) * (y ?? 1) * 0.05,
            z: Math.sin(2) * (z ?? -1) * 0.05,
            ease: Back.easeOut.config(4),
            onComplete: () => {
                that.animateClipboards();
            }
        });
    }

    pause() {
        this.pauseStageBlinkHeplers();
        this.paused = true;
    }

    resume() {
        this.resumeStageBlinkHeplers();
        this.paused = false;
    }
}