
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { Stats } from '../../dist/stats.module.js';

import Shader from './shaders.js';
import Tv from './tv.js';
import Settings from './settings.js';
import LightBall from './lightball.js';

import {
    hideTvControls,
    showTvControls,
    showStageControls,
    hideStageControls,
    hideUpArrow,
    hideDownArrow,
    showUpArrow,
    showDownArrow,
    shiftHelperMessage,
    initHelper
} from './base.js';
import { RAND, RAND_FLOOR, COLORS, SOCIAL_LINKS } from './constants.js';

import EventEmitter from './event.js';
export const EVENT = new EventEmitter();
const NB_STAGES = 2;

/**
 * 
 * @param {Object} options
 * @param {Boolean} [options.eSettings=false] - gui settings
 * @param {Boolean} [options.eStats=false] - fps and performance
 * @constructor
 */
export class Sketch {

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

    constructor(options = { }) {
        this.INIT(options);

        this.initTv();
        this.initEvents();
        this.loadLivingRoom();

        this.opts.eStats ? this.initStats() : 0;

        this.render();
    }

    INIT(options) {
        this.opts.eSettings = options.eSettings || true;
        this.opts.eStats = options.eStats || false;
        this.shaders = new Shader();
        this.initMouse();
        this.initScene();
        this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);

        this.initHolder();
    }

    LOAD() {
        this.isLoaded = true;
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
        this.camera = new THREE.PerspectiveCamera(30, this.sizes.width / this.sizes.height, 1, 1000); //30
        this.camera.position.set(-1, 3, 14);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.minDistance = 0;
        // this.controls.maxDistance = Infinity || 50;
        // this.controls.mouseButtons = {
        //     LEFT: THREE.MOUSE.ROTATE,
        //     MIDDLE: null,
        //     RIGHT: null
        // };
        // this.controls.touches = {
        //     ONE: THREE.TOUCH.ROTATE,
        //     TWO: null
        // };
        // this.controls.rotateSpeed = .5;
        // this.controls.enableDamping = true;

        this.controls.update();
    }

    initMouse() {
        this.mouse.x = (document.scrollingElement.clientHeight / this.sizes.width) * 2 - 1;
        this.mouse.y = -(document.scrollingElement.clientWidth / this.sizes.height) * 2 + 1;
    }

    resetPositions() {
        gsap.to(this.camera.position, {
            x: -1,
            y: 3,
            z: 14,
            ease: 'Expo.easeInOut'
        });
        this.camera.updateProjectionMatrix();

        gsap.to(this.controls.target, {
            x: 0,
            y: 0,
            z: 0,
            ease: 'Expo.easeInOut'
        });

        this.resetControls();
        this.tv.resetTv();

        // fix twitter icon
        gsap.to(this.twitter.position, { y: -1.24 });
        this.viewOnTv = false;

        // stage
        showStageControls();
        this.currentStage = 1;
    }

    resetControls() {
        hideTvControls();
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
            // icon fix
            if (!this.viewOnTv)
                gsap.to(this.twitter.position, { y: this.twitter.position.y + 0.04 });

            this.viewOnTv = true;
            hideStageControls();
            if (!that.tv.isFullScreen()) {
                showTvControls();

                gsap.to(this.camera.position, {
                    duration: 1,
                    x: 1,
                    y: -1.5,
                    z: 1,
                    ease: 'Expo.easeInOut'
                });

                gsap.to(this.controls.target, {
                    duration: 1,
                    x: 0,
                    y: -1.6,
                    z: -0.5,
                    ease: 'Expo.easeInOut'
                });

                this.camera.updateProjectionMatrix();
            }
        });

        // stage
        document.querySelector('.scroll-down.up').addEventListener('click', () => {
            this.changeStage('up');
            this.currentStage++;
            shiftHelperMessage(this.currentStage, 'up');

            if (this.currentStage > 1) {
                showDownArrow();
            }

            if (this.currentStage === NB_STAGES)
                hideUpArrow();
        })
        document.querySelector('.scroll-down.down').addEventListener('click', () => {
            this.changeStage('down');
            this.currentStage--;
            shiftHelperMessage(this.currentStage, 'down');

            if (this.currentStage <= 1)
                hideDownArrow();

            if (this.currentStage < NB_STAGES)
                showUpArrow();
        })
    }

    initLights() {
        this.lightBalls = [
            new LightBall(this, { x: -3, y: 3, z: 2 }, COLORS.red, 1, 1),
            new LightBall(this, { x: 3, y: 2, z: 2 }, COLORS.orange, 1, 1),
            new LightBall(this, { x: 3.75, y: 4.9, z: -4.27 }, COLORS.white, 1, 2),
        ];

        this.light1 = new THREE.PointLight(COLORS.white, 1);
        this.scene.add(new THREE.AmbientLight(COLORS.white, .2), this.light1);
    }

    initHolder() {
        let geometry = new THREE.BoxGeometry(40, 30, 30);
        let material = new THREE.MeshPhongMaterial({
            color: COLORS.bgLight,
            shininess: 10,
            specular: COLORS.bgDark,
            side: THREE.BackSide,
        });

        this.planeHolder = new THREE.Mesh(geometry, material);
        this.planeHolder.scale.set(1.3, 1.3, 1.3)
        this.planeHolder.position.set(2, 15.9, 0);
        this.planeHolder.receiveShadow = true;

        this.scene.add(this.planeHolder);
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
            map1 = loader.load('/src/img/linkedin.png'),
            map2 = loader.load('/src/img/github.png'),
            map3 = loader.load('/src/img/twitter.png');

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

            let y = -1.07;
            if (item.circle === this.github) y = -1.1;
            if (item.circle === this.twitter) y = -1.14;
            gsap.to(item.circle.position, {
                duration: .3,
                y,
                ease: 'Power1.easeInOut'
            })
        }));
        this.socials.forEach(item => this.domEvents.addEventListener(item.circle, 'mouseout', () => {
            document.body.style.cursor = "inherit";

            let y = -1.1;
            if (item.circle === this.github) y = -1.13;
            if (item.circle === this.twitter) y = -1.17;
            gsap.to(item.circle.position, {
                duration: .3,
                y,
                ease: 'Power1.easeInOut'
            })
        }));
    }

    loadBedRoom() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load('/src/models/bed-room/scene.gltf', function (gltf) {
            that.bedRoom = gltf.scene || gltf.scenes[0];
            that.bedRoomMixer = new THREE.AnimationMixer(that.bedRoom);

            const clip = gltf.animations.find((clip) => clip.name === 'Take 001');
            const action = that.bedRoomMixer.clipAction(clip);
            action.play();

            that.bedRoom.scale.set(0.05, 0.05, 0.05);
            that.bedRoom.position.set(3.75, 1.6, -4.3);
            that.bedRoom.rotation.set(0, -1, 0);

            that.bedRoom.traverse(function (node) { if (node.isMesh) node.castShadow = true; });
            that.bedRoomModel = { bedRoom: that.bedRoom, action };
            that.scene.add(that.bedRoom);

            that.opts.eSettings ? that.initSettings() : 0;
            EVENT.dispatch('loaded');
        },
            function (xhr) {
                // console.log("bedRoom: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
            }
        );
    }

    loadCat() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load('/src/models/cat/scene.gltf', function (gltf) {
            that.cat = gltf.scene || gltf.scenes[0];
            that.catMixer = new THREE.AnimationMixer(that.cat);

            const clip = gltf.animations.find((clip) => clip.name === 'Take 001');
            const action = that.catMixer.clipAction(clip);
            action.play();

            that.cat.scale.set(0.03, 0.03, 0.03);
            that.cat.position.set(2, -3.15, -0.8);
            that.cat.rotation.y = 2.5;

            that.cat.traverse(function (node) { if (node.isMesh) node.castShadow = true; });
            that.catModel = { cat: that.cat, action };
            that.scene.add(that.cat);
        },
            function (xhr) {
                // console.log("cat: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
            }
        );
    }

    loadLivingRoom() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load('/src/models/living-room/scene.gltf', function (gltf) {
            that.livingRoom = gltf.scene || gltf.scenes[0];

            that.livingRoom.scale.set(5, 5, 5);
            that.livingRoom.position.set(0, -1.2, -1.9);
            that.livingRoom.rotation.set(0, -1, 0);

            that.livingRoom.traverse(function (node) { if (node.isMesh) node.castShadow = true; });
            that.scene.add(that.livingRoom);

            that.initSocial();
            that.loadCat();
            that.loadBedRoom();
        },
            function (xhr) {
                // console.log("livingRoom: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
            }
        );
    }

    changeStage(direction) {
        let x1 = 3.5, y1 = 3, z1 = -5;
        let x2 = -1, y2 = 8, z2 = 14;
        if (direction === 'down') {
            x1 = 0, y1 = 0, z1 = 0;
            x2 = -1, y2 = 3, z2 = 14;
        }

        gsap.to(this.controls.target, {
            duration: 1,
            x: x1,
            y: y1,
            z: z1,
            ease: 'Expo.easeInOut'
        });
        gsap.to(this.camera.position, {
            duration: 1,
            x: x2,
            y: y2,
            z: z2,
            ease: 'Expo.easeInOut'
        });
        this.camera.updateProjectionMatrix();
    }

    initTv() {
        this.objects = [];
        this.tv = new Tv(this);
        this.tvScreen = this.tv.initTv();
        this.scene.add(this.tvScreen);
    }

    initSettings() {
        new Settings(this, {
            camera: true,
            lights: true,
            bedRoom: false,
            livingRoom: false,
            cat: false,
            planeHolder: false,
            tvSettings: false,
            socials: false,
        });
    }

    initStats() {
        this.stats = Stats()
        document.body.appendChild(this.stats.dom)
    }

    render() {
        if (this.isLoaded) {
            const delta = this.clock.getDelta();
            if (this.bedRoomMixer) this.bedRoomMixer.update(delta);
            if (this.catMixer) this.catMixer.update(delta);

            let time = performance.now() * 0.000001;
            this.lightBalls.forEach(ball => {
                ball.animate(time);
                time += time;
            });

            this.controls ? this.controls.update() : 0;
            this.stats ? this.stats.update() : 0;
        }

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

// on load animations
EVENT.on('loaded', () => {
    setTimeout(() => {

        initHelper();

    }, 100);
})