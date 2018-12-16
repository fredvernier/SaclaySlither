"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SaclaySlitherGame_1 = require("./SaclaySlitherGame");
const util_1 = require("./util");
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}
class Point {
    constructor(x0, y0) {
        this.x = x0;
        this.y = y0;
        this.rd = 10;
    }
}
exports.Point = Point;
class Food extends Point {
    constructor(x0, y0, type0) {
        super(x0, y0);
        this.type = type0;
    }
    static newFood(ssg0) {
        let a = getRandomInt(0, 10000) * Math.PI / 5000;
        let d = getRandomInt(0, SaclaySlitherGame_1.SaclaySlitherGame.WORLDRADIUS);
        let cc = getRandomInt(0, SaclaySlitherGame_1.SaclaySlitherGame.colors.length);
        let ss = getRandomInt(0, SaclaySlitherGame_1.SaclaySlitherGame.colors[0].length);
        let f = new Food(d * Math.cos(a), d * Math.sin(a), cc * SaclaySlitherGame_1.SaclaySlitherGame.colors[0].length + ss);
        return f;
    }
}
exports.Food = Food;
var SnakeStrategy;
(function (SnakeStrategy) {
    SnakeStrategy[SnakeStrategy["FREE"] = -1] = "FREE";
    SnakeStrategy[SnakeStrategy["RANDWALK"] = 0] = "RANDWALK";
    SnakeStrategy[SnakeStrategy["ROT"] = 1] = "ROT";
    SnakeStrategy[SnakeStrategy["FASTSTRAIGHT"] = 2] = "FASTSTRAIGHT";
    SnakeStrategy[SnakeStrategy["AVOIDCLOSEST"] = 3] = "AVOIDCLOSEST";
    SnakeStrategy[SnakeStrategy["GOCLOSESTFOOD"] = 4] = "GOCLOSESTFOOD";
    SnakeStrategy[SnakeStrategy["GOBESTFOOD"] = 5] = "GOBESTFOOD";
    SnakeStrategy[SnakeStrategy["AVOIDWORST"] = 6] = "AVOIDWORST";
    SnakeStrategy[SnakeStrategy["AVOIDBORDER"] = 7] = "AVOIDBORDER";
})(SnakeStrategy = exports.SnakeStrategy || (exports.SnakeStrategy = {}));
class Snake {
    constructor(ssg0, name0, weight0, x0, y0, type0, dirX0, dirY0, state0) {
        this.pos = [];
        this.size = 0;
        this.weight = 0;
        this.dirX = 1;
        this.dirY = 0;
        this.speed = 0;
        this.dAlph = 0;
        this.state = SnakeStrategy.GOBESTFOOD;
        this.bestFood = null;
        this.dbestFood = 0.0;
        this.closestFood = null;
        this.dclosestFood = 0.0;
        this.closestSnake = null;
        this.closestSnakeP = null;
        this.dclosestSnake = 0.0;
        this.closestBadSnake = null;
        this.closestBadSnakeP = null;
        this.dclosestBadSnake = 0.0;
        this.type = type0;
        this.ssg = ssg0;
        this.speed = SaclaySlitherGame_1.SaclaySlitherGame.PREF_SPEED;
        this.state = state0;
        this.name = name0;
        this.dirX = dirX0;
        this.dirY = dirY0;
        this.size = Math.floor(4 + Math.sqrt(weight0) / 10.0 + weight0 / 25.0);
        let p0 = new Point(x0, y0);
        this.pos.push(p0);
        for (let i = 1; i < this.size; i++) {
            let p = new Point(x0 - i * this.dirX, y0 - i * this.dirY);
            this.pos.push(p);
        }
        this.setWeight(weight0);
    }
    setWeight(weight1) {
        this.weight = weight1;
        for (let i = this.size - 1; i >= 0; i--) {
            let p = this.pos[i];
            p.rd = 10 + Math.sqrt((this.weight - 39)) / 4.0;
            if (i == 1)
                p.rd -= 2;
            if (i == 2)
                p.rd--;
        }
        let acc = 8;
        for (let i = this.size - 1; i >= 3; i--) {
            let p = this.pos[i];
            if (acc < p.rd)
                p.rd = acc;
            else
                break;
            acc += 1;
        }
    }
    translate(x0, y0) {
        let tx = x0 - this.pos[0].x;
        let ty = y0 - this.pos[0].y;
        for (let i = 0; i < this.pos.length; i++) {
            this.pos[i].x += tx;
            this.pos[i].y += ty;
        }
    }
    setLocations(locs) {
        for (let i = 0; i < this.pos.length; i++) {
            this.pos[i].x = locs[i * 2 + 0];
            this.pos[i].y = locs[i * 2 + 1];
        }
    }
    moveSnake(objx, objy) {
        let p0 = this.pos[0];
        let pn = this.pos[this.pos.length - 1];
        let snakeZoom = 0.75 + 64.0 / (128.0 + this.size);
        let objspeed = util_1.dist(p0.x, p0.y, objx, objy);
        let aobj = Math.atan2(objy - p0.y, objx - p0.x);
        let a = Math.atan2(this.dirY, this.dirX);
        let da = aobj - a;
        if (da > Math.PI)
            da -= 2 * Math.PI;
        if (da < -Math.PI)
            da += 2 * Math.PI;
        if (da > SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN * snakeZoom * snakeZoom * snakeZoom) {
            objx = p0.x + Math.max(objspeed, SaclaySlitherGame_1.SaclaySlitherGame.MIN_SPEED) * Math.cos(a + SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN * snakeZoom * snakeZoom * snakeZoom);
            objy = p0.y + Math.max(objspeed, SaclaySlitherGame_1.SaclaySlitherGame.MIN_SPEED) * Math.sin(a + SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN * snakeZoom * snakeZoom * snakeZoom);
        }
        else if (da < -SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN * snakeZoom * snakeZoom * snakeZoom) {
            objx = p0.x + Math.max(objspeed, SaclaySlitherGame_1.SaclaySlitherGame.MIN_SPEED) * Math.cos(a - SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN * snakeZoom * snakeZoom * snakeZoom);
            objy = p0.y + Math.max(objspeed, SaclaySlitherGame_1.SaclaySlitherGame.MIN_SPEED) * Math.sin(a - SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN * snakeZoom * snakeZoom * snakeZoom);
        }
        else {
            objx = Math.round(p0.x + Math.max(objspeed, SaclaySlitherGame_1.SaclaySlitherGame.MIN_SPEED) * Math.cos(aobj));
            objy = Math.round(p0.y + Math.max(objspeed, SaclaySlitherGame_1.SaclaySlitherGame.MIN_SPEED) * Math.sin(aobj));
        }
        let dd = util_1.dist(p0.x, p0.y, objx, objy);
        let tx = objx;
        let ty = objy;
        if (dd > this.speed) {
            tx = p0.x + (objx - p0.x) / dd * this.speed;
            ty = p0.y + (objy - p0.y) / dd * this.speed;
        }
        if (dd > 0) {
            this.dirX = (objx - p0.x) / dd * this.speed;
            this.dirY = (objy - p0.y) / dd * this.speed;
        }
        if (this.speed > SaclaySlitherGame_1.SaclaySlitherGame.PREF_SPEED && this.ssg.frameCount % SaclaySlitherGame_1.SaclaySlitherGame.LOOSEWEIGHTPACE == 0) {
            this.setWeight(this.weight - SaclaySlitherGame_1.SaclaySlitherGame.LOOSEWEIGHT);
            let f = new Food(pn.x, pn.y, this.type);
            f.rd = 1;
            this.ssg.foods.push(f);
            if (4 + Math.sqrt(this.weight) / 10.0 + this.weight / 25.0 < this.size) {
                this.size--;
                this.pos.splice(this.pos.length - 1, 1);
            }
            if (this.weight < 40 + SaclaySlitherGame_1.SaclaySlitherGame.LOOSEWEIGHT) {
                this.speed = SaclaySlitherGame_1.SaclaySlitherGame.PREF_SPEED;
            }
        }
        let tlen = 0;
        let alph = this.dAlph;
        for (let i = 0; i < this.pos.length; i++) {
            alph += 0.25;
            let p = this.pos[i];
            let len = util_1.dist(p.x, p.y, tx, ty);
            let ang = Math.atan2(ty - p.y, tx - p.x);
            da = ang - a;
            if (da > Math.PI)
                da -= 2 * Math.PI;
            if (da < -Math.PI)
                da += 2 * Math.PI;
            if (da > SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN) {
                da = SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN;
            }
            else if (da < -SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN) {
                da = -SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN;
            }
            if (len > tlen) {
                p.x = tx - tlen * Math.cos(a + da) + Math.sin(alph * 2.0) / 12.0 * tlen * Math.sin(a + da);
                p.y = ty - tlen * Math.sin(a + da) - Math.sin(alph * 2.0) / 12.0 * tlen * Math.cos(a + da);
            }
            tx = p.x;
            ty = p.y;
            a = ang;
            tlen = SaclaySlitherGame_1.SaclaySlitherGame.SPACEBETWEENSEGMENTS + 2 * Math.sin(alph);
        }
        this.dAlph += 0.02 * this.speed;
    }
    testCollision() {
        let p0 = this.pos[0];
        let pn = this.pos[this.pos.length - 1];
        this.closestSnake = null;
        this.closestSnakeP = null;
        this.closestBadSnake = null;
        this.closestBadSnakeP = null;
        this.dclosestBadSnake = SaclaySlitherGame_1.SaclaySlitherGame.WORLDRADIUS;
        this.dclosestSnake = SaclaySlitherGame_1.SaclaySlitherGame.WORLDRADIUS;
        if (util_1.dist(0, 0, p0.x, p0.y) > SaclaySlitherGame_1.SaclaySlitherGame.WORLDRADIUS) {
            return true;
        }
        for (let i = 0; i < this.ssg.snakes.length; i++) {
            let other = this.ssg.snakes[i];
            if (other != null && other != this) {
                for (let k = 0; k < other.pos.length; k++) {
                    let p = other.pos[k];
                    let dd = util_1.dist(p.x, p.y, p0.x, p0.y);
                    if (dd < p0.rd + p.rd) {
                        return true;
                    }
                    else {
                        if (this.closestSnake == null || dd < this.dclosestSnake) {
                            this.closestSnake = other;
                            this.closestSnakeP = p;
                            this.dclosestSnake = dd;
                        }
                        let a1 = Math.atan2(this.dirY, this.dirX);
                        let a2 = Math.atan2(p.y - p0.y, p.x - p0.x);
                        let da = Math.abs(a1 - a2);
                        if ((this.closestBadSnake == null || dd * Math.sin(da / 2 + 1) < this.dclosestBadSnake)) {
                            this.closestBadSnake = other;
                            this.closestBadSnakeP = p;
                            this.dclosestBadSnake = dd * Math.sin(da / 2 + 1);
                        }
                    }
                }
            }
        }
        let minR = this.speed * Math.sin(Math.PI / 2 - SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN) / Math.sin(Math.PI - 2 * SaclaySlitherGame_1.SaclaySlitherGame.MAX_TURN);
        let n = util_1.dist(0, 0, this.dirX, this.dirY);
        let lx = p0.x + this.dirY * minR / n;
        let ly = p0.y - this.dirX * minR / n;
        let rx = p0.x - this.dirY * minR / n;
        let ry = p0.y + this.dirX * minR / n;
        this.closestFood = null;
        this.bestFood = null;
        this.dclosestFood = SaclaySlitherGame_1.SaclaySlitherGame.WORLDRADIUS;
        for (let k = this.ssg.foods.length - 1; k >= 0; k--) {
            let f = this.ssg.foods[k];
            let dd = util_1.dist(p0.x, p0.y, f.x, f.y);
            let a = Math.atan2(f.y - p0.y, f.x - p0.x);
            let dl = util_1.dist(lx, ly, f.x, f.y);
            let dr = util_1.dist(rx, ry, f.x, f.y);
            if (dd < p0.rd + f.rd) {
                this.setWeight(this.weight + Math.round(f.rd));
                if (4 + Math.sqrt(this.weight) / 10.0 + this.weight / 25.0 > this.size) {
                    this.size++;
                    let p = new Point(pn.x, pn.y);
                    p.rd = 8;
                    this.pos.push(p);
                }
                this.ssg.foods.splice(k, 1);
            }
            else {
                if ((this.closestFood == null || dd < this.dclosestFood) && (dl > minR && dr > minR)) {
                    this.closestFood = f;
                    this.dclosestFood = dd;
                }
                if ((this.bestFood == null || dd / f.rd < this.dbestFood) && (dl > minR && dr > minR)) {
                    this.bestFood = f;
                    this.dbestFood = dd / f.rd;
                }
            }
        }
        return false;
    }
}
exports.Snake = Snake;
//# sourceMappingURL=Snake.js.map