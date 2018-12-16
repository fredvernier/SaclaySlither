"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const SaclaySlitherGame_1 = require("./SaclaySlitherGame");
const Snake_1 = require("./Snake");
function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * Math.floor(max - min));
}
class PixiFood extends Snake_1.Food {
    constructor(x0, y0, type0) {
        super(x0, y0, type0);
        this.sprite = new PIXI.Sprite(index_1.PixiSaclaySlitherGame.texfood);
    }
    static newFood(ssg0) {
        let a = getRandomInt(0, 10000) * Math.PI / 5000;
        let d = getRandomInt(0, SaclaySlitherGame_1.SaclaySlitherGame.WORLDRADIUS);
        let cc = getRandomInt(0, SaclaySlitherGame_1.SaclaySlitherGame.colors.length);
        let ss = getRandomInt(0, SaclaySlitherGame_1.SaclaySlitherGame.colors[0].length);
        let p = new PixiFood(d * Math.cos(a), d * Math.sin(a), cc * SaclaySlitherGame_1.SaclaySlitherGame.colors[0].length + ss);
        p.sprite.anchor.set(0.5);
        p.sprite.x = p.x - ssg0.panX;
        p.sprite.y = p.y - ssg0.panY;
        p.sprite.rotation = Math.random() * Math.PI;
        let c = p.type % SaclaySlitherGame_1.SaclaySlitherGame.colors.length;
        p.sprite.tint = PIXI.utils.rgb2hex([SaclaySlitherGame_1.SaclaySlitherGame.colors[cc][ss][0] / 255,
            SaclaySlitherGame_1.SaclaySlitherGame.colors[cc][ss][1] / 255,
            SaclaySlitherGame_1.SaclaySlitherGame.colors[cc][ss][2] / 255]);
        p.rd = getRandomInt(5, 30);
        let sc = p.rd / index_1.PixiSaclaySlitherGame.texfood.width;
        p.sprite.scale = new PIXI.Point(sc, sc);
        p.sprite.blendMode = PIXI.BLEND_MODES.ADD;
        return p;
    }
}
exports.PixiFood = PixiFood;
class PixiSnake extends Snake_1.Snake {
    constructor(ssg0, name0, weight0, x0, y0, type0, dirX0, dirY0, state0) {
        super(ssg0, name0, weight0, x0, y0, type0, dirX0, dirY0, state0);
        this.container = new PIXI.Container();
        let p0 = this.pos[0];
        this.bodys = [];
        this.bodys[0] = new PIXI.Sprite(index_1.PixiSaclaySlitherGame.texhead);
        this.bodys[0].x = 0;
        this.bodys[0].y = 0;
        this.bodys[0].anchor.set(0.5);
        this.bodys[0].rotation = Math.atan2(this.dirY, this.dirX);
        this.bodys[0].tint = PIXI.utils.rgb2hex([SaclaySlitherGame_1.SaclaySlitherGame.colors[this.type][(0) % 6][0] / 255,
            SaclaySlitherGame_1.SaclaySlitherGame.colors[this.type][(0) % 6][1] / 255,
            SaclaySlitherGame_1.SaclaySlitherGame.colors[this.type][(0) % 6][2] / 255]);
        this.deco = new PIXI.Graphics();
        this.deco.lineStyle(0);
        this.deco.beginFill(0x000000, 1.0);
        this.deco.drawEllipse(10, -25, 10, 16);
        this.deco.drawEllipse(10, 25, 10, 16);
        this.deco.beginFill(0xFFFF0B, 0.8);
        this.deco.drawCircle(14, -26, 6);
        this.deco.drawCircle(14, 26, 6);
        this.deco.drawRect(SaclaySlitherGame_1.SaclaySlitherGame.IMG_SIZE / 2, 0, 40, 4);
        this.deco.endFill();
        this.deco.rotation = Math.atan2(this.dirY, this.dirX);
        let style = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: ['#FFFFFF'],
            stroke: '#000000',
            strokeThickness: 1,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 3,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 0,
            wordWrap: true,
            wordWrapWidth: 440
        });
        this.pixiName = new PIXI.Text('' + this.name, style);
        this.pixiName.x = 0;
        this.pixiName.y = 0;
        for (let i = 1; i < this.size; i++) {
            let p = this.pos[i];
            this.bodys[i] = new PIXI.Sprite(index_1.PixiSaclaySlitherGame.texbody);
            this.bodys[i].x = p.x - (p0.x);
            this.bodys[i].y = p.y - (p0.y);
            this.bodys[i].anchor.set(0.5);
            this.bodys[i].tint = PIXI.utils.rgb2hex([SaclaySlitherGame_1.SaclaySlitherGame.colors[this.type][(i - 1) % 6][0] / 255,
                SaclaySlitherGame_1.SaclaySlitherGame.colors[this.type][(i - 1) % 6][1] / 255,
                SaclaySlitherGame_1.SaclaySlitherGame.colors[this.type][(i - 1) % 6][2] / 255]);
            this.container.addChild(this.bodys[i]);
        }
        this.container.addChild(this.bodys[0]);
        this.container.addChild(this.deco);
        this.container.addChild(this.pixiName);
        this.container.x = p0.x - ssg0.panX;
        this.container.y = p0.y - ssg0.panY;
        this.updatePixi();
    }
    updatePixi() {
        for (let i = this.size - 1; i >= 0; i--) {
            let p = this.pos[i];
            let scale = 2 * p.rd / SaclaySlitherGame_1.SaclaySlitherGame.IMG_SIZE;
            if (i == 0)
                scale *= 1.3;
            this.bodys[i].scale = new PIXI.Point(scale, scale);
            if (i == 0)
                this.deco.scale = new PIXI.Point(scale, scale);
        }
    }
    drawSnake(zz) {
        let p0 = this.pos[0];
        this.container.x = p0.x - this.ssg.panX;
        this.container.y = p0.y - this.ssg.panY;
        for (let i = 1; i < this.pos.length; i++) {
            let p = this.pos[i];
            this.bodys[i].x = p.x - p0.x;
            this.bodys[i].y = p.y - p0.y;
        }
        this.bodys[0].rotation = Math.atan2(this.dirY, this.dirX);
        this.deco.rotation = Math.atan2(this.dirY, this.dirX);
    }
}
exports.PixiSnake = PixiSnake;
//# sourceMappingURL=PixiSnake.js.map