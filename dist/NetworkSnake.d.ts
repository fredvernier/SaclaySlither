/// <reference types="ws" />
import { Snake } from './Snake';
import { SaclaySlitherGame } from './SaclaySlitherGame';
import * as WebSocket from 'ws';
export declare class NetworkSnake extends Snake {
    ws: WebSocket;
    lastDirX: number;
    lastDirY: number;
    constructor(ssg0: SaclaySlitherGame, name0: string, weight0: number, x0: number, y0: number, type0: number, dirX0: number, dirY0: number, state0: number, ws0: WebSocket);
}
