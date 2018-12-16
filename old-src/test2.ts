//import 'p5';
require ('./Snake2')
import {Point, Food, Snake} from './Snake2';
//require('p5/lib/addons/p5.dom')


export class SaclaySlitherGame {
  static BORDER_SIZE:number            = 512;
  static NBINITIALSNAKES:number        = 2 ;
  static IMG_SIZE:number               = 128;

   // combien de poids perd un serpend qui courre
  static LOOSEWEIGHT:number     = 2;

  // un serpend qui courre ne perds pas du poids a chaque affichage mais 1 fois sur LOOSEWEIGHTPACE
  static LOOSEWEIGHTPACE:number = 4;

  // La taille du monde qui a une forme de disque
  static WORLDRADIUS:number     = 1500;

  // Vitesse minimum
  static MIN_SPEED:number       = 8; // set to 0 to allow snakes to stop !

  // vitesse preferre quand tout va bien
  static PREF_SPEED:number      = 8;

  // vitesse maximum d'un serpent qui courre
  static MAX_SPEED:number       = 16;

  // l'angle maximal enter la tete et le cou => c'est cet angle qui donne le "rayon de braquage" du serpent.
  // mais ca depend aussi de la taille du serpent et du zoom
  static MAX_TURN:number        = Math.PI/32;

  // assets
  static boop: p5.SoundFile;
  static img0: HTMLCanvasElement;
  static img1: HTMLCanvasElement;
  static img2: HTMLCanvasElement;
  static img3: HTMLCanvasElement;
  static img4: HTMLCanvasElement;
  static imgRadar: HTMLCanvasElement;

  canvas:HTMLCanvasElement;
  //let pg1: any;
  //let pg2: p5.Graphics;

  // game data
  foods:Food[]                         = [];
  snakes:(Snake|null)[]                = [];
  gaussR:number                        = 8;
  gauss: number[][]                    = [];

  // le niveau de zoom en fonction de la taille du serpent principal
  globZoom                             = 1.5;

  // ...si le zoom automatique est actif
  automaticZoom:boolean                = true;

  state:number                         = 1;
  frameCount:number                    = 0;
  lastTime:number                      = 0;
  panX:number                          = 0;
  panY:number                          = 0;

  names:string[]       = ["Fred", "Nicolas", "Yacine", "Olivia", "Medhi", "Christian", "Laura", "Guillaume",
                          "Sandrine", "Lila", "Sarah", "Cecile", "Philippe", "Emmy", "Florian"];
  colors: number[][][] = [[[0, 0, 255], [0, 0, 255], [255, 255, 255], [255, 255, 255], [255, 0, 0], [255, 0, 0]], // french
                          [[96, 96, 255], [96, 96, 192], [96, 96, 128], [96, 96, 96], [96, 96, 128], [96, 96, 192]], // shades of blue
                          [[255, 96, 0], [192, 96, 0], [128, 96, 0], [96, 96, 0], [128, 96, 0], [192, 96, 0]], // shades of red
                          [[0, 0, 255], [0, 255, 255], [0, 255, 0], [255, 255, 0], [255, 0, 0], [255, 0, 255]], // rainbow
                          [[0, 255, 0], [0, 255, 0], [255, 0, 0], [255, 0, 0], [255, 0, 0], [255, 0, 0]], // portugese
                          [[0, 0, 0], [0, 0, 0], [255, 0, 0], [255, 0, 0], [255, 255, 0], [255, 255, 0]], // german
                          [[255, 0, 0], [255, 0, 0], [255, 0, 0], [255, 255, 0], [255, 255, 0], [255, 255, 0]], // spannish
                          [[255, 0, 0], [255, 255, 0], [255, 0, 0], [255, 255, 0], [255, 0, 0], [255, 255, 0]], // castillan
                          [[255, 0, 0], [255, 0, 0], [255, 255, 255], [255, 255, 255], [0, 0, 255], [0, 0, 255]], // dutch
                          [[255, 0, 0], [255, 0, 0], [255, 255, 255], [255, 255, 255], [255, 0, 255], [255, 0, 0]], // austrian/dannish/swiss
                          [[0, 192, 0], [0, 192, 0], [255, 255, 255], [255, 255, 255], [255, 128, 0], [255, 128, 0]], // irish
                          [[0, 0, 0], [0, 0, 0], [255, 255, 0], [255, 255, 0], [255, 0, 0], [255, 0, 0]], // belgian
                          [[255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255], [255, 255, 255]], // all white
                          [[0, 255, 0], [0, 255, 0], [255, 255, 255], [255, 255, 255], [255, 0, 0], [255, 0, 0]]      // italian
                        ];




  constructor() {
    this.canvas = <HTMLCanvasElement>document.createElement('canvas');

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    document.body.appendChild(this.canvas);

    this.canvas.addEventListener("mousemove", (e:MouseEvent) =>{
      this.panX = e.pageX;
      this.panY = e.pageY;
      this.draw();
    });

    this.init();
    this.draw();
  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////// INIT //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  init(){
    console.log("init");
    let R = SaclaySlitherGame.IMG_SIZE;
    SaclaySlitherGame.img0 = createImage(R, R);
    SaclaySlitherGame.img1 = createImage(R, R);
    SaclaySlitherGame.img2 = createImage(R/2, R/2);
    SaclaySlitherGame.img3 = createImage(R/2, R/2);

    //SaclaySlitherGame.img2 = createImage(R+this.gaussR, R+this.gaussR);
    //SaclaySlitherGame.img3 = createImage(R+this.gaussR, R+this.gaussR);

    SaclaySlitherGame.img4 = createImage(R, R);

    let ctx0 = SaclaySlitherGame.img0.getContext("2d")!;
    let ctx1 = SaclaySlitherGame.img1.getContext("2d")!;
    let ctx2 = SaclaySlitherGame.img2.getContext("2d")!;
    let ctx3 = SaclaySlitherGame.img3.getContext("2d")!;
    let ctx4 = SaclaySlitherGame.img4.getContext("2d")!;


    SaclaySlitherGame.img4 = createImage(R, R);
    //pg1  = sketch.createGraphics(R, R);
    //pg2  = sketch.createGraphics(R, R);

    SaclaySlitherGame.imgRadar = createImage(128, 128);
    let imData0 = ctx0.createImageData(R, R);
    let imData1 = ctx1.createImageData(R, R);
    let imData4 = ctx4.createImageData(R, R);

    for (let j:number=0; j < R; j++) {
      for (let i:number=0; i < R; i++) {
        let d0: number = 0.7*dist(i, j, R/2, R/2)+0.22*Math.abs(i-R/2)+0.4*Math.abs(j-R/2);
        let d1: number = dist(i, j, R/2, R/2);
        let iii:number = Math.round(R/2+ (i-R/2)* (1+Math.sqrt(d1/R/2))/2);
        let jjj:number = Math.round(R/2+(j-R/2)*(1+Math.sqrt(d1/R/2))/2);
        let di: number = (Math.floor(jjj/16)%2)*8;
        let ii: number = iii+di;
        let d3: number = dist(iii, jjj, iii-ii%16+8, jjj-jjj%16+8);
        let dl: number = dist(iii, jjj, R/3, R/3);

        if (d0<R/2-1) {
          imData0.data[i*4+j*R*4+0] = 255-dl*255/R-d3*4;
          imData0.data[i*4+j*R*4+1] = 255-dl*255/R-d3*4;
          imData0.data[i*4+j*R*4+2] = 255-dl*255/R-d3*4;
          imData0.data[i*4+j*R*4+3] = Math.min(255, i*8);
        }
        if (d1<R/2) {
          imData1.data[i*4+j*R*4+0] = 255-dl*255/R-d3*4;
          imData1.data[i*4+j*R*4+1] = 255-dl*255/R-d3*4;
          imData1.data[i*4+j*R*4+2] = 255-dl*255/R-d3*4;
          imData1.data[i*4+j*R*4+3] = Math.max(0, Math.min(255, (R/2-d1)*(255*R/10)/R));
        }
      }
    }

    ctx0.putImageData(imData0, 0, 0);
    ctx1.putImageData(imData1, 0, 0);
    ctx4.putImageData(imData4, 0, 0);
    ctx2.drawImage(SaclaySlitherGame.img0, 0, 0, R/2, R/2);
    ctx3.drawImage(SaclaySlitherGame.img1, 0, 0, R/2, R/2);
  }


  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////// DRAW //////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  draw(){
    //console.log("draw");
    this.frameCount++;
    if (this.frameCount%100==0){
      let now = new Date().getTime();
      let diff = now-this.lastTime;
      console.log(100000/diff);
      this.lastTime = now;
    }
    let ctx = this.canvas.getContext("2d")!;
    ctx.fillStyle="#242";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let j=0; j<160; j++)
      for (let i=100; i>0; i--){
        //ctx.save();
        //ctx.translate(this.panX-i*25, this.panY+j*50+40*Math.sin(i/5.0));
        //ctx.scale(0.5, 0.5);
        ctx.drawImage(SaclaySlitherGame.img3, this.panX-i*25-SaclaySlitherGame.img3.width/2, this.panY+j*50+40*Math.sin(i/5.0)-SaclaySlitherGame.img3.width/2);
        //ctx.restore();
      }
    //ctx.globalCompositeOperation = "destination-atop";
    ctx.fillStyle = '#FF4400'
    ctx.drawImage(SaclaySlitherGame.img2, this.panX-SaclaySlitherGame.img2.width/2, this.panY-SaclaySlitherGame.img2.width/2);
    ctx.globalCompositeOperation = 'source-over';
  }

}




function drawBg(n:number){
  //todo
}
function  updateRadar(){

}


//sketch.preload = () => {
  //const BOOP_FILE = require("./boop.mp3").default
  //console.log("sketch.preload() "+BOOP_FILE);
  //boop = new p5.SoundFile(BOOP_FILE, function(){console.log("success")}, function(){console.log("error")}, function(){console.log("loading")})
  //let boop2: p5.SoundFile = new p5.SoundFile("./boop.mp3", function(){console.log("success2")}, function(){console.log("error2")}, function(){console.log("loading2")})
  //SaclaySlitherGame.boop = new p5.SoundFile("./src/boop.mp3", function(){console.log("success3")}, function(){console.log("error3")}, function(){console.log("loading3")})
  //let boop4: p5.SoundFile = new p5.SoundFile("./dist/boop.mp3", function(){console.log("success4")}, function(){console.log("error4")}, function(){console.log("loading4")})

  //boop = sketch.loadSound(BOOP_FILE);
//}

/*sketch.setup=() => {
  const canvasWidth = sketch.windowWidth;
  const canvasHeight = sketch.windowHeight;
  //console.log("sketch.setup() "+canvasWidth+"x"+canvasHeight);
  sketch.createCanvas(canvasWidth, canvasHeight);
  sketch.frameRate(60);

   // intitial creation of the snakes
  ssg0.panX = -canvasWidth/2;
  ssg0.panY = -canvasHeight/2;
  for (let k:number=1; k<SaclaySlitherGame.NBINITIALSNAKES; k++) {
    ssg0.snakes[k] = new Snake(ssg0, ssg0.names[k%ssg0.names.length], 40+50*(k-1),
      Math.floor(300*Math.cos(k*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES)),
      Math.floor(300*Math.sin(k*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES)),
      k%ssg0.colors.length,
      10*Math.cos((k+0)*2*Math.PI/Math.min(SaclaySlitherGame.NBINITIALSNAKES, ssg0.snakes.length)),
      10*Math.sin((k+0)*2*Math.PI/Math.min(SaclaySlitherGame.NBINITIALSNAKES, ssg0.snakes.length)),
      Snake.INITIALSTATE);
  }

  // initial creation of the food
  for (let k:number=0; k<1000; k++) {
    ssg0.foods.push(Food.newFood());
  }

  // we'll need a 2D gaussian set of numbers. let's pre-calculate some
  for (let k:number=0; k<ssg0.gaussR; k++){
    ssg0.gauss[k] =[];
    for (let l:number=0; l<ssg0.gaussR; l++)
      ssg0.gauss[k][l] = Math.exp(-1.0/ssg0.gaussR/ssg0.gaussR*((k-ssg0.gaussR/2)*(k-ssg0.gaussR/2)+(l-ssg0.gaussR/2)*(l-ssg0.gaussR/2)));
  }

  // 4 images
  SaclaySlitherGame.img0 = sketch.createImage(SaclaySlitherGame.IMG_SIZE, SaclaySlitherGame.IMG_SIZE);
  SaclaySlitherGame.img1 = sketch.createImage(SaclaySlitherGame.IMG_SIZE, SaclaySlitherGame.IMG_SIZE);

  SaclaySlitherGame.img2 = sketch.createImage(SaclaySlitherGame.IMG_SIZE+ssg0.gaussR, SaclaySlitherGame.IMG_SIZE+ssg0.gaussR);
  SaclaySlitherGame.img3 = sketch.createImage(SaclaySlitherGame.IMG_SIZE+ssg0.gaussR, SaclaySlitherGame.IMG_SIZE+ssg0.gaussR);

  SaclaySlitherGame.img4 = sketch.createImage(SaclaySlitherGame.IMG_SIZE, SaclaySlitherGame.IMG_SIZE);
  //pg1  = sketch.createGraphics(SaclaySlitherGame.IMG_SIZE, SaclaySlitherGame.IMG_SIZE);
  //pg2  = sketch.createGraphics(SaclaySlitherGame.IMG_SIZE, SaclaySlitherGame.IMG_SIZE);

  SaclaySlitherGame.imgRadar = sketch.createImage(128, 128);
  SaclaySlitherGame.img0.loadPixels();
  SaclaySlitherGame.img1.loadPixels();
  SaclaySlitherGame.img4.loadPixels();
  for (let j:number=0; j < SaclaySlitherGame.img1.height; j++) {
    for (let i:number=0; i < SaclaySlitherGame.img1.width; i++) {
      let d0:number = 0.7*sketch.dist(i, j, R/2, R/2)+0.22*Math.abs(i-R/2)+0.4*Math.abs(j-R/2);
      let d1:number = sketch.dist(i, j, SaclaySlitherGame.img1.width/2, SaclaySlitherGame.img1.height/2);
      let iii:number = Math.round(SaclaySlitherGame.img1.width/2+ (i-SaclaySlitherGame.img1.width/2)* (1+Math.sqrt(d1/SaclaySlitherGame.img1.width/2))/2);
      let jjj:number = Math.round(SaclaySlitherGame.img1.height/2+(j-SaclaySlitherGame.img1.height/2)*(1+Math.sqrt(d1/SaclaySlitherGame.img1.height/2))/2);
      let di:number = (Math.floor(jjj/16)%2)*8;
      let ii:number = iii+di;
      let d3:number = sketch.dist(iii, jjj, iii-ii%16+8, jjj-jjj%16+8);
      let dl:number = sketch.dist(iii, jjj, SaclaySlitherGame.img1.width/3, SaclaySlitherGame.img1.height/3);
      if (d0<R/2-1) {
        SaclaySlitherGame.img0.pixels[i*4+j*R*4+0] = 255-dl*255/R-d3*4;
        SaclaySlitherGame.img0.pixels[i*4+j*R*4+1] = 255-dl*255/R-d3*4;
        SaclaySlitherGame.img0.pixels[i*4+j*R*4+2] = 255-dl*255/R-d3*4;
        SaclaySlitherGame.img0.pixels[i*4+j*R*4+3] = Math.min(255, i*8);
      }
      if (d1<SaclaySlitherGame.img1.width/2-1) {
        SaclaySlitherGame.img1.pixels[i*4+j*SaclaySlitherGame.img1.width*4+0] = 255-dl*255/SaclaySlitherGame.img1.width-d3*4;
        SaclaySlitherGame.img1.pixels[i*4+j*SaclaySlitherGame.img1.width*4+1] = 255-dl*255/SaclaySlitherGame.img1.width-d3*4;
        SaclaySlitherGame.img1.pixels[i*4+j*SaclaySlitherGame.img1.width*4+2] = 255-dl*255/SaclaySlitherGame.img1.width-d3*4;
        SaclaySlitherGame.img1.pixels[i*4+j*SaclaySlitherGame.img1.width*4+3] = 255;
      }
    }
  }

  // food image
  for (let j:number=0; j < SaclaySlitherGame.img4.height; j++) {
    for (let i:number=0; i < SaclaySlitherGame.img4.width; i++) {
      let d0:number = 0.6*sketch.dist(i, j, SaclaySlitherGame.img4.width/2, SaclaySlitherGame.img4.height/2)+0.6*Math.min(Math.abs(i-SaclaySlitherGame.img4.width/2), Math.abs(j-SaclaySlitherGame.img4.height/2));
      let d1:number = sketch.dist(i, j, SaclaySlitherGame.img4.width/3, SaclaySlitherGame.img4.height/3);
      if (d0<SaclaySlitherGame.img4.width/3) {
        SaclaySlitherGame.img4.pixels[i*4+j*SaclaySlitherGame.img4.width*4+0] = 255-d1*255/SaclaySlitherGame.img4.width;
        SaclaySlitherGame.img4.pixels[i*4+j*SaclaySlitherGame.img4.width*4+1] = 255-d1*255/SaclaySlitherGame.img4.width;
        SaclaySlitherGame.img4.pixels[i*4+j*SaclaySlitherGame.img4.width*4+2] = 255-d1*255/SaclaySlitherGame.img4.width;
        SaclaySlitherGame.img4.pixels[i*4+j*SaclaySlitherGame.img4.width*4+3] = 255;
      }
    }
  }


  SaclaySlitherGame.img1.updatePixels();
  SaclaySlitherGame.img4.updatePixels();
  SaclaySlitherGame.img0.updatePixels();

  SaclaySlitherGame.img0.resize(SaclaySlitherGame.IMG_SIZE/2, SaclaySlitherGame.IMG_SIZE/2);
  SaclaySlitherGame.img1.resize(SaclaySlitherGame.IMG_SIZE/2, SaclaySlitherGame.IMG_SIZE/2);
  SaclaySlitherGame.img4.resize(SaclaySlitherGame.IMG_SIZE/4, SaclaySlitherGame.IMG_SIZE/4);
}




sketch.draw = () => {

  sketch.noStroke();

  sketch.imageMode(sketch.CENTER);
  sketch.textAlign(sketch.CENTER, sketch.CENTER);
  sketch.rectMode(sketch.CENTER);

  sketch.push();

  if (ssg0.state==1) {
    // ecran de demarrage
    sketch.stroke(0);
    sketch.fill(255, 224, 192);
    sketch.textSize(20);
    sketch.background(255, 192, 128);
    sketch.rect(sketch.width/2, sketch.height/2+2, 300, 25);
    sketch.fill(0);
    sketch.text("Appuyez sur la touche ENTREE pour commencer", sketch.width/2, sketch.height/3);
    sketch.text("Entrez votre nom :", sketch.width/2, sketch.height/2-25);
    sketch.text(ssg0.names[0], sketch.width/2, sketch.height/2);
    sketch.pop();
    return;
  } else if (ssg0.state>1) {
    // Animation de fin de partie
    sketch.translate(sketch.width/2, sketch.height/2);
    sketch.scale(ssg0.globZoom);
    sketch.translate(-sketch.width/2, -sketch.height/2);
    drawBg((ssg0.state-1.0)/32);
    sketch.fill(0);
    sketch.textSize(20+ssg0.state*2);
    sketch.text("Game OVER", sketch.width/2, sketch.height/2);
    ssg0.state--;
  } else {
    // deplace le serpent 0 en fonction de la souris
    ssg0.snakes[0]!.moveSnake(((sketch.mouseX-sketch.width/2 )/ssg0.globZoom)+sketch.width/2 +ssg0.panX,
                             ((sketch.mouseY-sketch.height/2)/ssg0.globZoom)+sketch.height/2+ssg0.panY);

    // si la position du serpent s'approche du bord, on prefere scoller le jeu plutot que de laisser
    // le serpent s'approcher du bord
    let p = ssg0.snakes[0]!.pos[0];
    let px = (p.x-ssg0.panX-(sketch.width/2))*ssg0.globZoom+(sketch.width/2);
    let py = (p.y-ssg0.panY-(sketch.height/2))*ssg0.globZoom+(sketch.height/2);

    if (px>sketch.width-SaclaySlitherGame.BORDER_SIZE)
      ssg0.panX = -((((sketch.width-SaclaySlitherGame.BORDER_SIZE)-(sketch.width/2))/ssg0.globZoom)+(sketch.width/2)-p.x);
    else if (px<SaclaySlitherGame.BORDER_SIZE)
      ssg0.panX = -((((SaclaySlitherGame.BORDER_SIZE)-(sketch.width/2))/ssg0.globZoom)+(sketch.width/2)-p.x);

    if (py>sketch.height-SaclaySlitherGame.BORDER_SIZE)
      ssg0.panY = -((((sketch.height-SaclaySlitherGame.BORDER_SIZE)-(sketch.height/2))/ssg0.globZoom)+(sketch.height/2)-p.y);
    else if (py<SaclaySlitherGame.BORDER_SIZE)
      ssg0.panY = -((((SaclaySlitherGame.BORDER_SIZE)-(sketch.height/2))/ssg0.globZoom)+(sketch.height/2)-p.y);

    if (ssg0.automaticZoom)
      ssg0.globZoom = 0.75+64.0/(128.0+ssg0.snakes[0]!.size);

    // on commence par dessine le fond
    sketch.translate(sketch.width/2, sketch.height/2);
    sketch.scale(ssg0.globZoom);
    sketch.translate(-sketch.width/2, -sketch.height/2);
    drawBg(1.0);
  }

  // teste si le serpent 0 meurt
  if (ssg0.snakes[0]!=null && ssg0.snakes[0]!.testCollision()) {
    // cree de la nourriture a la place de mon corps
    for (let i=0; i<ssg0.snakes[0]!.pos.length; i++) {
      let p = ssg0.snakes[0]!.pos[i];
      let f = new Food(p.x, p.y, 0);
      f.rd = 10;
      if (i%2==0) ssg0.foods.push(f);
    }
    // tue le serpent
    ssg0.snakes[0] = null;
    ssg0.state = 32;
  }

  // deplace les autres serpents
  for (let k=1; k<ssg0.snakes.length; k++){
    if (ssg0.snakes[k]!=null) {
      let dx = ssg0.snakes[k]!.dirX;
      let dy = ssg0.snakes[k]!.dirY;
      let x  = ssg0.snakes[k]!.pos[0].x;
      let y  = ssg0.snakes[k]!.pos[0].y;
      let dd = sketch.dist(0, 0, x, y);

      let ndx = sketch.random(10.0, 15)*dx + sketch.random(-8, 8)*dy;
      let ndy = sketch.random(10.0, 15)*dy - sketch.random(-8, 8)*dx;
      if (dd>1000) {
        ndx += -x*(dd-1000)/dd;
        ndy += -y*(dd-1000)/dd;
      }

      if (ssg0.snakes[k]!.state==Snake.AVOIDBORDER && ssg0.snakes[k]!.closestSnakeP!=null){
        let d = sketch.dist(0, 0, x, y);
        let ddx = -x/d*20;
        let ddy = -y/d*20;
        let dda = Math.atan2(ddy, ddx);
        ssg0.snakes[k]!.moveSnake( x+20*Math.cos(dda), y+20*Math.sin(dda));
      } else if (ssg0.snakes[k]!.state==Snake.AVOIDCLOSEST && ssg0.snakes[k]!.closestSnakeP!=null){
        let p = ssg0.snakes[k]!.closestSnakeP!;
        let ddx = x-p.x;
        let ddy = y-p.y;
        let dda = Math.atan2(ddy, ddx);
        ssg0.snakes[k]!.moveSnake(x+20*Math.cos(dda), y+20*Math.sin(dda));
      } else if (ssg0.snakes[k]!.state==Snake.AVOIDWORST && ssg0.snakes[k]!.closestBadSnakeP!=null){
        let p = ssg0.snakes[k]!.closestBadSnakeP!;
        let ddx = x-p.x;
        let ddy = y-p.y;
        let dda = Math.atan2(ddy, ddx);
        ssg0.snakes[k]!.moveSnake(x+20*Math.cos(dda), y+20*Math.sin(dda));
      } else if (ssg0.snakes[k]!.state==Snake.GOBESTFOOD && ssg0.snakes[k]!.bestFood!=null){
        let f = ssg0.snakes[k]!.bestFood!;
        //console.log(k+"_"+snakes[k].name+" @"+x+","+y+" goes to "+f.x+", "+f.y);
        ssg0.snakes[k]!.moveSnake( f.x, f.y);
      } else if (ssg0.snakes[k]!.state==Snake.GOCLOSESTFOOD && ssg0.snakes[k]!.closestFood!=null){
        let f = ssg0.snakes[k]!.closestFood!;
        //console.log(k+"_"+snakes[k].name+" @"+x+","+y+" goes to "+f.x+", "+f.y);
        ssg0.snakes[k]!.moveSnake( f.x, f.y);
      } else if (ssg0.snakes[k]!.state==Snake.FASTSTRAIGHT){
        if (ssg0.snakes[k]!.speed<SaclaySlitherGame.MAX_SPEED && ssg0.snakes[k]!.weight>40+SaclaySlitherGame.LOOSEWEIGHT)
          ssg0.snakes[k]!.speed=SaclaySlitherGame.MAX_SPEED;
        ssg0.snakes[k]!.moveSnake( x+dx, y+dy);
      } else if (ssg0.snakes[k]!.state==Snake.ROT){
        ssg0.snakes[k]!.moveSnake( x+ndx, y+ndy);
      } else if (ssg0.snakes[k]!.state==Snake.RANDWALK){
        ssg0.snakes[k]!.moveSnake( x+10*dx-100*dy, y+10*dy+100*dx);
      } else {
        ssg0.snakes[k]!.moveSnake( x+dx, y+dy);
        //console.log(k+"_"+snakes[k].name+" is lost !!! ");
      }

      if (ssg0.snakes[k]!.testCollision()) {
        console.log(ssg0.snakes[k]!.name+" is dead");
        for (let i=0; i<ssg0.snakes[k]!.pos.length; i++) {
          let p = ssg0.snakes[k]!.pos[i];
          let f = new Food(p.x, p.y, 0);
          f.rd = 10;
          if (i%2==0) ssg0.foods.push(f);
        }
        let a = sketch.random(0, 10000)*Math.PI/5000;
        let d = sketch.random(0, SaclaySlitherGame.WORLDRADIUS);
        ssg0.snakes[k] = new Snake(ssg0, ssg0.names[k%ssg0.names.length], 40,
                                   Math.floor(d*Math.cos(a)), Math.floor(d*Math.sin(a)),
                                   k%ssg0.colors.length, 10* Math.cos(k* Math.PI/3), 10* Math.sin(k* Math.PI/3), Snake.INITIALSTATE);
      }

      //console.log(snakes[k].name+" @ "+snakes[k].state+" cBSp="+snakes[k].closestBadSnakeP.x+", "+snakes[k].closestBadSnakeP.y);

      // Apres le deplacement on evalue si c'est pas le bon moment de changer de strategie
      if (ssg0.snakes[k]!.state!=Snake.AVOIDBORDER) {
        let h = ssg0.snakes[k]!.pos[0];
        let d = sketch.dist(0, 0, h.x, h.y);
        if (d>SaclaySlitherGame.WORLDRADIUS-100)
          ssg0.snakes[k]!.state=Snake.AVOIDBORDER;/////
      } else if (ssg0.snakes[k]!.state==Snake.AVOIDBORDER) {
        let h = ssg0.snakes[k]!.pos[0];
        let d = sketch.dist(0, 0, h.x, h.y);
        if (d<SaclaySlitherGame.WORLDRADIUS-200)
          ssg0.snakes[k]!.state=Snake.GOBESTFOOD;/////
      } else if (ssg0.snakes[k]!.state==Snake.AVOIDWORST && ssg0.snakes[k]!.closestBadSnakeP!=null){
        let p = ssg0.snakes[k]!.closestBadSnakeP!;
        let d = ssg0.snakes[k]!.dclosestBadSnake;
        console.log(ssg0.snakes[k]!.name+" would not be affraid anymore if sketch.dist to "+ssg0.snakes[k]!.closestBadSnake!.name+" ="+d+">400   p="+p.x+","+p.y);
        if (d>200){
          ssg0.snakes[k]!.state=Snake.GOBESTFOOD;/////
          console.log(ssg0.snakes[k]!.name+" is not affraid anymore");
        }
      } else if (ssg0.snakes[k]!.state==Snake.AVOIDCLOSEST && ssg0.snakes[k]!.closestSnakeP!=null){
        let p =ssg0.snakes[k]!.closestSnakeP!;
        if (ssg0.snakes[k]!.closestSnake==ssg0.snakes[0]!) console.log(ssg0.snakes[k]!.name+" is affraid of me point["+k+"]="+p.x+","+p.y); //+" sketch.dist="+dd +"  DIFFANGLE="+da+" => "+(dd*sin(da/2+1))

        let d = sketch.dist(x, y, p.x, p.y);
        if (d>300)
          ssg0.snakes[k]!.state=Snake.GOBESTFOOD;/////
      } else if (ssg0.snakes[k]!.state==Snake.AVOIDWORST && ssg0.snakes[k]!.closestBadSnakeP==null){
        ssg0.snakes[k]!.state=Snake.GOBESTFOOD;/////
        console.log(ssg0.snakes[k]!.name+" is not affraid anymore");
      } else if (ssg0.snakes[k]!.state==Snake.GOBESTFOOD && ssg0.snakes[k]!.closestBadSnakeP!=null){
        let p = ssg0.snakes[k]!.closestBadSnakeP!;
        let d = ssg0.snakes[k]!.dclosestBadSnake;
        if (d<100){
          console.log(ssg0.snakes[k]!.name+" is now affraid of "+ssg0.snakes[k]!.closestBadSnake!.name+" because "+d+"<200  p="+p.x+","+p.y);
          ssg0.snakes[k]!.state=Snake.AVOIDWORST;///
        }
      }
    }
  }



  // Affichage de la nourriture
  for (let k=0; k<ssg0.foods.length; k++) {
    let f = ssg0.foods[k];
    sketch.push();
    sketch.translate(f.x-ssg0.panX+5*Math.cos(f.x+sketch.frameCount/50.0), f.y-ssg0.panY+5*Math.sin(f.y+sketch.frameCount/50.0));
    sketch.rotate(6*sketch.noise(f.x+Math.cos(sketch.frameCount/50.0), f.y+Math.sin(sketch.frameCount/50.0)));
    sketch.scale(0.2+Math.sqrt(f.rd)/3.0);

    if (ssg0.state>1)
      sketch.scale((ssg0.state-1.0)/32);
    sketch.tint(255-(255-ssg0.colors[f.type][0][0])/2,
      255-(255-ssg0.colors[f.type][0][1])/2,
      255-(255-ssg0.colors[f.type][0][2])/2);
    sketch.image(SaclaySlitherGame.img4, 0, 0);
    sketch.pop();
  }

  // affichage des serpents
  if (ssg0.state>1) {
    for (let k=0; k<ssg0.snakes.length; k++) {
      if (ssg0.snakes[k]!=null)
        ssg0.snakes[k]!.drawSnake((ssg0.state-1.0)/32);
    }
  } else {
    for (let k=0; k<ssg0.snakes.length; k++) {
      if (ssg0.snakes[k]!=null)
        ssg0.snakes[k]!.drawSnake(1.0);
    }
  }

  sketch.pop();


  // bordure
  sketch.strokeWeight(4);
  sketch.noFill();
  if (SaclaySlitherGame.BORDER_SIZE<sketch.width/2) {
    for (let dk=0; dk<sketch.width/4-SaclaySlitherGame.BORDER_SIZE/2; dk+=4) {
      sketch.stroke(0, 128-dk*128/(sketch.width/4-SaclaySlitherGame.BORDER_SIZE/2));
      sketch.rect(SaclaySlitherGame.BORDER_SIZE-dk, SaclaySlitherGame.BORDER_SIZE-dk, sketch.width-2*(SaclaySlitherGame.BORDER_SIZE-dk), sketch.height-2*(SaclaySlitherGame.BORDER_SIZE-dk));
    }
  }
  sketch.strokeWeight(1);

  // score
  sketch.fill(0);
  sketch.textAlign(sketch.LEFT, sketch.BOTTOM);
  if (ssg0.snakes[0]!=null) {
    sketch.push();
    sketch.translate(20, sketch.height-20);
    //tint(snakes[0].r, snakes[0].g, snakes[0].b);
    sketch.scale(0.5);
    sketch.image(SaclaySlitherGame.img0, 0, 0);
    sketch.scale(2.0);
    sketch.text(ssg0.snakes[0]!.name+" "+(ssg0.snakes[0]!.weight-30), 0, 0);
    sketch.pop();
    sketch.noTint();
  }

  // meilleurs
  sketch.rectMode(sketch.CORNER);
  //sketch.textFont(font0);
  sketch.textAlign(sketch.RIGHT, sketch.BOTTOM);
  let maxw = 0;
  let slist:string[] = []; // ssg0.snakes.length
  for (let i=0; i<ssg0.snakes.length; i++) {
    if (ssg0.snakes[i]!=null)
      slist[i] = sketch.nf(ssg0.snakes[i]!.weight-30, 6)+"_"+i+"%"+ssg0.snakes[i]!.name;
    else
      slist[i] = " 0_-1% ";
    maxw = Math.max(maxw, sketch.textWidth(slist[i]));
  }

  slist = sketch.sort(slist);
  for (let i=Math.max(0,slist.length-10); i<slist.length; i++) {
    let ii     = i-(ssg0.snakes.length-10);
    let score  = parseInt(slist[i].substring(0, slist[i].indexOf("_")));
    let index  = parseInt(slist[i].substring(slist[i].indexOf("_")+1, slist[i].indexOf("%")));
    let name = slist[i].substring(slist[i].indexOf("%")+1);
    if(index>=0){
      let  s   = ssg0.snakes[index]!;

      sketch.fill(ssg0.colors[s.type][0][0], ssg0.colors[s.type][0][1], ssg0.colors[s.type][0][2], 96);
      if (index==0) {
       // sketch.textFont(font1);
        sketch.stroke(255);
      } else {
       // sketch.textFont(font0);
        sketch.noStroke();
      }
      sketch.rect(sketch.width-5-maxw, 185-ii*20, maxw, 19);

      sketch.fill(0);
      sketch.textAlign(sketch.RIGHT, sketch.BOTTOM);
      sketch.text(score, sketch.width-5, 205-ii*20);
      sketch.textAlign(sketch.LEFT, sketch.BOTTOM);
      sketch.text(name, sketch.width-5-maxw, 205-ii*20);
    }
  }
  //textFont(font0);

   //dessin du radar
  if(sketch.frameCount%25==0)
    updateRadar();
  sketch.image(SaclaySlitherGame.imgRadar, sketch.width-74, sketch.height-74);
  sketch.noFill();
  sketch.stroke(255, 255, 0);
  sketch.ellipse(sketch.width-74, sketch.height-74, 128, 128);
  sketch.stroke(255, 255, 0, 64);
  sketch.line(sketch.width-74, sketch.height-74, sketch.width-74+60*Math.cos(sketch.frameCount/12.5*Math.PI), sketch.height-74+60*Math.sin(sketch.frameCount/12.5*Math.PI));

   sketch.image(SaclaySlitherGame.img0, 10 ,10);
   sketch.image(SaclaySlitherGame.img1, 250 ,10);

}
sketch.mousePressed = () => {
  //console.log("boop.play()");
  SaclaySlitherGame.boop.play();
}

sketch.keyPressed = () => {
  console.log("keyPressed "+ssg0.state+" "+sketch.keyCode);
  if (ssg0.state==1 && sketch.keyCode!=10 && sketch.keyCode!=13){
    if (sketch.keyCode==8 && ssg0.names[0].length>0)
      ssg0.names[0] = ssg0.names[0].substring(0, ssg0.names[0].length-1);
    else if (((sketch.key>='A' && sketch.key<='Z')||(sketch.key>='0' && sketch.key<='9')||(sketch.key>='a' && sketch.key<='z')||(sketch.key==' ')) && ssg0.names[0].length<24)
      ssg0.names[0] = ssg0.names[0]+sketch.key;
  } else if (ssg0.state==1 && (sketch.keyCode==10 || sketch.keyCode==13)) {
    ssg0.snakes[0] = new Snake(ssg0, ssg0.names[0], 240, 0, 0 , 0, 10, 0, Snake.FREE);
    ssg0.state = 0;
    console.log("GO");
  } else if (sketch.key==' ' && ssg0.snakes[0]!=null && ssg0.snakes[0]!.weight>40+SaclaySlitherGame.LOOSEWEIGHT)
    ssg0.snakes[0]!.speed = SaclaySlitherGame.MAX_SPEED;
  else if (sketch.keyCode==37)
    ssg0.panX+=1;
  else if (sketch.keyCode==38)
    ssg0.panY+=1;
  else if (sketch.keyCode==39)
    ssg0.panX-=1;
  else if (sketch.keyCode==40)
    ssg0.panY-=1;
  else if (sketch.key=='n'){
    ssg0.globZoom*=0.95;
    ssg0.automaticZoom = false;
  } else if (sketch.key=='m'){
    ssg0.globZoom*=1.05;
    ssg0.automaticZoom = false;
  }
}

sketch.keyReleased = () => {
  if (ssg0.snakes[0]!=null && sketch.key==' ')
    ssg0.snakes[0]!.speed = SaclaySlitherGame.PREF_SPEED;
}*/

function createImage(w:number, h:number):HTMLCanvasElement{
  let can = <HTMLCanvasElement>document.createElement('canvas');
  can.width = w;
  can.height = h;
  return can;
}

export function dist(x1:number, y1:number, x2:number, y2:number):number{
  let dx = x2-x1;
  let dy = y2-y1;
  return Math.sqrt(dx*dx+dy*dy);
}





window.onload = () => {
  console.log("test2 !");

  var ssg0 = new SaclaySlitherGame();
}

