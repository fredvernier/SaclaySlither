"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Snake_1 = require("./Snake");
class NetworkSnake extends Snake_1.Snake {
    constructor(ssg0, name0, weight0, x0, y0, type0, dirX0, dirY0, state0, ws0) {
        super(ssg0, name0, weight0, x0, y0, type0, dirX0, dirY0, state0);
        this.ws = ws0;
        this.lastDirX = dirX0;
        this.lastDirY = dirY0;
    }
}
exports.NetworkSnake = NetworkSnake;
//# sourceMappingURL=NetworkSnake.js.map