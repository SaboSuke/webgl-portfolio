import Blink from './blink.js';
import {
    showStageBackButton,
    hideStageBackButton,
} from '../js/_animation.js';
import { ENV_PATH, COLORS, STAGE_2_VEC, CLIPBOARD_VEC } from '../js/_config.js';
import { EVENT } from '../js/main.js';

export default class Stage2 {

    paused = false;
    closed = true;
    animationOn = null;
    boards = [];
    /**
     * @desc Handles the second stage logic
     * 
     * @param {Sketch} sketch 
     * @constructor
     */
    constructor(sketch) {
        this.sketch = sketch;
        this.#initStageInterface();
        this.#mobileHandler();
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

    positionCamera() {
        gsap.to(this.sketch.camera.position, {
            x: STAGE_2_VEC.position.x,
            y: STAGE_2_VEC.position.y,
            z: STAGE_2_VEC.position.z,
        });
        gsap.to(this.sketch.camera.target, {
            x: STAGE_2_VEC.target.x,
            y: STAGE_2_VEC.target.y,
            z: STAGE_2_VEC.target.z,
        });
    }

    #mobileHandler() {
        EVENT.on('touch', () => {
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(this.sketch.mouse, this.sketch.camera);
            var intersects = raycaster.intersectObjects([this.skillsBlinker.object, this.achievementsBlinker.object]);

            for (let i = 0; i < intersects.length; i++) {
                if (intersects[i].object === this.skillsBlinker.object) {
                    this.#handleClick('skills');
                } else {
                    this.#handleClick('achievements');
                }
            }
        });
    }

    #handleClick(type = null) {
        if (type === 'skills') {
            this.sketch.controls.enabled = false;
            showStageBackButton();
            this.positionCamera();

            gsap.to(this.skillsClipboard.position, {
                duration: 0.6,
                x: CLIPBOARD_VEC.position.x, y: CLIPBOARD_VEC.position.y, z: CLIPBOARD_VEC.position.z,
                ease: Back.easeOut.config(0.1),
            });
            gsap.to(this.skillsClipboard.rotation, {
                duration: 0.6,
                x: CLIPBOARD_VEC.rotation.x, y: CLIPBOARD_VEC.rotation.y, z: CLIPBOARD_VEC.rotation.z,
                ease: Back.easeOut.config(0.1),
            });
        } else {
            this.sketch.controls.enabled = false;
            showStageBackButton();
            this.positionCamera();

            gsap.to(this.achievementsClipboard.position, {
                duration: 0.6,
                x: CLIPBOARD_VEC.position.x, y: CLIPBOARD_VEC.position.y, z: CLIPBOARD_VEC.position.z,
                ease: Back.easeOut.config(0.1),
            });
            gsap.to(this.achievementsClipboard.rotation, {
                duration: 0.6,
                x: CLIPBOARD_VEC.rotation.x, y: CLIPBOARD_VEC.rotation.y, z: CLIPBOARD_VEC.rotation.z,
                ease: Back.easeOut.config(0.1),
            });
        }
    }

    #initStageEvents() {
        this.sketch.domEvents.addEventListener(this.skillsBlinker.object, 'click', () => {
            this.#handleClick('skills');
        });

        document.querySelector('.btn-set#back')
            .addEventListener('click', this.resetStage.bind(this));

        this.sketch.domEvents.addEventListener(this.achievementsBlinker.object, 'click', () => {
            this.#handleClick('achievements');
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

    resumeStageBlinkHelpers() {
        this.skillsBlinker.self.toggleBlink(true);
        this.achievementsBlinker.self.toggleBlink(true);
        this.skillsBlinker.self.blinkStart();
        this.achievementsBlinker.self.blinkStart(1200);
    }

    pauseStageBlinkHelpers() {
        this.skillsBlinker.self.toggleBlink(false);
        this.achievementsBlinker.self.toggleBlink(false);
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
        this.boards.push(this.skillsBlinker.object);
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
        this.boards.push(this.achievementsBlinker.object);
    }

    pause() {
        this.pauseStageBlinkHelpers();
        this.paused = true;
    }

    resume() {
        this.resumeStageBlinkHelpers();
        this.paused = false;
    }
}