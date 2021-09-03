import {
    COLORS,
    CHANNEL_ELEMENTS,
    CHANNEL_SOURCES
} from './constants.js';

export default class Tv {

    play = true;
    paused = false;
    isFullscreen = false;

    /**
     * @desc Hanldes all the tv logic
     * 
     * @param {Sketch} sketch
     * @constructor
     * @returns {Tv}
     */
    constructor(sketch) {
        this.sketch = sketch;
        this.initTv();
        this.#initTvEvents()

        return this;
    }

    #initTvCover() {
        const geometry = new THREE.PlaneGeometry(1.27, 0.8);
        const material = new THREE.MeshStandardMaterial({
            color: COLORS.black,
            transparent: true,
            depthTest: false,
            depthWrite: false,
        });

        this.tvCover = new THREE.Mesh(geometry, material);
        this.tvCover.position.set(-1.598, -1.77, -2.65);
        this.tvCover.rotation.set(0, 0.58, 0);
        this.sketch.scene.add(this.tvCover);
    }

    initTv() {
        this.#initTvCover();
        this.channels = this.#loadChannels();

        this.geometry = new THREE.PlaneGeometry(1.25, 0.78);
        this.material = new THREE.MeshBasicMaterial({
            color: COLORS.white,
            transparent: true,
            depthTest: true,
            depthWrite: true,
            map: this.channels[0].video
        });

        this.tv = new THREE.Mesh(this.geometry, this.material);
        this.tv.position.set(-1.598, -1.77, -2.65);
        this.tv.rotation.set(0, 0.58, 0);

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

    #loadChannels() {
        let channels = [];

        for (let i = 0; i < CHANNEL_ELEMENTS.length; i++) {
            const video = new THREE.VideoTexture(CHANNEL_ELEMENTS[i]);
            video.minFilter = THREE.LinearFilter;
            video.magFilter = THREE.LinearFilter;
            video.src = CHANNEL_SOURCES[i];

            channels.push({
                video: video,
                opts: CHANNEL_ELEMENTS[i]
            });
        }

        return channels;
    }

    addChannel(videoElement) {
        CHANNEL_ELEMENTS.push(document.querySelector(videoElement));

        return this;
    }

    pauseChannel() {
        this.channels[this.previousChannel].opts.pause();
    }

    resumeChannel() {
        this.channels[this.previousChannel].opts.play();
    }

    #prevChannel() {
        let value = this.previousChannel + 0;
        if (this.previousChannel > 0)
            value--;
        else value = this.channels.length - 1;

        // stop current
        this.channels[this.previousChannel].opts.pause();
        this.channels[this.previousChannel].opts.currentTime = 0;

        // play next
        this.sketch.tvScreen.material.map = this.channels[value].video;
        this.channels[value].opts.play();

        // set prev
        this.previousChannel = value;
    }

    #nextChannel() {
        let value = this.previousChannel + 0;
        if (this.previousChannel < this.channels.length - 1)
            value++;
        else value = 0;

        // stop current
        this.channels[this.previousChannel].opts.pause();
        this.channels[this.previousChannel].opts.currentTime = 0;

        // play next
        this.sketch.tvScreen.material.map = this.channels[value].video;
        this.channels[value].opts.play();

        // set prev
        this.previousChannel = value;
    }

    #initTvEvents() {
        const prev = document.querySelector('#prev'),
            next = document.querySelector('#next'),
            expand = document.querySelector('#expand');

        prev.addEventListener('click', () => {
            if (!this.paused)
                this.#prevChannel();
        });

        next.addEventListener('click', () => {
            if (!this.paused)
                this.#nextChannel();
        });

        expand.addEventListener('click', () => {
            if (!this.isFullscreen) this.isFullscreen = true;

            if (expand.classList.contains('expand')) {
                expand.innerHTML = '<i class="fas fa-expand"></i>';
                expand.classList.remove('expand');

                this.sketch.resetPositions();
            } else {
                expand.classList.add('expand');
                expand.innerHTML = '<i class="fas fa-compress-arrows-alt"></i>';

                this.#expandTv();
                this.#clearControls();
            }
        });
    }

    resetControls() {
        gsap.to('.btn-set.sanitize', {
            borderColor: '',
            background: 'transparent'
        })
    }

    #clearControls() {
        gsap.to('.btn-set.sanitize', {
            borderColor: 'transparent',
            background: 'black'
        })
    }

    #expandTv() {
        gsap.to(this.sketch.controls.target, {
            x: 0,
            y: 0,
            z: 0,
            ease: 'Expo.easeInOut'
        });
        gsap.to(this.sketch.camera.position, {
            x: 0,
            y: 0,
            z: 2,
            ease: 'Expo.easeInOut'
        });
        this.sketch.camera.updateProjectionMatrix();

        gsap.to([this.tv.position, this.tvCover.position], {
            x: 0,
            y: 0,
            z: 0,
            ease: 'Expo.easeInOut'
        });
        gsap.to([this.tv.scale, this.tvCover.scale], {
            x: 1.2,
            y: 1,
            z: 1.2,
            ease: 'Expo.easeInOut'
        });
        gsap.to([this.tv.rotation, , this.tvCover.rotation], {
            x: 0,
            y: 0,
            z: 0,
            ease: 'Expo.easeInOut'
        });
    }

    resetTv() {
        const timeline = gsap.timeline();
        let that = this;

        gsap.to([this.tv.scale, this.tvCover.scale], {
            x: 1,
            y: 1,
            z: 1,
            ease: 'Expo.easeInOut',
        });
        gsap.to([this.tv.rotation, , this.tvCover.rotation], {
            x: 0,
            y: 0.58,
            z: 0,
            ease: 'Expo.easeInOut',
        });

        timeline.to([this.tv.position, this.tvCover.position], {
            duration: 1,
            x: -1.598,
            y: -1.77,
            z: -2.65,
            ease: 'Expo.easeInOut',
        }).to(this.sketch.camera.position, {
            duration: 1,
            x: -1,
            y: 3,
            z: 14,
            ease: 'Expo.easeInOut',
            onComplete() {
                that.sketch.camera.updateProjectionMatrix();
            }
        }, '-=1');

        this.isFullscreen = false;
    }

    get isFullScreen() {
        return this.isFullscreen;
    }

    set setFullScreen(value) {
        this.isFullscreen = value;
    }

    get isPaused() {
        return this.paused;
    }
}