"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Snake_1 = require("./Snake");
const NetworkSnake_1 = require("./NetworkSnake");
const SaclaySlitherGame_1 = require("./SaclaySlitherGame");
const WebSocket = __importStar(require("ws"));
console.log("TS server launching ... ");
let wsServer = new WebSocket.Server({ port: 9090 });
let ctrlSnake = {};
let ssg0 = new SaclaySlitherGame_1.SaclaySlitherGame();
for (let k = 0; k < SaclaySlitherGame_1.SaclaySlitherGame.NBINITIALFOODS; k++) {
    let f = Snake_1.Food.newFood(ssg0);
    ssg0.foods.push(f);
}
for (let k = 0; k < SaclaySlitherGame_1.SaclaySlitherGame.NBINITIALSNAKES; k++) {
    ssg0.snakes[k] = new Snake_1.Snake(ssg0, ssg0.names[k % ssg0.names.length], Math.max(40, 400 + 50 * (k - 1)), Math.floor(400 * Math.cos(k * 2 * Math.PI / SaclaySlitherGame_1.SaclaySlitherGame.NBINITIALSNAKES)), Math.floor(400 * Math.sin(k * 2 * Math.PI / SaclaySlitherGame_1.SaclaySlitherGame.NBINITIALSNAKES)), k % SaclaySlitherGame_1.SaclaySlitherGame.colors.length, SaclaySlitherGame_1.SaclaySlitherGame.SPACEBETWEENSEGMENTS * Math.cos((k + 0) * 2 * Math.PI / SaclaySlitherGame_1.SaclaySlitherGame.NBINITIALSNAKES), SaclaySlitherGame_1.SaclaySlitherGame.SPACEBETWEENSEGMENTS * Math.sin((k + 0) * 2 * Math.PI / SaclaySlitherGame_1.SaclaySlitherGame.NBINITIALSNAKES), Snake_1.SnakeStrategy.GOBESTFOOD);
}
let serverTime = 0;
function updateSnakes() {
    serverTime++;
    for (let k in ssg0.snakes) {
        if (ssg0.snakes[k] instanceof NetworkSnake_1.NetworkSnake) {
            let snake = ssg0.snakes[k];
            snake.lastDirX = ssg0.snakes[k].dirX;
            snake.lastDirY = ssg0.snakes[k].dirY;
            snake.moveSnake(snake.dirX, snake.dirY);
            console.log("  " + snake.name + "@" + snake.pos[0].x.toFixed(2) + "," + snake.pos[0].y.toFixed(2) + " MOVED TOWARD " + snake.lastDirX.toFixed(2) + "," + snake.lastDirY.toFixed(2) + " AND NOW WILL MOVE TOWARD " + ssg0.snakes[k].dirX + "," + ssg0.snakes[k].dirY);
            snake.ws.send("MOVE " + snake.pos[0].x + " " + snake.pos[0].y + " " + snake.lastDirX + " " + snake.lastDirY);
        }
    }
}
let timer = setInterval(updateSnakes, 20);
wsServer.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress;
    console.log((new Date()) + " Connection accepted " + ip);
    ws.on('message', function (message, type) {
        if (typeof message === 'string') {
            if (message.startsWith("Hello, I am ")) {
                let name = message.substring(12);
                if (ctrlSnake[ip]) {
                    ssg0.snakes.splice(ssg0.snakes.indexOf(ctrlSnake[ip]), 1);
                    delete ctrlSnake[ip];
                    console.log(ssg0.snakes.length + "+1 snake renewed: " + name);
                    ws.send("Hello back " + name + ", I am the server: " + ssg0.snakes.length + "+1 snake renewed");
                }
                else {
                    console.log(ssg0.snakes.length + "+1 snake: " + name);
                    ws.send("Hello back " + name + ", I am the server: " + ssg0.snakes.length + "+1 snake");
                }
                ctrlSnake[ip] = new NetworkSnake_1.NetworkSnake(ssg0, name, 500, 0, 0, 0, 10, 0, Snake_1.SnakeStrategy.GOBESTFOOD, ws);
                ssg0.snakes.push(ctrlSnake[ip]);
            }
            else if (message.startsWith("pause")) {
                clearInterval(timer);
            }
            else if (message.startsWith("play")) {
                timer = setInterval(updateSnakes, 20);
            }
        }
        else if (typeof message === 'object') {
            let data = message;
            if (data.length == 6 * 4) {
                let arr = new Float32Array(2 + ssg0.snakes.length * 6);
                let tx = data.readFloatLE(0);
                let ty = data.readFloatLE(4);
                ctrlSnake[ip].speed = data.readFloatLE(8);
                let minx = data.readFloatLE(12);
                let miny = data.readFloatLE(16);
                let wh = data.readFloatLE(20);
                let px = 0;
                let py = 0;
                ctrlSnake[ip].dirX = tx;
                ctrlSnake[ip].dirY = ty;
                let p0x = ctrlSnake[ip].pos[0].x;
                let p0y = ctrlSnake[ip].pos[0].y;
                console.log("NET REC:" + ctrlSnake[ip].name + "@" + ctrlSnake[ip].pos[0].x.toFixed(2) + "," + ctrlSnake[ip].pos[0].y.toFixed(2) + " MOVING TOWARD " + tx.toFixed(2) + "," + ty.toFixed(2));
                ctrlSnake[ip].dirX = tx;
                ctrlSnake[ip].dirY = ty;
                arr[0] = serverTime;
                arr[1] = ssg0.snakes.length;
                for (let k = 0; k < ssg0.snakes.length; k++) {
                    arr[2 + k * 6 + 0] = ssg0.snakes[k].dirX;
                    arr[2 + k * 6 + 1] = ssg0.snakes[k].dirY;
                    arr[2 + k * 6 + 2] = ssg0.snakes[k].pos[0].x;
                    arr[2 + k * 6 + 3] = ssg0.snakes[k].pos[0].y;
                    arr[2 + k * 6 + 4] = p0x;
                    arr[2 + k * 6 + 5] = p0y;
                }
                ws.send(arr);
            }
            else if (data.length == 4 * 4) {
                let sumSize = 0;
                for (let k = 0; k < ssg0.snakes.length; k++)
                    sumSize += ssg0.snakes[k].size;
                let arr = new Float32Array(1 + ssg0.snakes.length * 7 + sumSize * 2);
                let x = data.readFloatLE(0);
                let y = data.readFloatLE(4);
                let w = data.readFloatLE(8);
                let h = data.readFloatLE(12);
                arr[0] = ssg0.snakes.length;
                for (let k = 0; k < ssg0.snakes.length; k++) {
                    arr[1 + 7 * k + 0] = ssg0.snakes[k].size;
                    arr[1 + 7 * k + 1] = ssg0.snakes[k].weight;
                    arr[1 + 7 * k + 2] = ssg0.snakes[k].dirX;
                    arr[1 + 7 * k + 3] = ssg0.snakes[k].dirY;
                    arr[1 + 7 * k + 4] = ssg0.snakes[k].type;
                    arr[1 + 7 * k + 5] = ssg0.snakes[k].pos[0].x;
                    arr[1 + 7 * k + 6] = ssg0.snakes[k].pos[0].y;
                }
                let sizepos = 0;
                for (let k = 0; k < ssg0.snakes.length; k++) {
                    for (let l = 0; l < ssg0.snakes[k].size; l++) {
                        arr[1 + 7 * ssg0.snakes.length + sizepos + 0] = ssg0.snakes[k].pos[l].x;
                        arr[1 + 7 * ssg0.snakes.length + sizepos + 1] = ssg0.snakes[k].pos[l].y;
                        sizepos += 2;
                    }
                }
                ws.send(arr);
            }
        }
        else {
            console.log("Unknown message type: " + type);
        }
    });
    wsServer.on('close', function (reasonCode, description) {
        console.log((new Date()) + " Peer " + wsServer.address + " disconnected.");
    });
});
//# sourceMappingURL=server.js.map