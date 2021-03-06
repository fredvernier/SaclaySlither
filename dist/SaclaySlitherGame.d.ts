import { Food, Snake } from './Snake';
export declare class SaclaySlitherGame {
    static BORDER_SIZE: number;
    static NBINITIALSNAKES: number;
    static NBINITIALFOODS: number;
    static IMG_SIZE: number;
    static LOOSEWEIGHT: number;
    static LOOSEWEIGHTPACE: number;
    static WORLDRADIUS: number;
    static MIN_SPEED: number;
    static PREF_SPEED: number;
    static MAX_SPEED: number;
    static SPACEBETWEENSEGMENTS: number;
    static MAX_TURN: number;
    static imgRadar: HTMLCanvasElement;
    foods: Food[];
    snakes: (Snake | null)[];
    gaussR: number;
    gauss: number[][];
    globZoom: number;
    automaticZoom: boolean;
    state: number;
    frameCount: number;
    lastTime: number;
    panX: number;
    panY: number;
    targetX: number;
    targetY: number;
    names: string[];
    static colors: number[][][];
    static teamNames: string[];
    constructor();
    init(): void;
}
