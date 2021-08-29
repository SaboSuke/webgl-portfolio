import { ENV_PATH } from './constants.js';
import { EVENT } from './main.js';

export default class ModelLoader {
    constructor(sketch) {
        if (!sketch) return;
        this.sketch = sketch;

        this.loadLivingRoom();
    }

    loadBedRoom() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load(ENV_PATH + 'models/bed-room/scene.gltf', function (gltf) {
            that.bedRoom = gltf.scene || gltf.scenes[0];
            that.bedRoomMixer = new THREE.AnimationMixer(that.bedRoom);

            const clip = gltf.animations.find((clip) => clip.name === 'Take 001');
            const action = that.bedRoomMixer.clipAction(clip);
            action.stop();

            that.bedRoom.scale.set(0.05, 0.05, 0.05);
            that.bedRoom.position.set(3.75, 1.6, -4.3);
            that.bedRoom.rotation.set(0, -1, 0);

            that.bedRoom.traverse(function (node) { if (node.isMesh) node.castShadow = true; });
            that.bedRoomModel = { bedRoom: that.bedRoom, action };
            that.sketch.scene.add(that.bedRoom);

            EVENT.dispatch('loaded');
        },
            function (xhr) {
                // console.log("bedRoom: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                that.logError();
            }
        );
    }

    loadCat() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load(ENV_PATH + 'models/cat/scene.gltf', function (gltf) {
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
            that.sketch.scene.add(that.cat);
        },
            function (xhr) {
                // console.log("cat: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                that.logError();
            }
        );
    }

    loadLivingRoom() {
        const loader = new THREE.GLTFLoader();
        let that = this;

        loader.load(ENV_PATH + 'models/living-room/scene.gltf', function (gltf) {
            that.livingRoom = gltf.scene || gltf.scenes[0];

            that.livingRoom.scale.set(5, 5, 5);
            that.livingRoom.position.set(0, -1.2, -1.9);
            that.livingRoom.rotation.set(0, -1, 0);

            that.livingRoom.traverse(function (node) { if (node.isMesh) node.castShadow = true; });
            that.sketch.scene.add(that.livingRoom);

            that.loadCat();
            that.loadBedRoom();
        },
            function (xhr) {
                // console.log("livingRoom: ", (xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                that.logError();
            }
        );
    }

    logError() {
        console.log('An error happened while loading a model!');
    }
}