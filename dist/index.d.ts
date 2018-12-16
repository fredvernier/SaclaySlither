/// <reference types="pixi.js" />
import * as PIXI from 'pixi.js';
import { PixiSnake } from './PixiSnake';
import { SaclaySlitherGame } from './SaclaySlitherGame';
export declare class PixiSaclaySlitherGame extends SaclaySlitherGame {
    static texhead: PIXI.Texture;
    static texbody: PIXI.Texture;
    static texfood: PIXI.Texture;
    app: PIXI.Application;
    foodLayer: PIXI.Container;
    socket: WebSocket | null;
    socketReq: number;
    ctrlSnake: PixiSnake | null;
    run: boolean;
    constructor(name0: string, teamId: number);
    initInteraction(): void;
    initNetwork(name0: string, teamId: number): void;
    initTextures(): void;
    updateBeforeRender(): void;
    sendUpdateToServer(debug: boolean): void;
    sendSnakesRequestToServer(): void;
    initRenderingLoop(): void;
}
