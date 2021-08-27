import { RAND } from './constants.js';

/**
 * @desc Creates a light ball
 * 
 * @param {Sketch} sketch
 * @param {Object} positions - lightBall position(default: { x: 0, y: 0, z: 0 })
 * @param {String} color - lightball color
 * @return {Object} - { lightBall, shadowLight, ballMaterial }
 */
export default class LightBall {
    constructor(sketch, positions = { }, color = 0xffffff, intensity = 1, stage = 1) {
        this.sketch = sketch;
        this.stage = stage;
        this.positions = {
            x: positions.x || 0,
            y: positions.y || 0,
            z: positions.z || 0,
        };
        this.color = color;
        this.intensity = intensity;

        this.lightBall = null, this.shadowLight = null, this.ballMaterial = null;
        this.INIT();
    }

    INIT() {
        this.pointLight = this.createLight(this.color);
        this.pointLight.scale.set(0.5, 0.5, 0.5);
        this.pointLight.position.set(this.positions.x, this.positions.y, this.positions.z);
        this.sketch.scene.add(this.pointLight);

        return {
            lightBall: this.lightBall,
            shadowLight: this.shadowLight,
            ballMaterial: this.ballMaterial,
        }
    }

    createLight(color) {
        const light = new THREE.PointLight(color, this.intensity, 20);
        light.castShadow = true;
        light.shadow.bias = - 0.0005; // reduces self-shadowing on double-sided objects
        this.shadowLight = light;

        let geometry = new THREE.SphereGeometry(0.3, 16, 6);
        let material = new THREE.MeshBasicMaterial({ color: color });
        material.color.multiplyScalar(this.intensity);
        this.ballMaterial = material;
        let sphere = new THREE.Mesh(geometry, material);
        light.add(sphere);

        const texture = new THREE.TextureLoader().load('/src/maps/RoadMap.png')
        texture.magFilter = THREE.NearestFilter;
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set(20, 8);

        geometry = new THREE.SphereGeometry(1, 32, 8);
        material = new THREE.MeshPhongMaterial({
            side: THREE.DoubleSide,
            alphaMap: texture,
            alphaTest: 0.5
        });

        sphere = new THREE.Mesh(geometry, material);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        light.add(sphere);

        // custom distance material
        const distanceMaterial = new THREE.MeshDistanceMaterial({
            alphaMap: material.alphaMap,
            alphaTest: material.alphaTest
        });
        sphere.customDistanceMaterial = distanceMaterial;

        this.lightBall = light;
        return light;
    }

    animate(time) {
        let that = this;
        if (this.stage == 1) {
            gsap.to(this.pointLight.position, {
                duration: 50,
                y: Math.sin(Math.PI) - that.pointLight.position.y,
                z: Math.sin(time * RAND(0, 1)) - that.pointLight.position.z,
                ease: 'Power0.easeInOut'
            })
            this.pointLight.rotation.x = time * 150;
            this.pointLight.rotation.z = time * 140;
        } else {

        }
    }
}