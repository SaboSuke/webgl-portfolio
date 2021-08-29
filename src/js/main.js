import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';

import Default from './default.js';
import Shader from './shaders.js';
import ModelLoader from './model-loader.js';
import Tv from './tv.js';
import LightBall from './lightball.js';
import Stage2 from './stage-2.js';

import {
    hideTvControls,
    showTvControls,
    hideStageIntros,
    showStageIntros,
    animateStageIntro,
    showStageControls,
    hideStageControls,
    hideUpArrow,
    hideDownArrow,
    showUpArrow,
    showDownArrow,
    typeTipMessage,
    shiftHelperMessage,
    initHelper,
} from './base.js';
import {
    ENV_PATH, RAND, COLORS,
    SOCIAL_LINKS, STAGE_1_VEC, STAGE_2_VEC,
} from './constants.js';

import EventEmitter from './event.js';
export const EVENT = new EventEmitter();
EVENT.on('loaded', () => {
    setTimeout(initHelper, 100);
});

const NB_STAGES = 2;
export class Sketch extends Default {

    opts = { };
    isLoaded = false;
    time = 0;
    playhead = RAND(0, 1);
    objects = [];
    sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    clock = new THREE.Clock();
    mouse = new THREE.Vector2();
    currentStage = 1;
    resettingStarted = false;

    /**
     * 
     * @param {Object} options
     * @param {Boolean} [options.eDevMod=false] - enable developer mode for movements
     * @constructor
     */
    constructor(options = { }) {
        super();
        this.INIT(options);

        this.initTv();
        this.initEvents();
        // this.loadLivingRoom();

        this.render();
    }

    INIT(options) {
        this.isPlaying = true;
        this.opts.eDevMod = options.eDevMod || true;
        this.shaders = new Shader();
        this.initMouse();
        this.initScene();
        this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);

        this.initHolder();
        this.initModels();
        this.stage2 = new Stage2(this);
    }

    LOAD() {
        this.isLoaded = true;

        animateStageIntro(1);
        typeTipMessage();
    }

    initMouse() {
        this.mouse.x = (document.scrollingElement.clientHeight / this.sizes.width) * 2 - 1;
        this.mouse.y = -(document.scrollingElement.clientWidth / this.sizes.height) * 2 + 1;
    }

    initScene() {
        this.scene = new THREE.Scene()
        this.scene.fog = new THREE.FogExp2(0x11111f, 0.002);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(this.scene.fog.color)
        document.querySelector('.scene').appendChild(this.renderer.domElement);

        this.initCamera();
        this.initLights();
    }

    initCamera() {
        let that = this;
        this.camera = new THREE.PerspectiveCamera(30, this.sizes.width / this.sizes.height, 1, 1000);
        this.camera.position.set(STAGE_1_VEC.position.x, STAGE_1_VEC.position.y, STAGE_1_VEC.position.z);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.target.set(STAGE_1_VEC.target.x, STAGE_1_VEC.target.y, STAGE_1_VEC.target.z);
        function controlAccess() {
            that.controls.minDistance = 0;
            that.controls.maxDistance = Infinity || 50;
            that.controls.mouseButtons = {
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: null,
                RIGHT: null
            };
            that.controls.touches = {
                ONE: THREE.TOUCH.ROTATE,
                TWO: null
            };
            that.controls.rotateSpeed = .5;
            that.controls.enableDamping = true;
        }

        if (!this.opts.eDevMod)
            controlAccess();

        this.controls.update();
    }

    initEvents() {
        //resize
        let that = this;
        window.addEventListener('resize', () => {
            // Update sizes
            this.sizes.width = window.innerWidth;
            this.sizes.height = window.innerHeight;

            // Update camera
            this.camera.aspect = this.sizes.width / this.sizes.height;
            this.camera.updateProjectionMatrix();

            // Update renderer
            this.renderer.setSize(this.sizes.width, this.sizes.height);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        })

        // mouse
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX / this.sizes.width * 2 - 1 // returns a value between -1 and +1 
            this.mouse.y = - (e.clientY / this.sizes.height) * 2 + 1
        });

        // camera & controls reset
        document.querySelector('#reset').addEventListener('click', () => {
            this.resetPositions();
        });

        // camera redirect
        this.viewOnTv = false;
        this.domEvents.addEventListener(this.tvScreen, 'mouseover', () => {
            if (this.resettingStarted) return;

            // icon fix
            if (!this.viewOnTv)
                gsap.to(this.twitter.position, { y: this.twitter.position.y + 0.04 });

            this.viewOnTv = true;
            hideStageControls();
            hideStageIntros();
            if (!that.tv.isFullScreen()) {
                showTvControls();

                gsap.to(this.camera.position, {
                    duration: 1,
                    x: 0.6,
                    y: -1.5,
                    z: 1,
                    ease: 'Expo.easeInOut'
                });
                gsap.to(this.controls.target, {
                    duration: 1,
                    x: -0.3,
                    y: -1.6,
                    z: -0.5,
                    ease: 'Expo.easeInOut'
                });

                this.camera.updateProjectionMatrix();
            }
        });

        // stage
        document.querySelector('.scroll-down.up').addEventListener('click', () => {
            this.currentStage++;
            this.changeStage('up');
            shiftHelperMessage(this.currentStage, 'up');

            if (this.currentStage > 1) {
                showDownArrow();
            }

            if (this.currentStage === NB_STAGES)
                hideUpArrow();
        })
        document.querySelector('.scroll-down.down').addEventListener('click', () => {
            this.currentStage--;
            this.changeStage('down');
            shiftHelperMessage(this.currentStage, 'down');

            if (this.currentStage <= 1)
                hideDownArrow();

            if (this.currentStage < NB_STAGES)
                showUpArrow();
        })

        // stage 2 helpers
        this.stage2.objects.forEach(item => {
            this.domEvents.addEventListener(item.helper.object, 'mouseover', () => {
                this.triggerCursor('pointer');
            });

            this.domEvents.addEventListener(item.helper.object, 'mouseout', () => {
                this.triggerCursor('default');
            });
        });
    }

    resetPositions() {
        this.resettingStarted = true;
        let that = this;

        gsap.to(this.controls.target, {
            x: STAGE_1_VEC.target.x,
            y: STAGE_1_VEC.target.y,
            z: STAGE_1_VEC.target.z,
            ease: 'Expo.easeInOut'
        });

        gsap.to(this.camera.position, {
            x: STAGE_1_VEC.position.x,
            y: STAGE_1_VEC.position.y,
            z: STAGE_1_VEC.position.z,
            ease: 'Expo.easeInOut',
            onComplete() {
                setTimeout(() => {
                    that.resettingStarted = false;
                }, 100);
            }
        });
        this.camera.updateProjectionMatrix();

        this.resetControls();
        this.tv.resetTv();
        this.tv.resetControls();
        this.tv.setFullScreen(false);
        const expand = document.querySelector('#expand');
        expand.innerHTML = '<i class="fas fa-expand"></i>';
        expand.classList.remove('expand');

        // fix twitter icon
        gsap.to(this.twitter.position, { y: -1.24 });
        this.viewOnTv = false;

        // stage
        showStageControls();
        showStageIntros();
        animateStageIntro(1, this.currentStage);

        this.currentStage = 1;
        this.changeHolderColor();
        this.triggerLights();
        shiftHelperMessage(this.currentStage, 'up', true);
    }

    resetControls() {
        hideTvControls();
    }

    initLights() {
        this.lightBalls = [
            new LightBall(this, { x: -3, y: 3, z: 2 }, COLORS.red, 1, 1),
            new LightBall(this, { x: 2, y: 2, z: 3 }, COLORS.orange, 1, 1),
            new LightBall(this, { x: 3.75, y: 4.9, z: -4.27 }, COLORS.white, 1, 2),
        ];

        this.light1 = new THREE.PointLight(COLORS.white, 1);
        this.scene.add(new THREE.AmbientLight(COLORS.white, .2), this.light1);
    }

    triggerLights() {
        this.lightBalls.forEach(light => {
            if (light.self.stage > this.currentStage || light.self.stage < this.currentStage)
                light.self.toggleLight(0);
            else
                light.self.toggleLight(1);
        })
    }

    changeStage(direction) {
        animateStageIntro(this.currentStage);
        this.triggerLights();
        this.changeHolderColor();

        this.stage2.resetStage();

        if (this.currentStage === 1) {
            this.tv.resumeChannel();
            this.models.catModel.action.play();

            this.stage2.pause();
            this.models.bedRoomModel.action.stop();
        } else if (this.currentStage === 2) {
            this.tv.pauseChannel();
            setTimeout(() => this.models.catModel.action.stop(), 500);

            this.stage2.resume();
            this.models.bedRoomModel.action.play();
        }

        let stage_vec = STAGE_2_VEC;
        if (direction === 'down')
            stage_vec = STAGE_1_VEC;

        gsap.to(this.controls.target, {
            duration: 1,
            x: stage_vec.target.x,
            y: stage_vec.target.y,
            z: stage_vec.target.z,
            ease: 'Expo.easeInOut'
        });
        gsap.to(this.camera.position, {
            duration: 1,
            x: stage_vec.position.x,
            y: stage_vec.position.y,
            z: stage_vec.position.z,
            ease: 'Expo.easeInOut'
        });
        this.camera.updateProjectionMatrix();
    }

    initHolder() {
        let geometry = new THREE.BoxGeometry(40, 30, 30);
        let material = new THREE.MeshPhongMaterial({
            color: COLORS.bgLight,
            shininess: 15,
            specular: COLORS.bgDark,
            side: THREE.BackSide,
        });

        this.planeHolder = new THREE.Mesh(geometry, material);
        this.planeHolder.scale.set(1.3, 1.3, 1.3);
        this.planeHolder.position.set(2, 15.9, -10);
        this.planeHolder.receiveShadow = true;

        this.scene.add(this.planeHolder);
    }

    changeHolderColor() {
        if (this.currentStage === 1) {
            const col = new THREE.Color(COLORS.bgLight);
            gsap.to(this.planeHolder.material.color, {
                duration: 1.5,
                r: col.r,
                g: col.g,
                b: col.b,
                ease: 'Expo.easeInOut'
            });
            gsap.to(this.planeHolder.material.specular, {
                duration: 1.5,
                r: col.r,
                g: col.g,
                b: col.b,
                ease: 'Expo.easeInOut'
            });
        } else if (this.currentStage === 2) {
            const col1 = new THREE.Color(COLORS.bgPinkDark);
            const col2 = new THREE.Color(COLORS.bgPink);
            gsap.to(this.planeHolder.material.color, {
                duration: 1.5,
                r: col1.r,
                g: col1.g,
                b: col1.b,
                ease: 'Expo.easeInOut'
            });
            gsap.to(this.planeHolder.material.specular, {
                duration: 1.5,
                r: col2.r,
                g: col2.g,
                b: col2.b,
                ease: 'Expo.easeInOut'
            });
        }
    }

    initSocial() {
        this.socials = [];
        let that = this;

        function createLink(map, link, name) {
            const geometry = new THREE.CircleGeometry(0.1, 80);
            const material = new THREE.MeshBasicMaterial({
                color: COLORS.white,
                side: THREE.DoubleSide,
                map: map,
                transparent: true
            });
            const circle = new THREE.Mesh(geometry, material);

            that.socials.push({ circle, link });

            return circle
        }
        const loader = new THREE.TextureLoader(),
            map1 = loader.load(ENV_PATH + 'img/linkedin.png'),
            map2 = loader.load(ENV_PATH + 'img/github.png'),
            map3 = loader.load(ENV_PATH + 'img/twitter.png');

        this.linkedin = createLink(map1, SOCIAL_LINKS.linkedin, 'linkedin');
        this.linkedin.position.set(-2.1, -1.21, -2.5);
        this.linkedin.rotation.set(0, 0.58, 0);

        this.github = createLink(map2, SOCIAL_LINKS.github, 'github');
        this.github.position.set(-1.69, -1.2, -2.8);
        this.github.rotation.set(0, 0.58, 0);

        this.twitter = createLink(map3, SOCIAL_LINKS.twitter, 'twitter');
        this.twitter.position.set(-1.3, -1.24, -3.2);
        this.twitter.rotation.set(0, 0.58, 0);

        this.scene.add(this.linkedin, this.github, this.twitter);

        this.socials.forEach(item => this.domEvents.addEventListener(item.circle, 'click', () => {
            window.open(item.link);
        }));
        this.socials.forEach(item => this.domEvents.addEventListener(item.circle, 'mouseover', () => {
            document.body.style.cursor = "pointer";
            gsap.to(item.circle.scale, {
                duration: 1,
                x: 1.3,
                y: 1.3,
                z: 1.3,
                ease: 'Expo.easeOut'
            })
        }));
        this.socials.forEach(item => this.domEvents.addEventListener(item.circle, 'mouseout', () => {
            document.body.style.cursor = "inherit";
            gsap.to(item.circle.scale, {
                duration: 1,
                x: 1,
                y: 1,
                z: 1,
                ease: 'Expo.easeOut'
            })
        }));
    }

    initModels() {
        this.models = new ModelLoader(this);

        this.initSocial();
    }

    initTv() {
        this.objects = [];
        this.tv = new Tv(this);
        this.tvScreen = this.tv.initTv();
        this.scene.add(this.tvScreen);
    }

    render() {
        if (!this.isPlaying) return;

        if (this.isLoaded) {
            const delta = this.clock.getDelta();
            this.models.bedRoomMixer && this.models.bedRoomMixer.update(delta);
            this.models.catMixer && this.models.catMixer.update(delta);

            let time = performance.now() * 0.000001;
            this.lightBalls.forEach(ball => {
                ball.self.animate(time);
                time += time;
            });

            this.controls ? this.controls.update() : 0;
            this.stats ? this.stats.update() : 0;
        }

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }

    play() {
        if (!this.isPlaying) {
            this.render()
            this.isPlaying = true;
        }
    }

    stop() {
        this.isPlaying = false;
    }

    showPerformance(stats) {
        this.stats = stats;
    }
}