import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { Stats } from '../../dist/stats.module.js';
import Shader from './shaders.js';

import EventEmitter from './event.js';
export const EVENT = new EventEmitter();

function rand(a, b) {
    return a + (b - a) * Math.random();
}

function randFloor(a, b) {
    return a + Math.floor((b - a) * Math.random());
}

/**
 * 
 * @param {Object} options
 * @param {Boolean} [options.eFlash=false] - room flash light
 * @param {Boolean} [options.eSettings=false] - gui settings
 * @param {Boolean} [options.eStats=false] - fps and performance
 * @constructor
 */
export class Sketch {

    opts = {};
    colors = {
        green: 0x00FF00,
        red: 0xFF0000,
        white: 0xFFFFFF,
        black: 0x000000
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

    tv = null;
    table = null;
    gui = null;

    constructor(options = {}) {
        this.opts.eFlash = options.eFlash || false;
        this.opts.eSettings = options.eSettings || false;
        this.opts.eStats = options.eStats || false;
        this.shaders = new Shader();
        this.initGlobalVars();
        this.initScene();
        this.domEvents = new THREEx.DomEvents(this.camera, this.renderer.domElement);

        this.loadRoom();
        this.initPlanes();
        this.initEvents();

        this.opts.eStats ? this.initStats() : 0;
        this.opts.eSettings ? this.initSettings() : 0;

        this.render();
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
        this.camera = new THREE.PerspectiveCamera(60, this.sizes.width / this.sizes.height, 1, 10000);
        this.camera.position.set(0, 0.5, 4.2);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.minDistance = 0;
        this.controls.maxDistance = Infinity || 50;
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

        this.controls.enableDamping = true;
        this.controls.update();
    }

    initGlobalVars() {
        this.mouse.x = (document.scrollingElement.clientHeight / this.sizes.width) * 2 - 1;
        this.mouse.y = -(document.scrollingElement.clientWidth / this.sizes.height) * 2 + 1;
    }

    initEvents() {
        //resize
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

        // camera reset
        document.querySelector('#reset').addEventListener('click', resetCamera)
        let that = this;
        function resetCamera() {
            gsap.to(that.camera, {
                zoom: 1,
                onComplete() {
                    that.camera.updateProjectionMatrix();
                    gsap.to(that.camera.position, {
                        x: 0,
                        y: 0.5,
                        z: 4.2,
                    });
                }
            });

            that.camera.zoom !== 1 ? that.camera.zoom = 1 : 0;
        }

        // camera redirect
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
        this.domEvents.addEventListener(this.plane5, 'mouseover', () => {
            gsap.to(this.camera.position, {
                duration: 1,
                x: 0,
                y: 0,
                z: 0.1,
            });

            gsap.to(this.camera, {
                zoom: 2,
            });
            this.camera.updateProjectionMatrix();
        });

        // cursor
        this.domEvents.addEventListener(this.tv.btn1, 'mouseover', () => document.body.style.cursor = 'pointer');
        this.domEvents.addEventListener(this.tv.btn2, 'mouseover', () => document.body.style.cursor = 'pointer');
        this.domEvents.addEventListener(this.tv.btn3, 'mouseover', () => document.body.style.cursor = 'pointer');
        this.domEvents.addEventListener(this.tv.btn1, 'mouseout', () => document.body.style.cursor = 'inherit');
        this.domEvents.addEventListener(this.tv.btn2, 'mouseout', () => document.body.style.cursor = 'inherit');
        this.domEvents.addEventListener(this.tv.btn3, 'mouseout', () => document.body.style.cursor = 'inherit');

        this.domEvents.addEventListener(this.plane1, 'mouseover', () => document.body.style.cursor = 'pointer');
        this.domEvents.addEventListener(this.plane2, 'mouseover', () => document.body.style.cursor = 'pointer');
        this.domEvents.addEventListener(this.plane3, 'mouseover', () => document.body.style.cursor = 'pointer');
        this.domEvents.addEventListener(this.plane4, 'mouseover', () => document.body.style.cursor = 'pointer');
        this.domEvents.addEventListener(this.plane1, 'mouseout', () => document.body.style.cursor = 'inherit');
        this.domEvents.addEventListener(this.plane2, 'mouseout', () => document.body.style.cursor = 'inherit');
        this.domEvents.addEventListener(this.plane3, 'mouseout', () => document.body.style.cursor = 'inherit');
        this.domEvents.addEventListener(this.plane4, 'mouseout', () => document.body.style.cursor = 'inherit');
    }

    initLights() {
        this.light1 = new THREE.PointLight(0xffffff, 1);
        this.light1.dispose();
        this.light1.position.set(0, 0, 0);
        this.scene.add(this.light1);

        const ambient = new THREE.AmbientLight(0xffffff, .2);
        ambient.position.set(0, 0, 0);
        this.scene.add(ambient);

        if (this.opts.enableFlash) {
            this.flash = new THREE.PointLight(0x062d89, 30, 500, 1.7);
            // position behind the scene
            this.flash.position.set(200, 300, 100);
            this.scene.add(this.flash);
        }
    }

    loadRoom() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load('/src/models/room/scene.gltf', function (gltf) {
            that.room = gltf.scene || gltf.scenes[0];

            that.room.scale.set(1, 1, 1);
            that.room.position.set(0, -1.2, 1);
            that.room.rotation.y = 9.45;

            that.room.traverse(function (node) {
                if (node.isMesh) { node.castShadow = true; }
            });

            that.scene.add(that.room);
            that.loadTable();
        },
            function (xhr) {
                // console.log("room: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
            }
        );
    }

    loadTable() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load('/src/models/table/scene.gltf', function (gltf) {
            that.table = gltf.scene || gltf.scenes[0];

            that.table.scale.set(0.002, 0.002, 0.002);
            that.table.position.set(0, -1.2, 1);

            that.table.traverse(function (node) { if (node.isMesh) node.castShadow = true; });

            that.scene.add(that.table);
            that.loadRack();
        },
            function (xhr) {
                // console.log("table: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
            }
        );
    }

    loadRack() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load('/src/models/rack/scene.gltf', function (gltf) {
            that.rack = gltf.scene || gltf.scenes[0];

            that.rack.scale.set(0.01, 0.01, 0.01);
            that.rack.position.set(0, -1.18, -1.9);

            that.rack.traverse(function (node) { if (node.isMesh) node.castShadow = true; });

            that.scene.add(that.rack);
            EVENT.dispatch('loaded');
        },
            function (xhr) {
                // console.log("rack: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened');
            }
        );
    }

    // remove if not used
    PlaneRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.objects);
        let that = this;

        for (const intersect of intersects) {
            if (intersect.object === this.plane5) {

            }
        }

        for (const object of this.objects) {
            if (!intersects.find(intersect => intersect.object === object)) {

            }
        }
    }

    initPlanes() {
        const textures = [
            new THREE.TextureLoader().load('/src/img/me.png'),
            new THREE.TextureLoader().load('/src/img/about.png'),
            new THREE.TextureLoader().load('/src/img/skills.png'),
        ]

        // 01 plane
        this.geometry = new THREE.PlaneGeometry(1.1, 1.1);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            map: textures[0]
        });

        this.plane1 = new THREE.Mesh(this.geometry, this.material);
        this.plane1.position.set(2.9, 0.3, 2.6);
        this.plane1.rotation.set(0, 4.73, 0);
        this.scene.add(this.plane1);

        // 02 plane
        this.geometry = new THREE.PlaneGeometry(1.1, 1.1);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            map: textures[1]
        });

        this.plane2 = new THREE.Mesh(this.geometry, this.material);
        this.plane2.position.set(2.8, 0.29, -0.345);
        this.plane2.rotation.set(0, 4.73, 0);
        this.scene.add(this.plane2);

        // 03 plane
        this.geometry = new THREE.PlaneGeometry(1.1, 1.1);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            map: textures[2]
        });
        this.plane3 = new THREE.Mesh(this.geometry, this.material);
        this.plane3.position.set(-2.88, 0.3, 0.21);
        this.plane3.rotation.set(0, 1.6, 0);
        this.scene.add(this.plane3);

        // 04 plane
        this.geometry = new THREE.PlaneGeometry(1.1, 1.1);
        this.material = new THREE.MeshStandardMaterial({
            color: 0xFFFFFF,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            map: textures[2]
        });
        this.plane4 = new THREE.Mesh(this.geometry, this.material);
        this.plane4.position.set(-2.8, 0.3, 3.35);
        this.plane4.rotation.set(0, 1.6, 0);
        this.scene.add(this.plane4);

        // 05 plane
        // this.initTv();
        this.objects = [];
        this.tv = new Tv(this);
        this.plane5 = this.tv.initTv();
        this.scene.add(this.plane5);

        Array.prototype.push.apply(this.objects, [
            this.plane1,
            this.plane2,
            this.plane3,
            this.plane4,
            this.plane5,
        ]);
    }

    initSettings() {
        let that = this;
        this.settings = {
            cameraPos: that.camera.position,
            light1: that.light1.position,
            // roomPos: that.room.position,
            // tablePos: that.table.position,
            // rackPos: that.rack.position,
            planePos: [
                that.plane1.position,
                that.plane2.position,
                that.plane3.position,
                that.plane4.position,
                // that.plane5.position,
            ],
            planeDeg: [
                that.plane1.rotation,
                that.plane2.rotation,
                that.plane3.rotation,
                that.plane4.rotation,
                // that.plane5.rotation,
            ],

            // tv
            btns: that.tv.buttons
        };
        this.gui = new dat.GUI();

        // camera
        {
            const cameraPos = this.gui.addFolder('camera position');
            cameraPos.add(this.settings.cameraPos, 'x');
            cameraPos.add(this.settings.cameraPos, 'y');
            cameraPos.add(this.settings.cameraPos, 'z');
        }

        // light
        {
            const light1 = this.gui.addFolder('room light position');
            light1.add(this.settings.light1, 'x');
            light1.add(this.settings.light1, 'y');
            light1.add(this.settings.light1, 'z');
        }

        // room
        {
            //     const room = this.gui.addFolder('room position');
            //     room.add(this.settings.roomPos, 'x');
            //     room.add(this.settings.roomPos, 'y');
            //     room.add(this.settings.roomPos, 'z');
        }

        // table
        {
            // const table = this.gui.addFolder('table position');
            // table.add(this.settings.tablePos, 'x');
            // table.add(this.settings.tablePos, 'y');
            // table.add(this.settings.tablePos, 'z');
        }

        // rack
        {
            //     const rack = this.gui.addFolder('rack position');
            //     rack.add(this.settings.rackPos, 'x');
            //     rack.add(this.settings.rackPos, 'y');
            //     rack.add(this.settings.rackPos, 'z');
        }

        // tv buttons
        {
            const tvBtn1 = this.gui.addFolder('tv button1 position');
            tvBtn1.add(this.settings.btns[0].position, 'x');
            tvBtn1.add(this.settings.btns[0].position, 'y');
            tvBtn1.add(this.settings.btns[0].position, 'z');

            const tvBtn1Rotate = this.gui.addFolder('tv button1 rotation');
            tvBtn1Rotate.add(this.settings.btns[0].rotation, 'x');
            tvBtn1Rotate.add(this.settings.btns[0].rotation, 'y');
            tvBtn1Rotate.add(this.settings.btns[0].rotation, 'z');
        }

        // planes settings
        const planesGeo = () => {
            // 01 plane
            const plane1Pos = this.gui.addFolder('Plane 1 Position');
            plane1Pos.add(this.settings.planePos[0], 'x').min(1);
            plane1Pos.add(this.settings.planePos[0], 'y').min(0);
            plane1Pos.add(this.settings.planePos[0], 'z').min(1);

            const plane1Deg = this.gui.addFolder('Plane 1 Rotation');
            plane1Deg.add(this.settings.planeDeg[0], 'x');
            plane1Deg.add(this.settings.planeDeg[0], 'y');
            plane1Deg.add(this.settings.planeDeg[0], 'z');

            // 02 plane
            const plane2Pos = this.gui.addFolder('Plane 2 Position');
            plane2Pos.add(this.settings.planePos[1], 'x');
            plane2Pos.add(this.settings.planePos[1], 'y');
            plane2Pos.add(this.settings.planePos[1], 'z');

            const plane2Deg = this.gui.addFolder('Plane 2 Rotation');
            plane2Deg.add(this.settings.planeDeg[1], 'x');
            plane2Deg.add(this.settings.planeDeg[1], 'y');
            plane2Deg.add(this.settings.planeDeg[1], 'z');

            // 03 plane
            const plane3Pos = this.gui.addFolder('Plane 3 Position');
            plane3Pos.add(this.settings.planePos[2], 'x');
            plane3Pos.add(this.settings.planePos[2], 'y');
            plane3Pos.add(this.settings.planePos[2], 'z');

            const plane3Deg = this.gui.addFolder('Plane 3 Rotation');
            plane3Deg.add(this.settings.planeDeg[2], 'x');
            plane3Deg.add(this.settings.planeDeg[2], 'y');
            plane3Deg.add(this.settings.planeDeg[2], 'z');

            // 04 plane
            const plane4Pos = this.gui.addFolder('Plane 4 Position');
            plane4Pos.add(this.settings.planePos[3], 'x');
            plane4Pos.add(this.settings.planePos[3], 'y');
            plane4Pos.add(this.settings.planePos[3], 'z');

            const plane4Deg = this.gui.addFolder('Plane 4 Rotation');
            plane4Deg.add(this.settings.planeDeg[3], 'x');
            plane4Deg.add(this.settings.planeDeg[3], 'y');
            plane4Deg.add(this.settings.planeDeg[3], 'z');

            // 05 plane
            // const plane5Pos = this.gui.addFolder('Plane 5 Position');
            // plane5Pos.add(this.settings.planePos[4], 'x');
            // plane5Pos.add(this.settings.planePos[4], 'y');
            // plane5Pos.add(this.settings.planePos[4], 'z');

            // const plane5Deg = this.gui.addFolder('Plane 5 Rotation');
            // plane5Deg.add(this.settings.planeDeg[4], 'x');
            // plane5Deg.add(this.settings.planeDeg[4], 'y');
            // plane5Deg.add(this.settings.planeDeg[4], 'z');
        }
        // planesGeo();
    }

    initStats() {
        this.stats = Stats()
        document.body.appendChild(this.stats.dom)
    }

    render() {
        if (this.isLoaded) {
            this.time++;
            this.playhead = rand(0, 1);
            this.PlaneRaycaster();

            this.controls ? this.controls.update() : 0;
            this.stats ? this.stats.update() : 0;
        }

        // randomize the flash lightning
        if (this.flash)
            if (Math.random() > 0.93 || this.flash.power > 100) {
                if (this.flash.power < 100)
                    this.flash.position.set(
                        Math.random() * 400,
                        300 + Math.random() * 200,
                        100
                    )

                this.flash.power = 50 + Math.random() * 500
            }

        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }
}

/**
 * 
 * @param {Class} sketch
 * @param {Object} options
 * @param {Boolean} [options.play=true] 
 * @constructor
 * @returns {Tv}
 */
class Tv {

    constructor(sketch, options = {}) {
        this.sketch = sketch;
        this.play = options.play || true;

        this.play ? this.initTv() : 0;
        this.createControls();

        return this;
    }

    loadVideos() {
        var srcs = [
            document.querySelector('.videos video.vid1'),
            document.querySelector('.videos video.vid2'),
            document.querySelector('.videos video.vid3'),
            document.querySelector('.videos video.vid4'),
        ]
        let videos = [];

        for (let i = 0; i < srcs.length; i++) {
            const video = new THREE.VideoTexture(srcs[i]);
            video.minFilter = THREE.LinearFilter;
            video.magFilter = THREE.LinearFilter;

            videos.push({
                video: video,
                opts: srcs[i]
            });
        }

        return videos;
    }

    initTv() {
        this.videos = this.loadVideos();

        this.geometry = new THREE.PlaneGeometry(1.551, 0.79);
        this.material = new THREE.MeshStandardMaterial({
            color: this.sketch.colors.white,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            map: this.videos[0].video
        });

        this.tv = new THREE.Mesh(this.geometry, this.material);
        this.tv.position.set(-0.159, -0.043, -2.45);
        this.tv.rotation.set(0, 0, 0);

        if (this.play) {
            this.videos[0].opts.play();
            this.previousVideo = 0;
        }

        return this.tv;
    }

    prevChannel() {
        let value = this.previousVideo + 0;
        if (this.previousVideo > 0)
            value--;
        else value = this.videos.length - 1;

        // stop current
        this.videos[this.previousVideo].opts.pause();
        this.videos[this.previousVideo].opts.currentTime = 0;

        // play next
        this.sketch.plane5.material.map = this.videos[value].video;
        this.videos[value].opts.play();

        // set prev
        this.previousVideo = value;
    }

    nextChannel() {
        let value = this.previousVideo + 0;
        if (this.previousVideo < this.videos.length - 1)
            value++;
        else value = 0;

        // stop current
        this.videos[this.previousVideo].opts.pause();
        this.videos[this.previousVideo].opts.currentTime = 0;

        // play next
        this.sketch.plane5.material.map = this.videos[value].video;
        this.videos[value].opts.play();

        // set prev
        this.previousVideo = value;
    }

    triggerTv(trigger = null) {
        if (this.play || trigger === false) {
            this.videos[this.previousVideo].opts.pause();
            this.sketch.scene.remove(this.tv);
        } else {
            this.sketch.scene.add(this.tv);
            this.videos[this.previousVideo].opts.play();
        }

        this.play = !this.play;
    }

    initButtonEvents() {
        this.sketch.domEvents.addEventListener(this.btn1, 'click', event => {
            let value = -2.51;
            if (this.btn1.position.z === -2.51) {
                value = -2.52;
            }

            gsap.to(this.btn1.position, {
                duration: .3,
                z: value,
            });

            let color = this.sketch.colors.white;
            if (!this.btn1Options.clicked) {
                color = this.sketch.colors.green;
                this.btn1Options.clicked = true;
            } else
                this.btn1Options.clicked = false;

            this.btn1.material.color = new THREE.Color(color);

            this.triggerTv();
        })

        this.sketch.domEvents.addEventListener(this.btn2, 'click', event => {
            let value = -2.51;
            let prev = -2.52;
            if (this.btn2.position.z === -2.51) {
                value = -2.52;
                prev = -2.51;
            }

            gsap.to(this.btn2.position, {
                duration: .2,
                z: value,
            })
            gsap.to(this.btn2.position, {
                delay: .2,
                duration: .2,
                z: prev
            })

            this.prevChannel();
            this.btn2Options.clicked = !this.btn2Options.clicked;
        })

        this.sketch.domEvents.addEventListener(this.btn3, 'click', event => {
            let value = -2.51;
            let prev = -2.52;
            if (this.btn3.position.z === -2.51) {
                value = -2.52;
                prev = -2.51;
            }

            gsap.to(this.btn3.position, {
                duration: .2,
                z: value,
            })
            gsap.to(this.btn3.position, {
                delay: .2,
                duration: .2,
                z: prev
            })

            this.nextChannel();
            this.btn3Options.clicked = !this.btn3Options.clicked;
        })
    }

    createControls() {
        this.btn1Options = { clicked: true };
        this.btn2Options = { clicked: false };
        this.btn3Options = { clicked: false };

        let power = new THREE.TextureLoader().load('/src/img/power.png'),
            left = new THREE.TextureLoader().load('/src/img/left.jpg'),
            right = new THREE.TextureLoader().load('/src/img/right.jpg');

        let geometry1 = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 60),
            geometry2 = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 60),
            geometry3 = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 60),
            material1 = new THREE.MeshBasicMaterial({ color: this.sketch.colors.green, map: power }),
            material2 = new THREE.MeshBasicMaterial({ color: this.sketch.colors.white, map: left }),
            material3 = new THREE.MeshBasicMaterial({ color: this.sketch.colors.white, map: right });

        this.btn1 = new THREE.Mesh(geometry1, material1);
        this.btn1.position.set(-0.5, -0.54, -2.52);
        this.btn1.rotation.set(0, 1.4, 1.55);
        this.sketch.scene.add(this.btn1);

        this.btn2 = new THREE.Mesh(geometry2, material2);
        this.btn2.position.set(-0.4, -0.54, -2.51);
        this.btn2.rotation.set(0, 1.4, 1.55);
        this.sketch.scene.add(this.btn2);

        this.btn3 = new THREE.Mesh(geometry3, material3);
        this.btn3.position.set(-0.3, -0.54, -2.51);
        this.btn3.rotation.set(0, 1.4, 1.55);
        this.sketch.scene.add(this.btn3);

        this.buttons = [
            this.btn1,
            this.btn2,
            this.btn3,
        ];

        this.initButtonEvents();
        Array.prototype.push.apply(this.sketch.objects, this.buttons);
    }
}