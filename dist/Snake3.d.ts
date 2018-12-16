/// <reference types="pixi.js" />
import { SaclaySlitherGame } from './test3';
export declare class Point {
    x: number;
    y: number;
    rd: number;
    constructor(x0: number, y0: number);
}
export declare class Food extends Point {
    type: number;
    sprite: PIXI.Sprite;
    constructor(x0: number, y0: number, type0: number);
    static newFood(ssg0: SaclaySlitherGame): Food;
}
export declare enum SnakeStrategy {
    FREE = -1,
    RANDWALK = 0,
    ROT = 1,
    FASTSTRAIGHT = 2,
    AVOIDCLOSEST = 3,
    GOCLOSESTFOOD = 4,
    GOBESTFOOD = 5,
    AVOIDWORST = 6,
    AVOIDBORDER = 7,
}
export declare class Snake {
    pos: Point[];
    size: number;
    weight: number;
    dirX: number;
    dirY: number;
    speed: number;
    type: number;
    name: string;
    dAlph: number;
    state: SnakeStrategy;
    bestFood: Food | null;
    dbestFood: number;
    closestFood: Food | null;
    dclosestFood: number;
    closestSnake: Snake | null;
    closestSnakeP: Point | null;
    dclosestSnake: number;
    closestBadSnake: Snake | null;
    closestBadSnakeP: Point | null;
    dclosestBadSnake: number;
    container: PIXI.Container;
    bodys: PIXI.Sprite[];
    deco: PIXI.Graphics;
    ssg: SaclaySlitherGame;
    constructor(ssg0: SaclaySlitherGame, name0: string, weight0: number, x0: number, y0: number, type0: number, dirX0: number, dirY0: number, state0: number);
    setWeight(weight1: number): void;
    moveSnake(objx: number, objy: number): void;
    testCollision(): boolean;
    drawSnake(zz: number): void;
}
