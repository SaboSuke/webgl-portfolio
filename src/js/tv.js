/**
 * @desc Hanldes all the tv logic
 * 
 * @param {Class} sketch
 * @constructor
 * @returns {Tv}
 */
export default class Tv {

    play = true;
    channelElements = [
        document.querySelector('#tv video.vid1'),
        document.querySelector('#tv video.vid2'),
        document.querySelector('#tv video.vid3'),
        document.querySelector('#tv video.vid4'),
    ];
    isFullscreen = false;

    constructor(sketch, options = {}) {
        this.sketch = sketch;
        this.initTv();
        this.initTvEvents();

        return this;
    }

    initTvCover() {
        const geometry = new THREE.PlaneGeometry(1.27, 0.8);
        const material = new THREE.MeshStandardMaterial({
            color: this.sketch.colors.black,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        this.tvCover = new THREE.Mesh(geometry, material);
        this.tvCover.position.set(-1.61, -1.76, -2.65);
        this.tvCover.rotation.set(0, 0.58, 0);
        this.tvCover.translateX(0.01);
        this.sketch.scene.add(this.tvCover);
    }

    initTv() {
        this.initTvCover();
        this.channels = this.loadChannels();

        this.geometry = new THREE.PlaneGeometry(1.27, 0.8);
        this.material = new THREE.MeshBasicMaterial({
            color: this.sketch.colors.white,
            transparent: true,
            depthTest: false,
            depthWrite: false,
            map: this.channels[0].video
        });

        this.tv = new THREE.Mesh(this.geometry, this.material);
        this.tv.position.set(-1.61, -1.76, -2.65);
        this.tv.rotation.set(0, 0.58, 0);
        this.tv.translateX(0.01);

        if (this.play) {
            this.channels[0].opts.play();
            this.previousChannel = 0;
        }

        return this.tv;
    }

    triggerTv() {
        if (this.play) {
            this.channels[this.previousChannel].opts.pause();
            this.sketch.scene.remove(this.tv);
        } else {
            this.sketch.scene.add(this.tv);
            this.channels[this.previousChannel].opts.play();
        }

        this.play = !this.play;
    }

    loadChannels() {
        let channels = [];

        for (let i = 0; i < this.channelElements.length; i++) {
            const video = new THREE.VideoTexture(this.channelElements[i]);
            video.minFilter = THREE.LinearFilter;
            video.magFilter = THREE.LinearFilter;

            channels.push({
                video: video,
                opts: this.channelElements[i]
            });
        }

        return channels;
    }

    addChannel(videoElement) {
        this.channelElements.push(document.querySelector(videoElement));

        return this;
    }

    prevChannel() {
        let value = this.previousChannel + 0;
        if (this.previousChannel > 0)
            value--;
        else value = this.channels.length - 1;

        // stop current
        this.channels[this.previousChannel].opts.pause();
        this.channels[this.previousChannel].opts.currentTime = 0;

        // play next
        this.sketch.plane5.material.map = this.channels[value].video;
        this.channels[value].opts.play();

        // set prev
        this.previousChannel = value;
    }

    nextChannel() {
        let value = this.previousChannel + 0;
        if (this.previousChannel < this.channels.length - 1)
            value++;
        else value = 0;

        // stop current
        this.channels[this.previousChannel].opts.pause();
        this.channels[this.previousChannel].opts.currentTime = 0;

        // play next
        this.sketch.plane5.material.map = this.channels[value].video;
        this.channels[value].opts.play();

        // set prev
        this.previousChannel = value;
    }

    initTvEvents() {
        const power = document.querySelector('#power'),
            prev = document.querySelector('#prev'),
            next = document.querySelector('#next'),
            expand = document.querySelector('#expand');

        power.addEventListener('click', () => {
            this.triggerTv();
        });

        prev.addEventListener('click', () => {
            this.prevChannel();
        });

        next.addEventListener('click', () => {
            this.nextChannel();
        });

        expand.addEventListener('click', () => {
            if (!this.isFullscreen) this.isFullscreen = true;

            if (expand.classList.contains('expand')) {
                expand.innerHTML = '<i class="fas fa-expand"></i>';
                expand.classList.remove('expand');

                this.sketch.resetPositions();
            } else {
                expand.classList.add('expand')
                expand.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';

                gsap.to(this.sketch.camera.position, {
                    x: 0,
                    y: 0,
                    z: 2,
                });
                this.sketch.camera.zoom = 1;
                this.sketch.camera.updateProjectionMatrix();

                this.tv.translateX(0);
                this.tvCover.translateX(0);
                gsap.to([this.tv.position, this.tvCover.position], {
                    x: 0,
                    y: 0,
                    z: 0,
                });
                gsap.to([this.tv.scale, this.tvCover.scale], {
                    x: 1.2,
                    y: 1,
                    z: 1.2,
                });
                gsap.to([this.tv.rotation, , this.tvCover.rotation], {
                    x: 0,
                    y: 0,
                    z: 0,
                });
            }
        });
    }

    resetTv() {
        const timeline = gsap.timeline();
        let that = this;

        this.tv.translateX(0.01);
        this.tvCover.translateX(0.01);
        gsap.to([this.tv.scale, this.tvCover.scale], {
            x: 1,
            y: 1,
            z: 1,
        });
        gsap.to([this.tv.rotation, , this.tvCover.rotation], {
            x: 0,
            y: 0.58,
            z: 0,
        });

        timeline.to([this.tv.position, this.tvCover.position], {
            duration: 1,
            x: -1.61,
            y: -1.76,
            z: -2.65,
        }).to(this.sketch.camera, {
            duration: 0.01,
            zoom: 1
        }, '-=1').to(this.sketch.camera.position, {
            duration: 1,
            x: 0,
            y: 5,
            z: 15,
            onComplete() {
                that.sketch.camera.updateProjectionMatrix();
            }
        }, '-=1');

        this.isFullscreen = false;
    }

    isFullScreen() {
        return this.isFullscreen;
    }
}