import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import { Stats } from '../../dist/stats.module.js';
import Shader from './shaders.js';

import EventEmitter from './event.js';
const EVENT = new EventEmitter();

function rand(a, b) {
    return a + (b - a) * Math.random();
}

/**
 * @param {Object} options
 * @param {boolean} [options.eFlash=false] - room flash light
 * @param {boolean} [options.eSettings=false] - gui settings
 * @param {boolean} [options.eStats=false] - fps and performance
 * @constructor
 */
export default class Sketch {

    opts = {};
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
        this.opts.eFlash = options.eFlash || false;
        this.opts.eSettings = options.eSettings || true;
        this.opts.eStats = options.eStats || false;
        this.shaders = new Shader();

        this.initGlobalVars();
        this.initScene();

        this.loadGallery();
        this.initPlanes();

        this.initEvents();
        this.opts.eStats ? this.initStats() : 0;
        this.render();
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
        this.camera.position.set(0, 0, 4.5);

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

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX / this.sizes.width * 2 - 1 // returns a value between -1 and +1 
            this.mouse.y = - (e.clientY / this.sizes.height) * 2 + 1
        });
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

    loadGallery() {
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
                console.log("room: ", (xhr.loaded / xhr.total * 100) + '% loaded');
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
            that.opts.eSettings ? that.initSettings() : 0;
            // that.loadRack();
        },
            function (xhr) {
                console.log("table: ", (xhr.loaded / xhr.total * 100) + '% loaded');
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
            // that.opts.eSettings ? that.initSettings() : 0;

            // end of loading
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

    PlaneRaycaster() {
        const raycaster = new THREE.Raycaster();

        // update the picking ray with the camera and mouse position
        raycaster.setFromCamera(this.mouse, this.camera);
        // calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(this.objects);
        let that = this;
        for (const intersect of intersects) {
            if (intersect.object === this.plane1) {
                gsap.to(this.camera.position, {
                    duration: 1,
                    x: -2.5,
                    y: 0.22,
                    z: 0,
                });

                gsap.to(this.camera, {
                    zoom: 2.5,
                    onComplete: () => {
                        this.camera.updateProjectionMatrix();
                    }
                });
            }

            gsap.to(intersect.object.scale, {
                x: 1.5,
                y: 1.5,
                z: 1.5
            });
        }

        for (const object of this.objects) {
            if (!intersects.find(intersect => intersect.object === object)) {
                gsap.to(object.scale, {
                    x: 1,
                    y: 1,
                    z: 1
                })
            }
        }
    }

    initPlanes() {
        // 00 plane
        const texture = new THREE.TextureLoader().load('/src/img/sky.jpg');
        const geometry = new THREE.PlaneGeometry(6, 3.5);
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            alphaMap: texture,
        });

        this.plane0 = new THREE.Mesh(geometry, material);
        this.plane0.position.set(0, 0, -2.65);
        this.plane0.rotation.set(0, 0.02, 0);
        // this.scene.add(this.plane0);

        this.geometry = new THREE.PlaneGeometry(1.1, 1.1);
        this.material = new THREE.MeshStandardMaterial({
            color: "red",
            transparent: true,
            side: THREE.DoubleSide,
            depthTest: true,
            depthWrite: true,
        });


        // 01 plane
        this.plane1 = new THREE.Mesh(this.geometry, this.material);
        this.plane1.position.set(2.9, 0.3, 2.6);
        this.plane1.rotation.set(0, 1.6, 0);
        this.scene.add(this.plane1);

        // 02 plane
        this.plane2 = new THREE.Mesh(this.geometry, this.material);
        this.plane2.position.set(2.8, 0.29, -0.345);
        this.plane2.rotation.set(0, 1.6, 0);
        this.scene.add(this.plane2);

        // 03 plane
        this.plane3 = new THREE.Mesh(this.geometry, this.material);
        this.plane3.position.set(-2.88, 0.3, 0.2);
        this.plane3.rotation.set(0, 1.6, 0);
        this.scene.add(this.plane3);

        // 04 plane
        this.plane4 = new THREE.Mesh(this.geometry, this.material);
        this.plane4.position.set(-2.8, 0.3, 3.35);
        this.plane4.rotation.set(0, 1.6, 0);
        this.scene.add(this.plane4);


        this.objects = [
            this.plane1,
            this.plane2,
            this.plane3,
            this.plane4,
        ];


        this.PlaneRaycaster();
    }

    initSettings() {
        let that = this;
        this.settings = {
            cameraPos: that.camera.position,
            light1: that.light1.position,
            roomPos: that.room.position,
            tablePos: that.table.position,
            // rackPos: that.rack.position,
            planePos: [
                that.plane0.position,
                that.plane1.position,
                that.plane2.position,
                that.plane3.position,
                that.plane4.position,
            ],
            planeDeg: [
                that.plane0.rotation,
                that.plane1.rotation,
                that.plane2.rotation,
                that.plane3.rotation,
                that.plane4.rotation,
            ],
        };
        this.gui = new dat.GUI();

        // camera
        {
            const cameraPos = this.gui.addFolder('camera position');
            cameraPos.add(this.settings.cameraPos, 'x');
            cameraPos.add(this.settings.cameraPos, 'y');
            cameraPos.add(this.settings.cameraPos, 'z');

            // const cameraY = this.gui.addFolder('camera translateY');
            // cameraY.add(this.camera, 'translateY');
            // const cameraX = this.gui.addFolder('camera translateX');
            // cameraX.add(this.camera, 'translateX');
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
            const room = this.gui.addFolder('room position');
            room.add(this.settings.roomPos, 'x');
            room.add(this.settings.roomPos, 'y');
            room.add(this.settings.roomPos, 'z');
        }

        // table
        {
            const table = this.gui.addFolder('table position');
            table.add(this.settings.tablePos, 'x');
            table.add(this.settings.tablePos, 'y');
            table.add(this.settings.tablePos, 'z');
        }

        // rack
        // {
        //     const rack = this.gui.addFolder('rack position');
        //     rack.add(this.settings.rackPos, 'x');
        //     rack.add(this.settings.rackPos, 'y');
        //     rack.add(this.settings.rackPos, 'z');
        // }

        // planes settings
        const planesGeo = () => {
            // 00 plane
            const plane0Pos = this.gui.addFolder('Plane 0 Position');
            plane0Pos.add(this.settings.planePos[0], 'x');
            plane0Pos.add(this.settings.planePos[0], 'y');
            plane0Pos.add(this.settings.planePos[0], 'z');

            const plane0Deg = this.gui.addFolder('Plane 0 Rotation');
            plane0Deg.add(this.settings.planeDeg[0], 'x');
            plane0Deg.add(this.settings.planeDeg[0], 'y');
            plane0Deg.add(this.settings.planeDeg[0], 'z');

            // 01 plane
            const plane1Pos = this.gui.addFolder('Plane 1 Position');
            plane1Pos.add(this.settings.planePos[1], 'x').min(1);
            plane1Pos.add(this.settings.planePos[1], 'y').min(0);
            plane1Pos.add(this.settings.planePos[1], 'z').min(1);

            const plane1Deg = this.gui.addFolder('Plane 1 Rotation');
            plane1Deg.add(this.settings.planeDeg[1], 'x');
            plane1Deg.add(this.settings.planeDeg[1], 'y');
            plane1Deg.add(this.settings.planeDeg[1], 'z');

            // 02 plane
            const plane2Pos = this.gui.addFolder('Plane 2 Position');
            plane2Pos.add(this.settings.planePos[2], 'x');
            plane2Pos.add(this.settings.planePos[2], 'y');
            plane2Pos.add(this.settings.planePos[2], 'z');

            const plane2Deg = this.gui.addFolder('Plane 2 Rotation');
            plane2Deg.add(this.settings.planeDeg[2], 'x');
            plane2Deg.add(this.settings.planeDeg[2], 'y');
            plane2Deg.add(this.settings.planeDeg[2], 'z');

            // 03 plane
            const plane3Pos = this.gui.addFolder('Plane 3 Position');
            plane3Pos.add(this.settings.planePos[3], 'x');
            plane3Pos.add(this.settings.planePos[3], 'y');
            plane3Pos.add(this.settings.planePos[3], 'z');

            const plane3Deg = this.gui.addFolder('Plane 3 Rotation');
            plane3Deg.add(this.settings.planeDeg[3], 'x');
            plane3Deg.add(this.settings.planeDeg[3], 'y');
            plane3Deg.add(this.settings.planeDeg[3], 'z');

            // 04 plane
            const plane4Pos = this.gui.addFolder('Plane 4 Position');
            plane4Pos.add(this.settings.planePos[4], 'x');
            plane4Pos.add(this.settings.planePos[4], 'y');
            plane4Pos.add(this.settings.planePos[4], 'z');

            const plane4Deg = this.gui.addFolder('Plane 4 Rotation');
            plane4Deg.add(this.settings.planeDeg[4], 'x');
            plane4Deg.add(this.settings.planeDeg[4], 'y');
            plane4Deg.add(this.settings.planeDeg[4], 'z');
        }
    }

    initStats() {
        const stats = Stats()
        document.body.appendChild(stats.dom)
    }

    render() {
        this.time++;
        this.playhead = rand(0, 1);
        this.PlaneRaycaster();
        this.controls.update();

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

const sketch = new Sketch();
EVENT.on('loaded', () => {
    console.log("Scene has loaded");
});