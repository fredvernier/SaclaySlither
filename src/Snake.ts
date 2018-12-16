import {SaclaySlitherGame} from './SaclaySlitherGame';
import {dist} from './util';

function getRandomInt(min:number, max:number) {
  return min+Math.floor(Math.random() * Math.floor(max-min));
}


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

   static newFood(ssg0: SaclaySlitherGame):Food {
    let a:number = getRandomInt(0, 10000)*Math.PI/5000;
    let d:number = getRandomInt(0, SaclaySlitherGame.WORLDRADIUS/20);

    let cc = getRandomInt(0, SaclaySlitherGame.colors.length)
    let ss = getRandomInt(0, SaclaySlitherGame.colors[0].length);

    let f:Food  = new Food(SaclaySlitherGame.WORLDRADIUS/2+d*Math.cos(a), SaclaySlitherGame.WORLDRADIUS/2+d*Math.sin(a),  cc*SaclaySlitherGame.colors[0].length+ss);
    return f;
  }
}

export enum SnakeStrategy {
    FREE = -1,
    RANDWALK,
    ROT,
    FASTSTRAIGHT,
    AVOIDCLOSEST,
    GOCLOSESTFOOD,
    GOBESTFOOD,
    AVOIDWORST,
    AVOIDBORDER
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

  state:SnakeStrategy = SnakeStrategy.GOBESTFOOD;

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
    this.type  = type0;
    this.ssg   = ssg0;

    this.speed = SaclaySlitherGame.PREF_SPEED;
    this.state = state0;
    this.name  = name0;

    let norm = Math.hypot(dirX0, dirY0)/SaclaySlitherGame.SPACEBETWEENSEGMENTS;

    this.dirX  = dirX0/norm;
    this.dirY  = dirY0/norm;

    this.size  = Math.floor(4+Math.sqrt(weight0)/10.0+weight0/25.0);

    let p0:Point = new Point(x0, y0);
    this.pos.push(p0);

    for (let i:number=1; i<this.size; i++){
      let p:Point = new Point(x0-i*this.dirX, y0-i*this.dirY);
      this.pos.push(p);

    }
    this.setWeight(weight0);
  }

  setWeight(weight1:number):void {
    this.weight = weight1;
    // update the body
    for (let i:number = this.size-1; i>=0; i--) {
      let p:Point = this.pos[i];
      p.rd = 10+Math.sqrt((this.weight-39))/4.0;

      //neck
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

  // move the head of the snake to the given position and translate the rest of the snake
  translate(x0:number, y0:number, xn:number, yn:number) {
    let tx0 = x0-this.pos[0].x;
    let ty0 = y0-this.pos[0].y;
    let txn = xn-this.pos[this.pos.length-1].x;
    let tyn = yn-this.pos[this.pos.length-1].y;

    for (let i:number = 0; i<this.pos.length; i++) {
      this.pos[i].x += (tx0*(this.pos.length-1-i)+txn*i)/(this.pos.length-1);
      this.pos[i].y += (ty0*(this.pos.length-1-i)+tyn*i)/(this.pos.length-1);
    }
  }

  setLocations(locs:Float32Array){
    for (let i:number = 0; i<this.pos.length; i++) {
      this.pos[i].x = locs[i*2+0];
      this.pos[i].y = locs[i*2+1];
    }
  }

  // the snake moves to follow the given objective
  moveSnake(objx:number, objy:number) {
    let p0:Point = this.pos[0];
    let pn:Point = this.pos[this.pos.length-1];

    let snakeZoom:number = 0.75+64.0/(128.0+this.size);
    //if (s==snakes[0]) println("moveSnake "+s.size+" => "+snakeZoom);
    let objspeed:number = dist(p0.x, p0.y, objx, objy);

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

    let dd:number = dist(p0.x, p0.y, objx, objy);
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
    if (this.speed>SaclaySlitherGame.PREF_SPEED && this.ssg.frameCount%SaclaySlitherGame.LOOSEWEIGHTPACE==0) {
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
      let len:number = dist(p.x, p.y, tx, ty);
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
      tlen = SaclaySlitherGame.SPACEBETWEENSEGMENTS+2*Math.sin(alph);
    }
    this.dAlph += 0.02*this.speed;
  }



  testCollision(foodUpdate:number[]):boolean {
    let p0:Point = this.pos[0];
    let pn:Point = this.pos[this.pos.length-1];

    this.closestSnake     = null;
    this.closestSnakeP    = null;
    this.closestBadSnake  = null;
    this.closestBadSnakeP = null;
    this.dclosestBadSnake = SaclaySlitherGame.WORLDRADIUS;
    this.dclosestSnake    = SaclaySlitherGame.WORLDRADIUS;

    // snake reach the end of the world
    if(dist(0,0,p0.x,p0.y)>SaclaySlitherGame.WORLDRADIUS){
      return true;
    }

    for (let i:number=0; i<this.ssg.snakes.length; i++) {
      let other:Snake = this.ssg.snakes[i]!;
      if (other!=null && other!=this) {
        for (let k=0; k<other.pos.length; k++) {
          let p:Point = other.pos[k];
          let dd = dist(p.x, p.y, p0.x, p0.y);
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
    let n    = dist(0,0,this.dirX, this.dirY);
    let lx   = p0.x+this.dirY*minR/n;
    let ly   = p0.y-this.dirX*minR/n;
    let rx   = p0.x-this.dirY*minR/n;
    let ry   = p0.y+this.dirX*minR/n;

    this.closestFood   = null;
    this.bestFood      = null;
    this.dclosestFood  = SaclaySlitherGame.WORLDRADIUS;
    for (let k=this.ssg.foods.length-1; k>=0; k--) {
      let f:Food = this.ssg.foods[k];
      let dd = dist(p0.x, p0.y, f.x, f.y);
      let a = Math.atan2(f.y-p0.y, f.x-p0.x);

      let dl = dist(lx, ly, f.x, f.y);
      let dr = dist(rx, ry, f.x, f.y);
      // miam miam le serpent mange la nourriture
      if (dd < p0.rd+f.rd) {
        this.setWeight(this.weight +Math.round(f.rd));
        if (4+Math.sqrt(this.weight)/10.0+this.weight/25.0>this.size) {
          this.size++;
          let p = new Point(pn.x, pn.y);
          p.rd= 8;
          this.pos.push(p);
        }

        //this.ssg.foods.splice(k,1);
        this.ssg.foods[k].rd = 0;
        foodUpdate.push(k);
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

}
