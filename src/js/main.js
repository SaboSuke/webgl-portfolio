
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { Stats } from '../../dist/stats.module.js';
import Shader from './shaders.js';
import Tv from './tv.js';
import Settings from './settings.js';
import LightBall from './lightball.js';
import { rand, randFloor } from './base.js';

import EventEmitter from './event.js';
export const EVENT = new EventEmitter();

/**
 * 
 * @param {Object} options
 * @param {Boolean} [options.eSettings=false] - gui settings
 * @param {Boolean} [options.eStats=false] - fps and performance
 * @constructor
 */
export class Sketch {

    opts = {};
    colors = {
        green: 0x00ff00,
        red: 0xff050d,
        orange: 0xff2a03,
        white: 0xFFFFFF,
        black: 0x000000,
        bgLight: 0x260402,
        bgDark: 0x50110c,
    };
    isLoaded = false;
    time = 0;
    playhead = rand(0, 1);
    objects = [];
    sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    mouse = new THREE.Vector2();
    loader = new THREE.TextureLoader();
    material = null;
    geometry = null;
    mesh = null;
    shaders = {};

    constructor(options = {}) {
        this.INIT(options);

        this.initPlanes();
        this.initEvents();
        this.loadIsometricRoom();

        this.opts.eStats ? this.initStats() : 0;
        // this.opts.eSettings ? this.initSettings() : 0;

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
        document.querySelector('.container').appendChild(this.renderer.domElement);

        this.initCamera();
        this.initLights();
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(30, this.sizes.width / this.sizes.height, 1, 1000); //30
        this.camera.position.set(0, 5, 15);
        // this.camera.position.set(0, 0.5, 0.8);
        // this.camera.position.set(0, 10, 40);
        // this.camera.zoom = 2;

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
        let that = this;

        gsap.to(that.camera, {
            zoom: 1,
            onComplete() {
                that.camera.updateProjectionMatrix();
                gsap.to(that.camera.position, {
                    x: 0,
                    y: 5,
                    z: 15,
                });
            }
        });

        that.camera.zoom !== 1 ? that.camera.zoom = 1 : 0;

        this.resetControls();
        this.tv.resetTv();
    }
    resetControls() {
        gsap.to('#tv_contrls>div', {
            delay: 0.1,
            stagger: 0.1,
            y: '150px',
            opacity: 0,
            ease: 'Power0.easeInOut'
        });
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
        const initPlaneEvents = () => {
            this.domEvents.addEventListener(this.plane1, 'click', () => {
                gsap.to(this.camera.position, {
                    duration: 1,
                    x: -2.5,
                    y: 0.22,
                    z: 0,
                });
            });
            this.domEvents.addEventListener(this.plane2, 'click', () => {
                gsap.to(this.camera.position, {
                    x: -0.001,
                    y: 0,
                    z: 0,
                });

                gsap.to(this.camera, {
                    zoom: 1.25,
                });
                this.camera.updateProjectionMatrix();
            });
            this.domEvents.addEventListener(this.plane3, 'click', () => {
                gsap.to(this.camera.position, {
                    x: 1,
                    y: 0,
                    z: 0,
                });

                gsap.to(this.camera, {
                    zoom: 2,
                });
                this.camera.updateProjectionMatrix();
            });
            this.domEvents.addEventListener(this.plane4, 'click', () => {

            });
        }
        this.domEvents.addEventListener(this.plane5, 'mouseover', () => {
            if (!that.tv.isFullScreen()) {
                gsap.to('#tv_contrls>div', {
                    delay: 0.06,
                    stagger: 0.1,
                    y: 0,
                    opacity: 1,
                    ease: 'Power0.easeInOut'
                });

                gsap.to(this.camera.position, {
                    duration: 1,
                    x: 1,
                    y: 1,
                    z: 1.6,
                });

                gsap.to(this.camera, {
                    zoom: 1.5,
                });
                this.camera.updateProjectionMatrix();
            }
        });
    }

    initLights() {
        this.lightBalls = [
            new LightBall(this, { x: -3, y: 3, z: 5 }, this.colors.red, 1),
            new LightBall(this, { x: 3, y: 3, z: -5 }, this.colors.orange, 1),
        ];

        this.light1 = new THREE.PointLight(this.colors.white, 1);
        this.scene.add(new THREE.AmbientLight(this.colors.white, .2), this.light1);
    }

    initHolder() {
        const geometry = new THREE.BoxGeometry(40, 30, 30);
        const material = new THREE.MeshPhongMaterial({
            color: this.colors.bgLight,
            shininess: 10,
            specular: this.colors.bgDark,
            side: THREE.BackSide,
        });

        this.planeHolder = new THREE.Mesh(geometry, material);
        this.planeHolder.scale.set(1.3, 1.3, 1.3)
        this.planeHolder.position.set(2, 15.9, 0);
        this.planeHolder.receiveShadow = true;

        this.scene.add(this.planeHolder);
    }

    loadIsometricRoom() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load('/src/models/isometric-room/scene.gltf', function (gltf) {
            that.isometric_room = gltf.scene || gltf.scenes[0];

            that.isometric_room.scale.set(5, 5, 5);
            that.isometric_room.position.set(0, -1.2, -1.9);
            that.isometric_room.rotation.set(0, -1, 0);

            that.isometric_room.traverse(function (node) { if (node.isMesh) node.castShadow = true; });
            that.scene.add(that.isometric_room);

            that.opts.eSettings ? that.initSettings() : 0;
            EVENT.dispatch('loaded');
        },
            function (xhr) {
                console.log("rack: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
            }
        );
    }

    initPlanes() {
        // const textures = [
        //     new THREE.TextureLoader().load('/src/img/me.png'),
        //     new THREE.TextureLoader().load('/src/img/about.png'),
        //     new THREE.TextureLoader().load('/src/img/skills.png'),
        // ]

        // // 01 plane
        // this.geometry = new THREE.PlaneGeometry(1.1, 1.1);
        // this.material = new THREE.MeshStandardMaterial({
        //     color: 0xFFFFFF,
        //     transparent: true,
        //     depthTest: true,
        //     depthWrite: true,
        //     map: textures[0]
        // });

        // this.plane1 = new THREE.Mesh(this.geometry, this.material);
        // this.plane1.position.set(2.9, 0.3, 2.6);
        // this.plane1.rotation.set(0, 4.73, 0);
        // this.scene.add(this.plane1);

        // // 02 plane
        // this.geometry = new THREE.PlaneGeometry(1.1, 1.1);
        // this.material = new THREE.MeshStandardMaterial({
        //     color: 0xFFFFFF,
        //     transparent: true,
        //     depthTest: true,
        //     depthWrite: true,
        //     map: textures[1]
        // });

        // this.plane2 = new THREE.Mesh(this.geometry, this.material);
        // this.plane2.position.set(2.8, 0.29, -0.345);
        // this.plane2.rotation.set(0, 4.73, 0);
        // this.scene.add(this.plane2);

        // // 03 plane
        // this.geometry = new THREE.PlaneGeometry(1.1, 1.1);
        // this.material = new THREE.MeshStandardMaterial({
        //     color: 0xFFFFFF,
        //     transparent: true,
        //     depthTest: true,
        //     depthWrite: true,
        //     map: textures[2]
        // });
        // this.plane3 = new THREE.Mesh(this.geometry, this.material);
        // this.plane3.position.set(-2.88, 0.3, 0.21);
        // this.plane3.rotation.set(0, 1.6, 0);
        // this.scene.add(this.plane3);

        // // 04 plane
        // this.geometry = new THREE.PlaneGeometry(1.1, 1.1);
        // this.material = new THREE.MeshStandardMaterial({
        //     color: 0xFFFFFF,
        //     transparent: true,
        //     depthTest: true,
        //     depthWrite: true,
        //     map: textures[2]
        // });
        // this.plane4 = new THREE.Mesh(this.geometry, this.material);
        // this.plane4.position.set(-2.8, 0.3, 3.35);
        // this.plane4.rotation.set(0, 1.6, 0);
        // this.scene.add(this.plane4);

        // 05 plane
        // this.initTv();
        this.objects = [];
        this.tv = new Tv(this);
        this.plane5 = this.tv.initTv();
        this.scene.add(this.plane5);

        Array.prototype.push.apply(this.objects, [
            // this.plane1,
            // this.plane2,
            // this.plane3,
            // this.plane4,
            this.plane5,
        ]);
    }

    initSettings() {
        new Settings(this, {
            isometricRoom: true,
            camera: true,
            lights: false,
            planeHolder: true,
            tvSettings: true,
        });
    }

    initStats() {
        this.stats = Stats()
        document.body.appendChild(this.stats.dom)
    }

    render() {
        if (this.isLoaded) {
            let time = performance.now() * 0.001;
            this.lightBalls.forEach(ball => {
                ball.animate(time);
                time += 1000;
            });

            this.controls ? this.controls.update() : 0;
            this.stats ? this.stats.update() : 0;
        }

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}