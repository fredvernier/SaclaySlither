import {PixiSaclaySlitherGame} from './index';
import {SaclaySlitherGame} from './SaclaySlitherGame';
import {Point, Food, Snake} from './Snake';
import {dist} from './util';

function getRandomInt(min:number, max:number) {
  return min+Math.floor(Math.random() * Math.floor(max-min));
}

export class PixiFood extends Food{
  sprite:PIXI.Sprite;
  constructor (x0: number, y0:number, type0:number) {
    super(x0, y0, type0);
    this.sprite = new PIXI.Sprite(PixiSaclaySlitherGame.texfood)
  }

  static newFood(ssg0: SaclaySlitherGame):PixiFood {
    let a:number = getRandomInt(0, 10000)*Math.PI/5000;
    let d:number = getRandomInt(0, SaclaySlitherGame.WORLDRADIUS);

    let cc = getRandomInt(0, SaclaySlitherGame.colors.length)
    let ss = getRandomInt(0, SaclaySlitherGame.colors[0].length);

    let p:PixiFood  = new PixiFood(d*Math.cos(a), d*Math.sin(a),  cc*SaclaySlitherGame.colors[0].length+ss);
    p.sprite.anchor.set(0.5);
    p.sprite.x = p.x-ssg0.panX;
    p.sprite.y = p.y-ssg0.panY;
    p.sprite.rotation = Math.random()*Math.PI;

    let c = p.type%SaclaySlitherGame.colors.length;
    p.sprite.tint =  PIXI.utils.rgb2hex([SaclaySlitherGame.colors[cc][ss][0]/255,
                                         SaclaySlitherGame.colors[cc][ss][1]/255,
                                         SaclaySlitherGame.colors[cc][ss][2]/255])

    p.rd = getRandomInt(5, 30);
    let sc= p.rd / PixiSaclaySlitherGame.texfood.width;
    p.sprite.scale = new PIXI.Point(sc, sc);
    p.sprite.blendMode = PIXI.BLEND_MODES.ADD;

    return p;
  }
}



export class PixiSnake extends Snake{

  container:PIXI.Container;
  bodys:    PIXI.Sprite[];
  deco:     PIXI.Graphics;
  pixiName: PIXI.Text;

  constructor(ssg0: PixiSaclaySlitherGame,
              name0: string,
              weight0:number,
              x0:number,
              y0:number,
              type0:number,
              dirX0:number,
              dirY0:number,
              state0:number) {
    super(ssg0, name0, weight0, x0, y0, type0, dirX0, dirY0, state0);

    this.container = new PIXI.Container();
    let p0:Point = this.pos[0];
    this.bodys = [];
    this.bodys[0] = new PIXI.Sprite(PixiSaclaySlitherGame.texhead)
    this.bodys[0].x = 0;
    this.bodys[0].y = 0;
    this.bodys[0].anchor.set(0.5);
    this.bodys[0].rotation = Math.atan2(this.dirY, this.dirX);
    this.bodys[0].tint =  PIXI.utils.rgb2hex([SaclaySlitherGame.colors[this.type][(0)%6][0]/255,
                                              SaclaySlitherGame.colors[this.type][(0)%6][1]/255,
                                              SaclaySlitherGame.colors[this.type][(0)%6][2]/255])

    this.deco = new PIXI.Graphics();
      this.deco.lineStyle(0);
      this.deco.beginFill(0x000000, 1.0);
      this.deco.drawEllipse(10, -25, 10, 16);
      this.deco.drawEllipse(10 ,25, 10, 16);
      this.deco.beginFill(0xFFFF0B, 0.8);
      this.deco.drawCircle(14,  -26, 6);
      this.deco.drawCircle(14 , 26, 6);
      this.deco.drawRect(SaclaySlitherGame.IMG_SIZE/2 , 0, 40, 4);
    this. deco.endFill();
    this.deco.rotation = Math.atan2(this.dirY, this.dirX);

    let style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fontStyle: 'italic',
      fontWeight: 'bold',
      fill: ['#FFFFFF'], // gradient
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

    this.pixiName = new PIXI.Text(''+this.name, style);
    this.pixiName.x = 0;
    this.pixiName.y = 0;

    //console.log(this.name +" has "+this.size+" segments toward "+this.dirX+","+this.dirY+ "... "+SaclaySlitherGame.colors[0].length+" = "+this.type);
    for (let i:number=1; i<this.size; i++){
      let p:Point = this.pos[i];

      this.bodys[i] = new PIXI.Sprite(PixiSaclaySlitherGame.texbody)
      this.bodys[i].x = p.x-(p0.x);
      this.bodys[i].y = p.y-(p0.y);
      this.bodys[i].anchor.set(0.5);
      this.bodys[i].tint =  PIXI.utils.rgb2hex([SaclaySlitherGame.colors[this.type][(i-1)%6][0]/255,
                                                SaclaySlitherGame.colors[this.type][(i-1)%6][1]/255,
                                                SaclaySlitherGame.colors[this.type][(i-1)%6][2]/255])
      //this.bodys[i].scale = new PIXI.Point(0.5, 0.5);
      this.container.addChild(this.bodys[i]);
    }
    this.container.addChild(this.bodys[0]);
    this.container.addChild(this.deco);
    this.container.addChild(this.pixiName);
    this.container.x = p0.x-ssg0.panX;
    this.container.y = p0.y-ssg0.panY;
    this.updatePixi();
  }

  ///////////////////////////////////////////////////////////////////////
  setWeight(weight1:number):void {
    super.setWeight(weight1)
    this.updatePixi()
  }

  ///////////////////////////////////////////////////////////////////////
  updatePixi() {
    if (!this.bodys) return;
    // updates sprite zoom
    for (let i:number = this.size-1; i>=0; i--) {
      let p:Point = this.pos[i];

      let scale = 2*p.rd/SaclaySlitherGame.IMG_SIZE;
      if (i==0) scale *=1.3;
      if (!this.bodys[i]){
        let p0:Point = this.pos[0];
        this.bodys[i] = new PIXI.Sprite(PixiSaclaySlitherGame.texbody)
        this.bodys[i].x = p.x-(p0.x);
        this.bodys[i].y = p.y-(p0.y);
        this.bodys[i].anchor.set(0.5);
        this.bodys[i].tint =  PIXI.utils.rgb2hex([SaclaySlitherGame.colors[this.type][(i-1)%6][0]/255,
                                                  SaclaySlitherGame.colors[this.type][(i-1)%6][1]/255,
                                                  SaclaySlitherGame.colors[this.type][(i-1)%6][2]/255])
        this.container.addChild(this.bodys[i]);
      }
      this.bodys[i].scale = new PIXI.Point(scale, scale);
      if (i==0)
        this.deco.scale = new PIXI.Point(scale, scale);
    }
    for (let i=this.size; i<this.bodys.length; i++){
      this.container.removeChild(this.bodys[i]);
      delete this.bodys[i];
    }
  }


  ///////////////////////////////////////////////////////////////////////
  drawSnake(zz:number) {
    //console.log("drawSnake "+this.bodys.length+" "+this.ssg.panX+","+this.ssg.panY);

    let p0:Point = this.pos[0];
    this.container.x = p0.x-this.ssg.panX;
    this.container.y = p0.y-this.ssg.panY;

    for (let i:number = 1; i<this.pos.length; i++) {
      let p:Point = this.pos[i];

      this.bodys[i].x = p.x-p0.x;
      this.bodys[i].y = p.y-p0.y;
    }
    this.bodys[0].rotation = Math.atan2(this.dirY, this.dirX);
    this.deco.rotation = Math.atan2(this.dirY, this.dirX);
  /*let alph = this.dAlph;

  let p0 = this.pos[0]; //head
  let pm = this.pos[Math.round(this.pos.length/2)]; // middle
  sketch.push();
  sketch.translate( pm.x-this.ssg.panX, pm.y-this.ssg.panY);

  let minR = this.speed*Math.sin(Math.PI/2-SaclaySlitherGame.MAX_TURN)/Math.sin(Math.PI-2*SaclaySlitherGame.MAX_TURN);
  let csp = this.closestSnakeP;
  if (csp!=null && (this.state==Snake.AVOIDWORST)){
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
  sketch.pop();*/

  }

}
