import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { Stats } from '../../dist/stats.module.js';

import Shader from './shaders.js';
import Tv from './tv.js';
import Settings from './settings.js';
import LightBall from './lightball.js';
import Blink from './blink.js';

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
    shiftHelperMessage,
    initHelper,
    showStageBackButton,
    hideStageBackButton,
} from './base.js';
import {
    RAND, COLORS, SOCIAL_LINKS,
    STAGE_1_VEC, STAGE_2_VEC,
} from './constants.js';

import EventEmitter from './event.js';
export const EVENT = new EventEmitter();
const NB_STAGES = 2;

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
    resettingStarted = false;

    /**
     * 
     * @param {Object} options
     * @param {Boolean} [options.eSettings=false] - enable gui settings
     * @param {Boolean} [options.eStats=false] - enable performance stats
     * @param {Boolean} [options.eDevMod=false] - enable developer mode
     * @constructor
     */
    constructor(options = { }) {
        this.INIT(options);

        this.initTv();
        this.initEvents();
        this.loadLivingRoom();

        this.opts.eStats ? this.initStats() : 0;

        this.render();
    }

    INIT(options) {
        this.isPlaying = true;
        this.opts.eSettings = options.eSettings || false;
        this.opts.eStats = options.eStats || false;
        this.opts.eDevMod = options.eDevMod || true;
        this.shaders = new Shader();
        this.initMouse();
        this.initScene();
        this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);

        this.initHolder();
        this.initStage2Interface();
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

    initMouse() {
        this.mouse.x = (document.scrollingElement.clientHeight / this.sizes.width) * 2 - 1;
        this.mouse.y = -(document.scrollingElement.clientWidth / this.sizes.height) * 2 + 1;
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
        this.second_stage_objects.forEach(item => {
            this.domEvents.addEventListener(item.helper.object, 'mouseover', () => {
                this.triggerCursor('pointer');
            });

            this.domEvents.addEventListener(item.helper.object, 'mouseout', () => {
                this.triggerCursor('default');
            });
        });
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

    triggerLights() {
        this.lightBalls.forEach(light => {
            if (light.self.stage > this.currentStage || light.self.stage < this.currentStage)
                light.self.toggleLight(0);
            else
                light.self.toggleLight(1);
        })
    }

    resetStage2() {
        gsap.to(this.skillsClipboard.position, {
            x: 3, y: 2.7, z: -2.5,
            ease: 'Expo.easeInOut',
        });
        gsap.to(this.skillsClipboard.rotation, {
            x: -1.55, y: 0, z: 0,
            ease: 'Expo.easeInOut',
        });
        gsap.to(this.achievementsClipboard.position, {
            x: 5.6, y: 3.09, z: -4.2,
            ease: 'Expo.easeInOut',
        });
        gsap.to(this.achievementsClipboard.rotation, {
            x: -1.55, y: 0, z: -1.5,
            ease: 'Expo.easeInOut',
        });
        this.controls.enabled = true;
        hideStageBackButton();
    }

    initStage2Events() {
        // skill helper
        let that = this;
        this.domEvents.addEventListener(this.skillsBlinker.object, 'click', () => {
            this.controls.enabled = false;
            showStageBackButton();

            gsap.to(that.skillsClipboard.position, {
                x: -1.15, y: 5.8, z: 13,
                ease: 'Expo.easeInOut',
            });
            gsap.to(that.skillsClipboard.rotation, {
                x: -0.3, y: -0.2, z: 0,
                ease: 'Expo.easeInOut',
            });
        });

        document.querySelector('.btn-set#back')
            .addEventListener('click', this.resetStage2.bind(this));

        this.domEvents.addEventListener(this.achievementsBlinker.object, 'click', () => {
            this.controls.enabled = false;
            showStageBackButton();

            gsap.to(that.achievementsClipboard.position, {
                x: -1.15, y: 5.8, z: 13,
                ease: 'Expo.easeInOut',
            });
            gsap.to(that.achievementsClipboard.rotation, {
                x: -0.3, y: -0.2, z: 0,
                ease: 'Expo.easeInOut',
            });
        });

        document.querySelector('.btn-set#back')
            .addEventListener('click', this.resetStage2.bind(this));
    }

    initStage2Interface() {
        this.second_stage_objects = [];
        let loader = new THREE.TextureLoader();
        let geometry = new THREE.PlaneGeometry(0.35, 0.5, 10, 10);

        // init clipboards
        this.createSkillsClipboard(loader, geometry);
        this.createAchievementsClipboard(loader, geometry);

        this.initStage2Events();
    }

    resumeStage2BlinkHeplers() {
        this.skillsBlinker.self.togggleBlink(true);
        this.achievementsBlinker.self.togggleBlink(true);
        this.skillsBlinker.self.blinkStart();
        this.achievementsBlinker.self.blinkStart(1000);
    }

    pauseStage2BlinkHeplers() {
        this.skillsBlinker.self.togggleBlink(false);
        this.achievementsBlinker.self.togggleBlink(false);
    }

    createSkillsClipboard(loader, geometry) {
        let material = new THREE.MeshBasicMaterial({
            color: COLORS.white,
            side: THREE.DoubleSide,
            map: loader.load('/src/img/skills.png'),
            transparent: true,
        });

        this.skillsClipboard = new THREE.Mesh(geometry, material);
        this.skillsClipboard.position.set(3, 2.7, -2.5);
        this.skillsClipboard.rotation.set(-1.55, 0, 0);
        this.scene.add(this.skillsClipboard);

        // skill helper
        this.skillsBlinker = new Blink({
            x: 3, y: 2.9, z: -2.5
        });
        this.skillsBlinker.self.blinkStart();
        this.scene.add(this.skillsBlinker.object);

        this.second_stage_objects.push({
            name: 'skillsClipboard',
            element: this.skillsClipboard,
            helper: this.skillsBlinker,
        });
    }

    createAchievementsClipboard(loader, geometry) {
        let material = new THREE.MeshBasicMaterial({
            color: COLORS.white,
            side: THREE.DoubleSide,
            map: loader.load('/src/img/achievements.png'),
            transparent: true,
        });

        this.achievementsClipboard = new THREE.Mesh(geometry, material);
        this.achievementsClipboard.position.set(5.6, 3.09, -4.2);
        this.achievementsClipboard.rotation.set(-1.55, 0, -1.5);
        this.scene.add(this.achievementsClipboard);

        // skill helper
        this.achievementsBlinker = new Blink({
            x: 5.6, y: 3.3, z: -4.2
        });
        this.achievementsBlinker.self.blinkStart(1000);
        this.scene.add(this.achievementsBlinker.object);

        this.second_stage_objects.push({
            name: 'achievementsClipboard',
            element: this.achievementsClipboard,
            helper: this.achievementsBlinker,
        });
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

    changeStage(direction) {
        animateStageIntro(this.currentStage);
        this.triggerLights();
        this.changeHolderColor();

        this.resetStage2();
        if (this.currentStage === 2) this.resumeStage2BlinkHeplers();
        else this.pauseStage2BlinkHeplers();

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

    initTv() {
        this.objects = [];
        this.tv = new Tv(this);
        this.tvScreen = this.tv.initTv();
        this.scene.add(this.tvScreen);
    }

    initSettings() {
        new Settings(this, {
            camera: true,
            initStage2Interface: true,
            lights: false,
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
        if (!this.isPlaying) return;

        if (this.isLoaded) {
            const delta = this.clock.getDelta();
            if (this.bedRoomMixer) this.bedRoomMixer.update(delta);
            if (this.catMixer) this.catMixer.update(delta);

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

    triggerCursor(cursor) {
        document.body.style.cursor = cursor;
    }
}

// on load animations
EVENT.on('loaded', () => {
    setTimeout(() => {

        initHelper();

    }, 100);
});
