import {Point, Food, Snake} from '../Snake';
import {dist} from '../util';
import {SaclaySlitherGame} from '../SaclaySlitherGame';
import * as WebSocket from 'ws';

export class NetworkSnake extends Snake {
  ws: WebSocket;
  lastDirX : number;
  lastDirY : number;

  constructor(ssg0:   SaclaySlitherGame,
              name0:  string,
              weight0:number,
              x0:     number,
              y0:     number,
              type0:  number,
              dirX0:  number,
              dirY0:  number,
              state0: number,
              ws0:    WebSocket) {
    super(ssg0, name0, weight0, x0, y0, type0, dirX0, dirY0, state0);

    this.ws = ws0;

    this.lastDirX = dirX0;
    this.lastDirY = dirY0;
  }
}
