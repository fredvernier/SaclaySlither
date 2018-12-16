import { SaclaySlitherGame } from './test2';
export declare class Point {
    x: number;
    y: number;
    rd: number;
    constructor(x0: number, y0: number);
}
export declare class Food extends Point {
    type: number;
    constructor(x0: number, y0: number, type0: number);
    static newFood(): Food;
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
    static FREE: number;
    static RANDWALK: number;
    static ROT: number;
    static FASTSTRAIGHT: number;
    static AVOIDCLOSEST: number;
    static GOCLOSESTFOOD: number;
    static GOBESTFOOD: number;
    static AVOIDWORST: number;
    static AVOIDBORDER: number;
    static INITIALSTATE: number;
    state: number;
    static PREF_SPEED: number;
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
    ssg: SaclaySlitherGame;
    constructor(ssg0: SaclaySlitherGame, name0: string, weight0: number, x0: number, y0: number, type0: number, dirX0: number, dirY0: number, state0: number);
    setWeight(weight1: number): void;
    moveSnake(objx: number, objy: number): void;
    testCollision(): boolean;
    drawSnake(zz: number): void;
}
