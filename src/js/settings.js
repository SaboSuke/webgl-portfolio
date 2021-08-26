/**
 * @desc Hanlders the gui controls settings
 * 
 * @param {Sketch} sketch
 * @param {Object} options
 * @constructor
 */
export default class Settings {

    opts = {};
    sketch = null;
    gui = null;

    constructor(sketch, options = {}) {
        this.INIT(sketch, options);

        this.opts.camera ? this.camera() : 0;
        this.opts.lights ? this.lights() : 0;
        this.opts.lightHelper ? this.lightHelper() : 0;
        this.opts.isometricRoom ? this.isometricRoom() : 0;
        this.opts.planeHolder ? this.planeHolder() : 0;
        this.opts.room ? this.room() : 0;
        this.opts.table ? this.table() : 0;
        this.opts.rack ? this.rack() : 0;
        this.opts.planesSettings ? this.planes() : 0;
        this.opts.tvSettings ? this.tv() : 0;
    }

    INIT(sketch, options) {
        this.opts = {
            isometricRoom: options.isometricRoom || false,
            camera: options.camera || false,
            lights: options.lights || false,
            planeHolder: options.planeHolder || false,
            lightHelper: options.lightHelper || false,
            tvSettings: options.tvSettings || false,
            rack: options.rack || false,
            table: options.table || false,
            room: options.room || false,
            planesSettings: options.planesSettings || false,
        }
        this.sketch = sketch;
        this.gui = new dat.GUI();

        let that = this;
        this.settings = {
            cameraPos: that.sketch.camera.position,
            // light1: that.sketch.light1.position,
            planeHolderPos: that.opts.planeHolder ? that.sketch.planeHolder.position : null,
            isometricPos: that.opts.isometricRoom ? that.sketch.isometric_room.position : null,
            isometricDeg: that.opts.isometricRoom ? that.sketch.isometric_room.rotation : null,

            roomPos: that.opts.room ? that.sketch.room.position : null,
            tablePos: that.opts.table ? that.sketch.table.position : null,
            rackPos: that.opts.rack ? that.sketch.rack.position : null,
            planePos: that.opts.planesSettings ? [
                that.sketch.plane1.position,
                that.sketch.plane2.position,
                that.sketch.plane3.position,
                that.sketch.plane4.position,
            ] : null,
            planeDeg: that.opts.planesSettings ? [
                that.sketch.plane1.rotation,
                that.sketch.plane2.rotation,
                that.sketch.plane3.rotation,
                that.sketch.plane4.rotation,
            ] : null,
            tvScreen: that.opts.tvSettings ? [
                that.sketch.plane5.position,
                that.sketch.plane5.rotation,
            ] : null,
        };
    }

    planeHolder() {
        const plane = this.gui.addFolder('planeHolder position');
        plane.add(this.settings.planeHolderPos, 'x');
        plane.add(this.settings.planeHolderPos, 'y');
        plane.add(this.settings.planeHolderPos, 'z');
    }

    tv() {
        // screen
        const plane5Pos = this.gui.addFolder('tv screen Position');
        plane5Pos.add(this.settings.tvScreen[0], 'x');
        plane5Pos.add(this.settings.tvScreen[0], 'y');
        plane5Pos.add(this.settings.tvScreen[0], 'z');

        const plane5Deg = this.gui.addFolder('tv screen Rotation');
        plane5Deg.add(this.settings.tvScreen[1], 'x');
        plane5Deg.add(this.settings.tvScreen[1], 'y');
        plane5Deg.add(this.settings.tvScreen[1], 'z');
    }

    rack() {
        const rack = this.gui.addFolder('rack position');
        rack.add(this.settings.rackPos, 'x');
        rack.add(this.settings.rackPos, 'y');
        rack.add(this.settings.rackPos, 'z');
    }

    table() {
        const table = this.gui.addFolder('table position');
        table.add(this.settings.tablePos, 'x');
        table.add(this.settings.tablePos, 'y');
        table.add(this.settings.tablePos, 'z');
    }

    room() {
        const room = this.gui.addFolder('room position');
        room.add(this.settings.roomPos, 'x');
        room.add(this.settings.roomPos, 'y');
        room.add(this.settings.roomPos, 'z');
    }

    isometricRoom() {
        const isometricPos = this.gui.addFolder('isometric-room position');
        isometricPos.add(this.settings.isometricPos, 'x');
        isometricPos.add(this.settings.isometricPos, 'y');
        isometricPos.add(this.settings.isometricPos, 'z');

        const isometricDeg = this.gui.addFolder('isometric-room rotation');
        isometricDeg.add(this.settings.isometricDeg, 'x');
        isometricDeg.add(this.settings.isometricDeg, 'y');
        isometricDeg.add(this.settings.isometricDeg, 'z');
    }

    lights() {

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

        // const cameraHelper = new THREE.CameraHelper(this.sketch.camera);
        // this.sketch.scene.add(cameraHelper);
    }

    planes() {
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
    }
}