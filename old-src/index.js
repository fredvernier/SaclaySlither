"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const PIXI = __importStar(require("pixi.js"));
require('./PixiSnake');
const Snake_1 = require("./Snake");
const PixiSnake_1 = require("./PixiSnake");
const SaclaySlitherGame_1 = require("./SaclaySlitherGame");
const util_1 = require("./util");
class PixiSaclaySlitherGame extends SaclaySlitherGame_1.SaclaySlitherGame {
    constructor(name0) {
        super();
        this.socket = null;
        this.socketReq = 0;
        this.ctrlSnake = null;
        this.run = false;
        this.panX = -window.innerWidth / 2;
        this.panY = -window.innerHeight / 2;
        let url = window.location.href.toString();
        if (url.toLowerCase().indexOf("debug") >= 0) {
            console.log("... run debug");
            this.app = new PIXI.Application(window.innerWidth, window.innerHeight - 20, { backgroundColor: 0x001000, autoStart: false });
            document.body.appendChild(this.app.view);
            document.body.appendChild(document.createElement('br'));
            window.addEventListener("resize", (e) => {
                this.app.renderer.resize(window.innerWidth, window.innerHeight - 20);
            });
            let but0 = document.createElement('button');
            but0.setAttribute("type", "button");
            but0.textContent = "►";
            but0.addEventListener("click", (e) => {
                if (this.run) {
                    this.app.stop();
                    but0.textContent = "►";
                    this.socket.send("pause");
                }
                else {
                    this.app.start();
                    but0.textContent = "||";
                    this.socket.send("run");
                }
                this.run = !this.run;
            });
            let but1 = document.createElement('button');
            but1.setAttribute("type", "button");
            but1.textContent = "render";
            but1.addEventListener("click", (e) => {
                this.app.render();
            });
            let but2 = document.createElement('button');
            but2.setAttribute("type", "button");
            but2.textContent = "Talk";
            but2.addEventListener("click", (e) => {
                this.socket.send("Hello, I am alive");
            });
            document.body.appendChild(but0);
            document.body.appendChild(but1);
            document.body.appendChild(but2);
        }
        else {
            console.log("... run normal!");
            this.app = new PIXI.Application(window.innerWidth, window.innerHeight, { backgroundColor: 0x001000 });
            document.body.appendChild(this.app.view);
            document.body.appendChild(document.createElement('br'));
            window.addEventListener("resize", (e) => {
                this.app.renderer.resize(window.innerWidth, window.innerHeight);
            });
        }
        this.initTextures();
        this.initRenderingLoop();
        this.foodLayer = new PIXI.Container();
        this.app.stage.addChild(this.foodLayer);
        this.app.stage.interactive = true;
        this.app.stage.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);
        this.initInteraction();
        this.initNetwork(name0);
    }
    initInteraction() {
        this.app.stage.on('pointerdown', () => {
            console.log('pointerdown');
        });
        this.app.stage.on('mousedown', () => {
            console.log('mousedown');
        });
        this.app.stage.on('mousemove', (e) => {
            this.targetX = Math.floor(e.data.global.x + this.panX);
            this.targetY = Math.floor(e.data.global.y + this.panY);
        });
        let q = util_1.keyboard(32);
        q.press = () => {
            if (this.ctrlSnake)
                this.ctrlSnake.speed = SaclaySlitherGame_1.SaclaySlitherGame.MAX_SPEED;
        };
        q.release = () => {
            if (this.ctrlSnake)
                this.ctrlSnake.speed = SaclaySlitherGame_1.SaclaySlitherGame.PREF_SPEED;
        };
    }
    initNetwork(name0) {
        var l = window.location;
        console.log("talking back to the server ..." + l.host);
        this.socket = new WebSocket('ws://192.168.1.17:9090/');
        this.socket.binaryType = 'arraybuffer';
        this.socket.onopen = () => {
            this.socket.send("Hello, I am " + name0);
        };
        this.socket.onmessage = (msg) => {
            if (typeof msg.data == "string") {
                if (msg.data.startsWith("Hello back ")) {
                    this.sendSnakesRequestToServer();
                }
                else if (msg.data.startsWith("MOVE ")) {
                    let infos = msg.data.split(" ");
                    this.sendSnakesRequestToServer();
                }
            }
            else if (this.socketReq == 1) {
                let buffer = new Float32Array(msg.data);
                let nbsnakes = buffer[0];
                for (let i = 0; i < nbsnakes; i++) {
                    let size = buffer[1 + i * 7 + 0];
                    let weight = buffer[1 + i * 7 + 1];
                    let dirX = buffer[1 + i * 7 + 2];
                    let dirY = buffer[1 + i * 7 + 3];
                    let type = buffer[1 + i * 7 + 4];
                    let x0 = buffer[1 + i * 7 + 5];
                    let y0 = buffer[1 + i * 7 + 6];
                    let name;
                    if (i == nbsnakes - 1)
                        name = name0;
                    else
                        name = this.names[i % this.names.length];
                    this.snakes[i] = new PixiSnake_1.PixiSnake(this, name, weight, x0, y0, type, dirX, dirY, Snake_1.SnakeStrategy.GOBESTFOOD);
                    this.app.stage.addChild(this.snakes[i].container);
                    this.snakes.push(this.snakes[i]);
                }
                let sumsize = 0;
                for (let i = 0; i < nbsnakes; i++) {
                    let subarr = buffer.subarray(1 + nbsnakes * 7 + sumsize, 1 + nbsnakes * 7 + sumsize + this.snakes[i].size * 2);
                    this.snakes[i].setLocations(subarr);
                    sumsize += this.snakes[i].size * 2;
                }
                this.ctrlSnake = this.snakes[this.snakes.length - 1];
                this.ctrlSnake.name = name0;
                this.socketReq = 0;
            }
            else if (this.socketReq == 3) {
                let buffer = new Float32Array(msg.data);
                for (var i = 2; i < buffer.length; i += 6) {
                    let k = Math.floor((i - 2) / 6);
                    this.snakes[k].moveSnake(buffer[i + 0], buffer[i + 1]);
                    this.snakes[k].translate(buffer[i + 2], buffer[i + 3]);
                    if (k == this.snakes.length - 1)
                        console.log(k + "=" + this.snakes[k].name + " move toward " + buffer[i].toFixed(2) + "," + buffer[i + 1].toFixed(2) + " => server=" +
                            buffer[i + 2].toFixed(2) + "," + buffer[i + 3].toFixed(2) + " % client=" + this.snakes[k].pos[0].x.toFixed(2) + "," + this.snakes[k].pos[0].y.toFixed(2) + " it was at " + buffer[i + 4].toFixed(2) + "," + buffer[i + 5].toFixed(2));
                }
                this.socketReq = 0;
            }
        };
    }
    initTextures() {
        let R = SaclaySlitherGame_1.SaclaySlitherGame.IMG_SIZE;
        let img0 = createImage(R, R);
        let img1 = createImage(R, R);
        let img4 = createImage(R, R);
        let ctx0 = img0.getContext("2d");
        let ctx1 = img1.getContext("2d");
        let ctx4 = img4.getContext("2d");
        let imgRadar = createImage(128, 128);
        let imData0 = ctx0.createImageData(R, R);
        let imData1 = ctx1.createImageData(R, R);
        let imData4 = ctx4.createImageData(R, R);
        for (let j = 0; j < R; j++) {
            for (let i = 0; i < R; i++) {
                let d0 = 0.7 * util_1.dist(i, j, R / 2, R / 2) + 0.22 * Math.abs(i - R / 2) + 0.4 * Math.abs(j - R / 2);
                let d1 = util_1.dist(i, j, R / 2, R / 2);
                let iii = Math.round(R / 2 + (i - R / 2) * (1 + 2 * Math.sqrt(d1 / R / 2)) / 3);
                let jjj = Math.round(R / 2 + (j - R / 2) * (1 + 2 * Math.sqrt(d1 / R / 2)) / 3);
                let di = (Math.floor(jjj / 16) % 2) * 8;
                let ii = iii + di;
                let d3 = util_1.dist(iii, jjj, iii - ii % 16 + 8, jjj - jjj % 16 + 8);
                let dl = util_1.dist(iii, jjj, R / 3, R / 3);
                if (d0 < R / 2 - 1) {
                    imData0.data[i * 4 + j * R * 4 + 0] = 255 - dl * 255 / R - d3 * 4;
                    imData0.data[i * 4 + j * R * 4 + 1] = 255 - dl * 255 / R - d3 * 4;
                    imData0.data[i * 4 + j * R * 4 + 2] = 255 - dl * 255 / R - d3 * 4;
                    imData0.data[i * 4 + j * R * 4 + 3] = Math.min(255, i * 8);
                }
                if (d1 < R / 2) {
                    imData1.data[i * 4 + j * R * 4 + 0] = 255 - dl * 255 / R - d3 * 4;
                    imData1.data[i * 4 + j * R * 4 + 1] = 255 - dl * 255 / R - d3 * 4;
                    imData1.data[i * 4 + j * R * 4 + 2] = 255 - dl * 255 / R - d3 * 4;
                    imData1.data[i * 4 + j * R * 4 + 3] = Math.max(0, Math.min(255, (R / 2 - d1) * (255 * R / 4) / R));
                }
            }
        }
        for (let j = 0; j < R; j++) {
            for (let i = 0; i < R; i++) {
                let d0 = 0.6 * util_1.dist(i, j, R / 2, R / 2) + 0.6 * Math.min(Math.abs(i - R / 2), Math.abs(j - R / 2));
                let d1 = util_1.dist(i, j, R / 3, R / 3);
                if (d0 < R / 3) {
                    imData4.data[i * 4 + j * R * 4 + 0] = 255 - d1 * 255 / R;
                    imData4.data[i * 4 + j * R * 4 + 1] = 255 - d1 * 255 / R;
                    imData4.data[i * 4 + j * R * 4 + 2] = 255 - d1 * 255 / R;
                    imData4.data[i * 4 + j * R * 4 + 3] = 255;
                }
            }
        }
        ctx0.putImageData(imData0, 0, 0);
        ctx1.putImageData(imData1, 0, 0);
        ctx4.putImageData(imData4, 0, 0);
        let foods = [];
        PixiSaclaySlitherGame.texfood = PIXI.Texture.fromCanvas(img4);
        PixiSaclaySlitherGame.texhead = PIXI.Texture.fromCanvas(img0);
        PixiSaclaySlitherGame.texbody = PIXI.Texture.fromCanvas(img1);
        this.app.ticker.speed = 0.2;
    }
    sendUpdateToServer() {
        if (this.socketReq != 0)
            console.log("PROBLEM, WANT TO ASK SOMETHING TO THE SERVER BUT PREVIOUS REQUEST ISN'T FINISH");
        if (!this.ctrlSnake) {
            console.log("PROBLEM, WANT UPDATE WHILE WE ARE DEAD");
        }
        else {
            this.socketReq = 3;
            var floatArray = new Float32Array(6);
            console.log(this.ctrlSnake.name + " " + this.ctrlSnake.pos[0].x + "," + this.ctrlSnake.pos[0].y + " moving toward " + this.targetX.toFixed(2) + "," + this.targetY.toFixed(2));
            floatArray[0] = this.targetX;
            floatArray[1] = this.targetY;
            floatArray[2] = this.ctrlSnake.speed;
            floatArray[3] = this.panX;
            floatArray[4] = this.panY;
            floatArray[5] = Math.max(window.innerWidth, window.innerHeight);
            this.socket.send(floatArray.buffer);
        }
    }
    sendSnakesRequestToServer() {
        console.log("sendSnakesRequestToServer");
        if (this.socketReq != 0)
            console.log("PROBLEM, WANT TO ASK SOMETHING TO THE SERVER BUT PREVIOUS REQUEST ISN'T FINISH");
        this.socketReq = 1;
        var floatArray = new Float32Array(4);
        console.log("moving toward " + this.targetX + "," + this.targetY);
        floatArray[0] = this.panX;
        floatArray[1] = this.panY;
        floatArray[2] = window.innerWidth;
        floatArray[3] = window.innerHeight;
        this.socket.send(floatArray.buffer);
    }
    initRenderingLoop() {
        this.app.ticker.add((delta) => {
            this.sendUpdateToServer();
            if (this.ctrlSnake) {
                let p = this.ctrlSnake.pos[0];
                let px = (p.x - this.panX - (window.innerWidth / 2)) * this.globZoom + (window.innerWidth / 2);
                let py = (p.y - this.panY - (window.innerHeight / 2)) * this.globZoom + (window.innerHeight / 2);
                let oldPanX = this.panX;
                let oldPanY = this.panY;
                if (px > window.innerWidth - SaclaySlitherGame_1.SaclaySlitherGame.BORDER_SIZE)
                    this.panX = -((((window.innerWidth - SaclaySlitherGame_1.SaclaySlitherGame.BORDER_SIZE) - (window.innerWidth / 2)) / this.globZoom) + (window.innerWidth / 2) - p.x);
                else if (px < SaclaySlitherGame_1.SaclaySlitherGame.BORDER_SIZE)
                    this.panX = -((((SaclaySlitherGame_1.SaclaySlitherGame.BORDER_SIZE) - (window.innerWidth / 2)) / this.globZoom) + (window.innerWidth / 2) - p.x);
                if (py > window.innerHeight - SaclaySlitherGame_1.SaclaySlitherGame.BORDER_SIZE)
                    this.panY = -((((window.innerHeight - SaclaySlitherGame_1.SaclaySlitherGame.BORDER_SIZE) - (window.innerHeight / 2)) / this.globZoom) + (window.innerHeight / 2) - p.y);
                else if (py < SaclaySlitherGame_1.SaclaySlitherGame.BORDER_SIZE)
                    this.panY = -((((SaclaySlitherGame_1.SaclaySlitherGame.BORDER_SIZE) - (window.innerHeight / 2)) / this.globZoom) + (window.innerHeight / 2) - p.y);
                this.targetX += Math.floor(this.panX - oldPanX);
                this.targetY += Math.floor(this.panY - oldPanY);
                if (this.automaticZoom)
                    this.globZoom = 0.75 + 64.0 / (128.0 + this.snakes[0].size);
                this.foodLayer.x = -this.panX;
                this.foodLayer.y = -this.panY;
                for (let k in this.snakes)
                    if (this.snakes[k] != null)
                        this.snakes[k].drawSnake(1);
            }
        });
    }
}
exports.PixiSaclaySlitherGame = PixiSaclaySlitherGame;
function createImage(w, h) {
    let can = document.createElement('canvas');
    can.width = w;
    can.height = h;
    return can;
}
window.onload = () => {
    let inp = document.createElement('input');
    inp.setAttribute("type", "text");
    inp.setAttribute("id", "snakename");
    inp.addEventListener('change', (e) => {
        document.body.removeChild(inp);
        let ssg0 = new PixiSaclaySlitherGame(inp.value);
    });
    document.body.appendChild(inp);
};
//# sourceMappingURL=index.js.map