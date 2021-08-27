/**
 * @desc Hanlders the gui controls settings
 * 
 * @param {Sketch} sketch
 * @param {Object} options
 * @constructor
 */
export default class Settings {

    opts = { };
    sketch = null;
    gui = null;

    constructor(sketch, options = { }) {
        this.INIT(sketch, options);

        this.opts.camera ? this.camera() : 0;
        this.opts.lights ? this.lights() : 0;
        this.opts.lightHelper ? this.lightHelper() : 0;
        this.opts.livingRoom ? this.livingRoom() : 0;
        this.opts.bedRoom ? this.bedRoom() : 0;
        this.opts.planeHolder ? this.planeHolder() : 0;
        this.opts.tvSettings ? this.tv() : 0;
        this.opts.socials ? this.socials() : 0;
        this.opts.cat ? this.cat() : 0;
    }

    INIT(sketch, options) {
        this.opts = {
            livingRoom: options.livingRoom || false,
            bedRoom: options.bedRoom || false,
            camera: options.camera || false,
            lights: options.lights || false,
            planeHolder: options.planeHolder || false,
            lightHelper: options.lightHelper || false,
            tvSettings: options.tvSettings || false,
            socials: options.socials || false,
            cat: options.cat || false,
        }
        this.sketch = sketch;
        this.gui = new dat.GUI();

        let that = this;
        this.settings = {
            cameraPos: that.sketch.camera.position,
            lightBalls: that.opts.lights ? that.sketch.lightBalls : null,
            planeHolderPos: that.opts.planeHolder ? that.sketch.planeHolder.position : null,
            livingRoomPos: that.opts.livingRoom ? that.sketch.livingRoom.position : null,
            livingRoomDeg: that.opts.livingRoom ? that.sketch.livingRoom.rotation : null,
            bedRoom: that.opts.bedRoom ? that.sketch.bedRoom : null,
            tvScreen: that.opts.tvSettings ? [
                that.sketch.tvScreen.position,
                that.sketch.tvScreen.rotation,
            ] : null,
            socials: that.opts.socials ? that.sketch.socials : null,
            cat: that.opts.cat ? that.sketch.cat : null,
        };
    }

    socials() {
        this.settings.socials.forEach((item, index) => {
            const pos = this.gui.addFolder('social ' + (index + 1) + ' position');
            pos.add(item.circle.position, 'x');
            pos.add(item.circle.position, 'y');
            pos.add(item.circle.position, 'z');

            const deg = this.gui.addFolder('social ' + (index + 1) + ' rotation');
            deg.add(item.circle.rotation, 'x');
            deg.add(item.circle.rotation, 'y');
            deg.add(item.circle.rotation, 'z');
        })
    }

    planeHolder() {
        const plane = this.gui.addFolder('planeHolder position');
        plane.add(this.settings.planeHolderPos, 'x');
        plane.add(this.settings.planeHolderPos, 'y');
        plane.add(this.settings.planeHolderPos, 'z');
    }

    tv() {
        // screen
        const tvScreenPos = this.gui.addFolder('tv screen Position');
        tvScreenPos.add(this.settings.tvScreen[0], 'x');
        tvScreenPos.add(this.settings.tvScreen[0], 'y');
        tvScreenPos.add(this.settings.tvScreen[0], 'z');

        const tvScreenDeg = this.gui.addFolder('tv screen Rotation');
        tvScreenDeg.add(this.settings.tvScreen[1], 'x');
        tvScreenDeg.add(this.settings.tvScreen[1], 'y');
        tvScreenDeg.add(this.settings.tvScreen[1], 'z');
    }

    bedRoom() {
        const bedRoomPos = this.gui.addFolder('bedRoom position');
        bedRoomPos.add(this.settings.bedRoom.position, 'x');
        bedRoomPos.add(this.settings.bedRoom.position, 'y');
        bedRoomPos.add(this.settings.bedRoom.position, 'z');

        const bedRoomDeg = this.gui.addFolder('bedRoom rotation');
        bedRoomDeg.add(this.settings.bedRoom.rotation, 'x');
        bedRoomDeg.add(this.settings.bedRoom.rotation, 'y');
        bedRoomDeg.add(this.settings.bedRoom.rotation, 'z');
    }

    livingRoom() {
        const livingRoomPos = this.gui.addFolder('isometric-room position');
        livingRoomPos.add(this.settings.livingRoomPos, 'x');
        livingRoomPos.add(this.settings.livingRoomPos, 'y');
        livingRoomPos.add(this.settings.livingRoomPos, 'z');

        const livingRoomDeg = this.gui.addFolder('isometric-room rotation');
        livingRoomDeg.add(this.settings.livingRoomDeg, 'x');
        livingRoomDeg.add(this.settings.livingRoomDeg, 'y');
        livingRoomDeg.add(this.settings.livingRoomDeg, 'z');
    }

    cat() {
        const catPos = this.gui.addFolder('cat position');
        catPos.add(this.settings.cat.position, 'x');
        catPos.add(this.settings.cat.position, 'y');
        catPos.add(this.settings.cat.position, 'z');

        const catDeg = this.gui.addFolder('cat rotation');
        catDeg.add(this.settings.cat.rotation, 'x');
        catDeg.add(this.settings.cat.rotation, 'y');
        catDeg.add(this.settings.cat.rotation, 'z');
    }

    lights() {
        this.settings.lightBalls.forEach((item, index) => {
            const light = this.gui.addFolder(`lightball ${index + 1} position`);
            light.add(item.lightBall.position, 'x');
            light.add(item.lightBall.position, 'y');
            light.add(item.lightBall.position, 'z');
        })
    }

    lightHelper() {
        this.lightHelper = new THREE.PointLightHelper(this.sketch.light1, 1);
        this.sketch.scene.add(this.lightHelper);
    }

    camera() {
        const cameraPos = this.gui.addFolder('camera position');
        cameraPos.add(this.settings.cameraPos, 'x');
        cameraPos.add(this.settings.cameraPos, 'y');
        cameraPos.add(this.settings.cameraPos, 'z');

        const cameraContPos = this.gui.addFolder('camera control target');
        cameraContPos.add(this.sketch.controls.target, 'x');
        cameraContPos.add(this.sketch.controls.target, 'y');
        cameraContPos.add(this.sketch.controls.target, 'z');


        // const cameraHelper = new THREE.CameraHelper(this.sketch.camera);
        // this.sketch.scene.add(cameraHelper);
    }
}