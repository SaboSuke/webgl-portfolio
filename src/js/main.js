import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.121.1/examples/jsm/controls/OrbitControls.js';
import Shader from './shaders.js';

function rand(a, b) {
    return a + (b - a) * Math.random();
}

export default class Animate {

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

    constructor() {

        this.shaders = new Shader();

        this.initGlobalVars();
        this.initCamera();
        this.initScene();
        this.initLights();

        this.createMesh();

        this.initEvents();
        this.render();
        // this.initSettings();

    }

    initScene() {
        this.scene = new THREE.Scene()

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.querySelector('.container').appendChild(this.renderer.domElement);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height, 0.01, 100);
        this.camera.position.set(0, 0, 2);
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

        window.addEventListener('mousemove', (e) => onMouseMove(e));
        let that = this;
        function onMouseMove(event) {
            gsap.to(that.mouse, {
                duration: .5,
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1,
            });
        }
    }

    initLights() {
        const ambientlight = new THREE.AmbientLight(0xffffff, 2);
        this.scene.add(ambientlight);
    }

    createMesh() {
        this.geometry = new THREE.SphereGeometry(0.9, 50, 50, 16);
        this.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
    }

    initSettings() {
        let that = this;
        this.settings = {};
        this.gui = new dat.GUI();
    }

    render() {
        this.time++;
        this.playhead = rand(0, 1);

        this.mesh.rotation.y += 0.01;
        this.mesh.rotation.x += 0.005;
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.render.bind(this));
    }

    loadTexture(texture) {
        if (typeof texture === 'array') {
            let a = [];
            for (let i = 0; i < texture.length; i++) {
                a.push(
                    this.loader.load(`./img/${texture[i]}`)
                );
            }
            return a;
        } else {
            return this.loader.load(`./img/${texture}`);
        }
    }
}

new Animate();