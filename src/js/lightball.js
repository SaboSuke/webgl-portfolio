import { RAND } from './constants.js';
export default class LightBall {
    /**
     * @desc Creates a light ball
     * 
     * @param {Sketch} sketch
     * @param {Object} positions - lightBall position(default: { x: 0, y: 0, z: 0 })
     * @param {String} color - lightball color
     * @return {Object} - { lightBall, shadowLight, ballMaterial }
     */
    constructor(sketch, positions = { }, color = 0xffffff, intensity = 1, stage = 1, textureRepeat = {
        x: 20,
        y: 8
    }) {
        this.sketch = sketch;
        this.stage = stage;
        this.positions = {
            x: positions.x || 0,
            y: positions.y || 0,
            z: positions.z || 0,
        };
        this.color = color;
        this.textureRepeat = textureRepeat || { x: 20, y: 8 };
        this.intensity = stage > 1 ? 0 : intensity;
        this.isActive = stage > 1 ? false : true;

        this.lightBall = null, this.shadowLight = null, this.ballMaterial = null;
        return this.INIT();
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
            self: this
        };
    }

    createLight(color) {
        const light = new THREE.PointLight(color, this.intensity, 20);
        light.castShadow = true;
        light.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects
        this.shadowLight = light;

        let geometry = new THREE.SphereGeometry(0.3, 16, 6);
        let material = new THREE.MeshBasicMaterial({ color: color });
        material.color.multiplyScalar(this.intensity);
        this.ballMaterial = material;
        let sphere = new THREE.Mesh(geometry, material);
        light.add(sphere);

        const texture = new THREE.TextureLoader().load('/src/maps/RoadMap.png');
        texture.magFilter = THREE.NearestFilter;
        texture.wrapT = THREE.RepeatWrapping;
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set(this.textureRepeat.x, this.textureRepeat.y);

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

    toggleLight(intensity = 1) {
        gsap.to(this.pointLight, {
            duration: 1.8,
            intensity,
            ease: 'Expo.easeInOut',
        });

        if (intensity === 0) this.isActive = false;
        else this.isActive = true;
    }

    animate(time) {
        if (!this.isActive) return;

        let that = this;
        if (this.stage === 1) {
            gsap.to(this.pointLight.position, {
                duration: 50,
                y: Math.sin(Math.PI) - that.pointLight.position.y,
                z: Math.sin(time * RAND(0, 1)) - that.pointLight.position.z,
                ease: 'Power0.easeInOut'
            });
            this.pointLight.rotation.x = time * 150;
            this.pointLight.rotation.z = time * 140;
        } else if (this.stage === 2) {
            this.pointLight.rotation.y = time * 100;
        }
    }
}