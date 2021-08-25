/**
 * @desc Hanldes all the tv logic
 * 
 * @param {Class} sketch
 * @constructor
 * @returns {Tv}
 */
export default class Tv {

    play = true;
    srcs = [
        document.querySelector('.videos video.vid1'),
        document.querySelector('.videos video.vid2'),
        document.querySelector('.videos video.vid3'),
        document.querySelector('.videos video.vid4'),
    ];

    constructor(sketch, options = {}) {
        this.sketch = sketch;

        this.initTv();
        this.initTvControls();

        return this;
    }

    initTv() {
        this.videos = this.loadChannels();

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

    triggerTv() {
        if (this.play) {
            this.videos[this.previousVideo].opts.pause();
            this.sketch.scene.remove(this.tv);
        } else {
            this.sketch.scene.add(this.tv);
            this.videos[this.previousVideo].opts.play();
        }

        this.play = !this.play;
    }

    loadChannels() {
        let videos = [];

        for (let i = 0; i < this.srcs.length; i++) {
            const video = new THREE.VideoTexture(this.srcs[i]);
            video.minFilter = THREE.LinearFilter;
            video.magFilter = THREE.LinearFilter;

            videos.push({
                video: video,
                opts: this.srcs[i]
            });
        }

        return videos;
    }

    addChannel(videoElement) {
        this.srcs.push(document.querySelector(videoElement));

        return this;
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

            let color = this.sketch.colors.red;
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

    initTvControls() {
        this.btn1Options = { clicked: true };
        this.btn2Options = { clicked: false };
        this.btn3Options = { clicked: false };

        let power = new THREE.TextureLoader().load('/src/img/power.png'),
            left = new THREE.TextureLoader().load('/src/img/left.jpg'),
            right = new THREE.TextureLoader().load('/src/img/right.jpg');

        let geometry1 = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 60),
            geometry2 = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 60),
            geometry3 = new THREE.CylinderGeometry(0.02, 0.02, 0.06, 60),
            material1 = new THREE.MeshBasicMaterial({ color: this.play ? this.sketch.colors.green : this.sketch.colors.red, map: power }),
            material2 = new THREE.MeshBasicMaterial({ color: this.sketch.colors.white, map: left }),
            material3 = new THREE.MeshBasicMaterial({ color: this.sketch.colors.white, map: right });

        this.btn1 = new THREE.Mesh(geometry1, material1);
        this.btn1.position.set(-0.5, -0.54, this.play ? -2.52 : -2.51);
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