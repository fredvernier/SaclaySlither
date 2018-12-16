/// <reference types="pixi.js" />
import { PixiSaclaySlitherGame } from './index';
import { SaclaySlitherGame } from './SaclaySlitherGame';
import { Food, Snake } from './Snake';
export declare class PixiFood extends Food {
    sprite: PIXI.Sprite;
    constructor(x0: number, y0: number, type0: number);
    static newFood(ssg0: SaclaySlitherGame): PixiFood;
}
export declare class PixiSnake extends Snake {
    container: PIXI.Container;
    bodys: PIXI.Sprite[];
    deco: PIXI.Graphics;
    pixiName: PIXI.Text;
    constructor(ssg0: PixiSaclaySlitherGame, name0: string, weight0: number, x0: number, y0: number, type0: number, dirX0: number, dirY0: number, state0: number);
    setWeight(weight1: number): void;
    updatePixi(): void;
    drawSnake(zz: number): void;
}
