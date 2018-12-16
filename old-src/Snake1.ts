import 'p5';
import {SaclaySlitherGame,sketch} from './index';

var p5 = require("p5");
require('p5/lib/addons/p5.sound')


export class Point{
  x: number;
  y: number;
  rd:number;
  constructor (x0: number, y0:number) {
    this.x = x0;
    this.y = y0;
    this.rd = 10;
  }
}

export class Food extends Point{
  type:number;
  constructor (x0: number, y0:number, type0:number) {
    super(x0, y0);
    this.type= type0;
  }

  static  newFood() {
    let a:number = sketch.random(0, 10000)*Math.PI/5000;
    let d:number = sketch.random(0, SaclaySlitherGame.WORLDRADIUS);


    let p:Food  = new Food( d*Math.cos(a), d*Math.sin(a),  Math.round(sketch.random(1, 6)) );
    p.rd = sketch.random(1, 5);
    return p;
  }
}

export class Snake {
  pos:    Point[] =[];
  size:   number = 0;
  weight: number = 0;
  dirX:   number = 1;
  dirY:   number = 0;
  speed:  number = 0;
  type:   number;
  name:   string;
  dAlph:  number = 0;

  static FREE:number          = -1;
  static RANDWALK:number      = 0;
  static ROT:number           = 1;
  static FASTSTRAIGHT:number  = 2;
  static AVOIDCLOSEST:number  = 3;
  static GOCLOSESTFOOD:number = 4;
  static GOBESTFOOD:number    = 5;
  static AVOIDWORST:number    = 6;
  static AVOIDBORDER:number   = 7;
  static INITIALSTATE:number  = Snake.GOBESTFOOD;
  state:number = Snake.INITIALSTATE;

  static PREF_SPEED:number    = 8;

  bestFood:Food|null          = null;
  dbestFood:number            = 0.0;
  closestFood:Food|null       = null;
  dclosestFood:number         = 0.0;

  closestSnake:Snake|null     = null;
  closestSnakeP:Point|null    = null;
  dclosestSnake:number        = 0.0;
  closestBadSnake:Snake|null  = null;
  closestBadSnakeP:Point|null = null;
  dclosestBadSnake:number     = 0.0;

  ssg :SaclaySlitherGame;

  constructor(ssg0: SaclaySlitherGame,
              name0: string,
              weight0:number,
              x0:number,
              y0:number,
              type0:number,
              dirX0:number,
              dirY0:number,
              state0:number) {
    this.type=type0;
    this.ssg = ssg0;

    this.speed = Snake.PREF_SPEED;
    this.state = state0;
    this.name  = name0;
    this.dirX  = dirX0;
    this.dirY  = dirY0;

    this.size  = Math.floor(4+Math.sqrt(weight0)/10.0+weight0/25.0);

    for (let i:number = this.size; i>=0; i--) {
      let p:Point = new Point(x0+i*this.dirX, y0+i*this.dirY);
      this.pos.push(p);
    }
    this.setWeight(weight0);
  }

  setWeight(weight1:number) {
    this.weight = weight1;
    for (let i:number = this.size; i>=0; i--) {
      let p:Point = this.pos[i];
      p.rd = 10+Math.sqrt((this.weight-39))/4.0;
      if (i==1) p.rd-=2;
      if (i==2) p.rd--;
    }

    // makes the tail
    let acc:number = 8;
    for (let i:number = this.size-1; i>=3; i--) {
      let p:Point = this.pos[i];
      if (acc<p.rd)
        p.rd = acc;
      else
        break;
      acc+=1;
    }
  }


  moveSnake(objx:number, objy:number) {
    let p0:Point = this.pos[0];
    let pn:Point = this.pos[this.pos.length-1];

    let snakeZoom:number = 0.75+64.0/(128.0+this.size);
    //if (s==snakes[0]) println("moveSnake "+s.size+" => "+snakeZoom);
    let objspeed:number = sketch.dist(p0.x, p0.y, objx, objy);

    // direction before and new direction
    let aobj:number = Math.atan2(objy-p0.y, objx-p0.x);
    let a:number    = Math.atan2(this.dirY, this.dirX);

    // difference between the two
    let da:number = aobj-a;
    if (da>Math.PI)  da-=2*Math.PI;
    if (da<-Math.PI) da+=2*Math.PI;

    //if (s==snakes[0]) println( cos(a)+","+sin(a)+" => "+cos(aobj)+","+sin(aobj)+"   delta="+da);

    // if the snake turn too fast, must be thresholded
    if (da>SaclaySlitherGame.MAX_TURN*snakeZoom*snakeZoom*snakeZoom) {
      objx = p0.x+Math.max(objspeed, SaclaySlitherGame.MIN_SPEED)*Math.cos(a+SaclaySlitherGame.MAX_TURN*snakeZoom*snakeZoom*snakeZoom);
      objy = p0.y+Math.max(objspeed, SaclaySlitherGame.MIN_SPEED)*Math.sin(a+SaclaySlitherGame.MAX_TURN*snakeZoom*snakeZoom*snakeZoom);
    } else if (da<-SaclaySlitherGame.MAX_TURN*snakeZoom*snakeZoom*snakeZoom) {
      objx = p0.x+Math.max(objspeed, SaclaySlitherGame.MIN_SPEED)*Math.cos(a-SaclaySlitherGame.MAX_TURN*snakeZoom*snakeZoom*snakeZoom);
      objy = p0.y+Math.max(objspeed, SaclaySlitherGame.MIN_SPEED)*Math.sin(a-SaclaySlitherGame.MAX_TURN*snakeZoom*snakeZoom*snakeZoom);
    } else {
      objx = Math.round(p0.x+Math.max(objspeed, SaclaySlitherGame.MIN_SPEED)*Math.cos(aobj));
      objy = Math.round(p0.y+Math.max(objspeed, SaclaySlitherGame.MIN_SPEED)*Math.sin(aobj));
    }

    let dd:number = sketch.dist(p0.x, p0.y, objx, objy);
    let tx:number = objx;
    let ty:number = objy;
    if (dd>this.speed) {
      tx = p0.x+(objx-p0.x)/dd*this.speed;
      ty = p0.y+(objy-p0.y)/dd*this.speed;
    }
    if (dd>0) {
      this.dirX = (objx-p0.x)/dd*this.speed;
      this.dirY = (objy-p0.y)/dd*this.speed;
    }

    // si on va "vite" on seme de la nourriture derriere soi et on perd du poids
    if (this.speed>SaclaySlitherGame.PREF_SPEED && sketch.frameCount%SaclaySlitherGame.LOOSEWEIGHTPACE==0) {
      this.setWeight(this.weight - SaclaySlitherGame.LOOSEWEIGHT);

      let f:Food = new Food(pn.x, pn.y, this.type);
      f.rd = 1;

      this.ssg.foods.push(f);

      if (4+Math.sqrt(this.weight)/10.0+this.weight/25.0<this.size) {
        //println("remove size because "+(4+sqrt(snake0.weight)/10.0+snake0.weight/25.0)+">"+snake0.size);
        this.size--;
        this.pos.splice(this.pos.length-1, 1);
      }
      //println(snake0.weight+" % "+(40+LOOSEWEIGHT));
      if (this.weight<40+SaclaySlitherGame.LOOSEWEIGHT) {
        this.speed = SaclaySlitherGame.PREF_SPEED;
      }
    }

    // deplace chaque segment du serpent
    let tlen:number = 0;
    let alph:number = this.dAlph;
    for (let i:number = 0; i<this.pos.length; i++) {
      alph  += 0.25;
      let p:Point = this.pos[i];
      let len:number = sketch.dist(p.x, p.y, tx, ty);
      let ang:number = Math.atan2(ty-p.y, tx-p.x);

      da = ang-a;

      if (da>Math.PI)  da-=2*Math.PI;
      if (da<-Math.PI) da+=2*Math.PI;

      if (da>SaclaySlitherGame.MAX_TURN) {
        da = SaclaySlitherGame.MAX_TURN;
      } else if (da<-SaclaySlitherGame.MAX_TURN) {
        da = -SaclaySlitherGame.MAX_TURN;
      }

      if (len > tlen) {
        p.x = tx-tlen*Math.cos(a+da)+Math.sin(alph*2.0)/12.0*tlen*Math.sin(a+da);
        p.y = ty-tlen*Math.sin(a+da)-Math.sin(alph*2.0)/12.0*tlen*Math.cos(a+da);
      }
      tx   = p.x;
      ty   = p.y;
      a    = ang;
      tlen = 10.0+2*Math.sin(alph);
    }
    this.dAlph += 0.02*this.speed;
  }



  testCollision():boolean {
    let p0:Point = this.pos[0];
    let pn:Point = this.pos[this.pos.length-1];

    this.closestSnake     = null;
    this.closestSnakeP    = null;
    this.closestBadSnake  = null;
    this.closestBadSnakeP = null;
    this.dclosestBadSnake = SaclaySlitherGame.WORLDRADIUS;
    this.dclosestSnake    = SaclaySlitherGame.WORLDRADIUS;

    // snake reach the end of the world
    if(sketch.dist(0,0,p0.x,p0.y)>SaclaySlitherGame.WORLDRADIUS){
      return true;
    }

    for (let i:number=0; i<this.ssg.snakes.length; i++) {
      let other:Snake = this.ssg.snakes[i]!;
      if (other!=null && other!=this) {
        for (let k=0; k<other.pos.length; k++) {
          let p:Point = other.pos[k];
          let dd = sketch.dist(p.x, p.y, p0.x, p0.y);
          if (dd<p0.rd+p.rd) {
            return true;
          } else {
            if (this.closestSnake==null || dd<this.dclosestSnake){
              this.closestSnake  = other;
              this.closestSnakeP = p;
              this.dclosestSnake = dd;
            }

            let a1 = Math.atan2(this.dirY, this.dirX);
            let a2 = Math.atan2(p.y-p0.y, p.x-p0.x);
            let da = Math.abs(a1-a2);
            if ((this.closestBadSnake==null || dd*Math.sin(da/2+1)<this.dclosestBadSnake) ){
              this.closestBadSnake  = other;
              this.closestBadSnakeP = p;
              this.dclosestBadSnake = dd*Math.sin(da/2+1);
            }
          }
        }
      }
    }
    let minR = this.speed*Math.sin(Math.PI/2-SaclaySlitherGame.MAX_TURN)/Math.sin(Math.PI-2*SaclaySlitherGame.MAX_TURN);
    let n    = sketch.dist(0,0,this.dirX, this.dirY);
    let lx   = p0.x+this.dirY*minR/n;
    let ly   = p0.y-this.dirX*minR/n;
    let rx   = p0.x-this.dirY*minR/n;
    let ry   = p0.y+this.dirX*minR/n;

    this.closestFood   = null;
    this.bestFood      = null;
    this.dclosestFood  = SaclaySlitherGame.WORLDRADIUS;
    for (let k=this.ssg.foods.length-1; k>=0; k--) {
      let f:Food = this.ssg.foods[k];
      let dd = sketch.dist(p0.x, p0.y, f.x, f.y);
      let a = Math.atan2(f.y-p0.y, f.x-p0.x);

      let dl = sketch.dist(lx, ly, f.x, f.y);
      let dr = sketch.dist(rx, ry, f.x, f.y);
      // miam miam le serpent mange la nourriture
      if (dd < p0.rd+f.rd) {
        this.setWeight(this.weight +Math.round(f.rd));
        if (4+Math.sqrt(this.weight)/10.0+this.weight/25.0>this.size) {
          this.size++;
          let p = new Point(pn.x, pn.y);
          p.rd= 8;
          this.pos.push(p);
        }

        this.ssg.foods.splice(k,1);
      } else {
        if ((this.closestFood==null || dd<this.dclosestFood)&&(dl>minR && dr>minR)){
          this.closestFood  = f;
          this.dclosestFood = dd;
        }
        if ((this.bestFood==null || dd/f.rd<this.dbestFood)&&(dl>minR && dr>minR)){
          this.bestFood  = f;
          this.dbestFood = dd/f.rd;
        }
      }
    }
    return false;
  }



drawSnake(zz:number) {
  let alph = this.dAlph;

  let p0 = this.pos[0]; //head
  let pm = this.pos[Math.round(this.pos.length/2)]; // middle
  sketch.push();
  sketch.translate( pm.x-this.ssg.panX, pm.y-this.ssg.panY);

  let minR = this.speed*Math.sin(Math.PI/2-SaclaySlitherGame.MAX_TURN)/Math.sin(Math.PI-2*SaclaySlitherGame.MAX_TURN);
  let csp = this.closestSnakeP;
  if (csp!=null && (/*s==snakes[0]||*/this.state==Snake.AVOIDWORST)){
    let ddx = csp.x-p0.x;
    let ddy = csp.y-p0.y;
    let dda = Math.atan2(ddy, ddx);
    let a   = Math.atan2(this.dirY, this.dirX);
    if(Math.abs(a-dda)<Math.PI/4)
      sketch.stroke(255,0,0);
    else if(Math.abs(a-dda)<Math.PI/2)
      sketch.stroke(255,128,0);
    else
      sketch.stroke(0,255,0);
    sketch.line( p0.x-pm.x, p0.y-pm.y, p0.x-pm.x+ddx, p0.y-pm.y+ddy);
    sketch.noStroke();
    sketch.push();
    sketch.translate( p0.x-pm.x, p0.y-pm.y);
    sketch.rotate(Math.atan2(this.dirY, this.dirX));

    sketch.fill(255, 0, 0, 64);
    sketch.ellipse(0, minR, minR*2, minR*2);
    sketch.ellipse(0, -minR, minR*2, minR*2);
    sketch.pop();
  }
  if (this.state==Snake.GOBESTFOOD){
    sketch.push();
    sketch.translate( p0.x-pm.x, p0.y-pm.y);
    sketch.rotate(Math.atan2(this.dirY, this.dirX));

    sketch.fill(0, 255, 0, 64);
    sketch.ellipse(0, minR, minR*2, minR*2);
    sketch.ellipse(0, -minR, minR*2, minR*2);
    sketch.pop();
  }

  sketch.scale(zz);
  for (let i = this.pos.length-1; i >= 0; i--) {
    let img = SaclaySlitherGame.img1;
    alph  += 0.25;

    let p = this.pos[i];
    sketch.push();
    sketch.translate( p.x-pm.x, p.y-pm.y);
    //translate( p.x-panX, p.y-panY);
    //scale(zz);
    if (i==0) {
      sketch.rotate(Math.atan2(this.dirY, this.dirX));

      sketch.noFill();
      sketch.stroke(0);
      sketch.strokeWeight(0.8);
      sketch.line(0, 0, 2*p.rd+(sketch.frameCount%8), 0);
      sketch.line(2*p.rd+(sketch.frameCount%8), 0, 2*p.rd+8+(sketch.frameCount%8), 3);
      sketch.line(2*p.rd+(sketch.frameCount%8), 0, 2*p.rd+8+(sketch.frameCount%8), -3);
      sketch.push();
      sketch.scale(3.2*p.rd/SaclaySlitherGame.img1.width, 2.6*p.rd/SaclaySlitherGame.img1.width);
      img = SaclaySlitherGame.img0;
    } else
      sketch.scale((1.0+0.02*Math.sin(alph))*2.0*p.rd/SaclaySlitherGame.img1.width);


    if (this.speed<=SaclaySlitherGame.PREF_SPEED) {
      //image(img3, 0,0);
      sketch.tint(this.ssg.colors[this.type][i%6][0], this.ssg.colors[this.type][i%6][1], this.ssg.colors[this.type][i%6][2]);
      sketch.image(img, 0, 0);
      sketch.noTint();
    } else {
      //image(img2, 0,0);
      sketch.tint(255-(255-this.ssg.colors[this.type][i%6][0])/2,
        255-(255-this.ssg.colors[this.type][i%6][1])/2,
        255-(255-this.ssg.colors[this.type][i%6][2])/2);
      sketch.image(img, 0, 0);
      sketch.noTint();
    }


    if (i==0) {
      sketch.pop();
      sketch.push();
      sketch.scale(Math.sqrt(p.rd/12.0));
      sketch.noStroke();
      sketch.fill(255, 255, 0);
      sketch.ellipse(10, 6, 6, 10);
      sketch.ellipse(10, -6, 6, 10);
      sketch.fill(128, 0, 0);
      sketch.ellipse(10, 6+Math.abs(((sketch.frameCount/4)%8)-4)-2, 6, 3);
      sketch.ellipse(10, -6+Math.abs(((sketch.frameCount/4)%8)-4)-2, 6, 3);
      sketch.stroke(0);
      sketch.strokeWeight(3);
      sketch.line(9, -3, 8, -9);
      sketch.line(9, 3, 8, 9);
      sketch.pop();
    }
    sketch.pop();
  }

  sketch.translate( p0.x-pm.x, p0.y-pm.y);
  if (this!=this.ssg.snakes[0]) {
    sketch.fill(0);
    sketch.textSize(14);
    sketch.text(this.name+" "+(this.state), 0, 0);
    sketch.fill(255);
    sketch.text(this.name+" "+(this.state), -1, -1);
  }
  sketch.pop();

}

}
