import * as PIXI from 'pixi.js'

require ('./PixiSnake')
import {Point, Food, Snake, SnakeStrategy} from './Snake';
import {PixiFood, PixiSnake}               from './PixiSnake';
import {SaclaySlitherGame}                 from './SaclaySlitherGame';
import {dist, keyboard}                    from './util';



export class PixiSaclaySlitherGame extends SaclaySlitherGame{

  // assets
  static texhead: PIXI.Texture;
  static texbody: PIXI.Texture;

  static texfood: PIXI.Texture;

  app:            PIXI.Application;
  foodLayer:      PIXI.Container;

  socket:         WebSocket|null  = null;
  socketReq:number =0;
  // 0 =waiting for nothing, 1=waiting for new snakes, 2=waiting for new food, 3=waiting for snake update

  ctrlSnake :     PixiSnake|null = null;
  run:            boolean = false;


  constructor(name0:string, teamId:number) {
    super()
    this.panX = -window.innerWidth/2;
    this.panY = -window.innerHeight/2;

    let url = window.location.href.toString();
    if (url.toLowerCase().indexOf("debug")>=0){
      console.log("... run debug");

      this.app = new PIXI.Application(window.innerWidth, window.innerHeight-20, {backgroundColor : 0x001000, autoStart : false});

      document.body.appendChild(this.app.view);
      document.body.appendChild(document.createElement('br'));
      window.addEventListener("resize", (e:any) =>{
        this.app.renderer.resize(window.innerWidth, window.innerHeight-20);
      });

      let but0 = <HTMLButtonElement>document.createElement('button');
      but0.setAttribute("type","button");
      but0.textContent = "►";
      but0.addEventListener("click", (e:MouseEvent) =>{
        //this.socket.close();
        console.log("click");
        if (this.run) {
          this.app.stop();
          but0.textContent = "►";
          this.socket!.send("pause");
        } else {
          this.app.start()
          but0.textContent = "||";
          this.socket!.send("play");
        }
        this.run = !this.run;
      });
      let but1 = <HTMLButtonElement>document.createElement('button');
      but1.setAttribute("type","button");
      but1.textContent = "render";
      but1.addEventListener("click", (e:MouseEvent) =>{
        this.updateBeforeRender()
        this.app.render();
      });
      let but2 = <HTMLButtonElement>document.createElement('button');
      but2.setAttribute("type","button");
      but2.textContent = "Reset Server";
      but2.addEventListener("click", (e:MouseEvent) =>{
        this.socket!.send("reset");
      });
      let but3 = <HTMLButtonElement>document.createElement('button');
      but3.setAttribute("type","button");
      but3.textContent = "send update";
      but3.addEventListener("click", (e:MouseEvent) =>{
        this.sendUpdateToServer(true);
      });
      let but4 = <HTMLButtonElement>document.createElement('button');
      but4.setAttribute("type","button");
      but4.textContent = "server update";
      but4.addEventListener("click", (e:MouseEvent) =>{
        this.socket!.send("update");
      });



      document.body.appendChild(but0);
      document.body.appendChild(but1);
      document.body.appendChild(but2);
      document.body.appendChild(but3);
      document.body.appendChild(but4);
    } else {
      console.log("... run normal!");
      this.app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x001000});
      document.body.appendChild(this.app.view);
      document.body.appendChild(document.createElement('br'));
      window.addEventListener("resize", (e:any) =>{
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
      });
    }

    this.initTextures();
    this.initRenderingLoop();

    // While server does not work, let's create snakes here
    /*for (let k:number=0; k<SaclaySlitherGame.NBINITIALSNAKES; k++) {
      this.snakes[k] = new PixiSnake(this, this.names[k%this.names.length], Math.max(40, 400+50*(k-1)),
        Math.floor(200*Math.cos(k*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES)),
        Math.floor(200*Math.sin(k*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES)),
        k%SaclaySlitherGame.colors.length,
        SaclaySlitherGame.SPACEBETWEENSEGMENTS*Math.cos((k+0)*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES),
        SaclaySlitherGame.SPACEBETWEENSEGMENTS*Math.sin((k+0)*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES),
        SnakeStrategy.GOBESTFOOD);
      this.app.stage.addChild((<PixiSnake>this.snakes[k])!.container);
    }*/
    //this.ctrlSnake = new PixiSnake(this, "HERO", 500, 0, 0, 0, 10, 0, SnakeStrategy.GOBESTFOOD)
    //this.snakes.push(this.ctrlSnake);
    //this.app.stage.addChild(this.ctrlSnake.container);


    this.foodLayer = new PIXI.Container();
    this.app.stage.addChild(this.foodLayer);

    this.app.stage.interactive = true;
    this.app.stage.hitArea = new PIXI.Rectangle(0, 0, window.innerWidth, window.innerHeight);

    this.initInteraction();
    this.initNetwork(name0, teamId);
  }



  initInteraction(){
    this.app.stage.on('pointerdown', () => {
      console.log('pointerdown');
    });
    this.app.stage.on('mousedown', () => {
      console.log('mousedown');
    });

    this.app.stage.on('mousemove', (e: PIXI.interaction.InteractionEvent) => {
      //???e.data.getLocalPosition(this.parent, this.lastDragPos);
      //console.log(e.data.global.x+", "+e.data.global.y);
      this.targetX = Math.floor(e.data.global.x+this.panX);
      this.targetY = Math.floor(e.data.global.y+this.panY);
    });

    let q = keyboard(32);
    q.press = () => {
      if (this.ctrlSnake)
        this.ctrlSnake.speed = SaclaySlitherGame.MAX_SPEED;
    };
    q.release = () => {
      if (this.ctrlSnake)
        this.ctrlSnake.speed = SaclaySlitherGame.PREF_SPEED;
    };

    if (window.location.href.toString().toLowerCase().indexOf("debug")>=0){
      let l = keyboard(37);
      let u = keyboard(38);
      let r = keyboard(39);
      let d = keyboard(40);

      let u1 = keyboard(109);
      let u2 = keyboard(189);

      let z1 = keyboard(107);
      let z2 = keyboard(187);

      l.press = () => {this.panX-=50;this.updateBeforeRender();this.app.render();};
      u.press = () => {this.panY-=50;this.updateBeforeRender();this.app.render();};
      r.press = () => {this.panX+=50;this.updateBeforeRender();this.app.render();};
      d.press = () => {this.panY+=50;this.updateBeforeRender();this.app.render();};

      u1.press = () => {this.globZoom*=0.8;this.updateBeforeRender();this.app.render();};
      u2.press = () => {this.globZoom*=0.8;this.updateBeforeRender();this.app.render();};
      z1.press = () => {this.globZoom*=1.25;this.updateBeforeRender();this.app.render();};
      z2.press = () => {this.globZoom*=1.25;this.updateBeforeRender();this.app.render();};
    }
  }



  initNetwork(name0:string, teamId:number){
    var loc = window.location.hostname;
   // if (loc.indexOf(":")>=0)loc = loc.substring(0)
    console.log("talking back to the server ..."+loc);

    //this.socket = new WebSocket('ws://192.168.1.17:9090/');
    this.socket = new WebSocket('ws://'+loc+':9090/');

    this.socket.binaryType = 'arraybuffer';
    this.socket.onopen = () => {
      //console.log("say hello ...");
      this.socket!.send("Hello, I am "+name0+";"+teamId);
      //console.log("say hello done");
    }

    this.socket.onmessage = (msg:MessageEvent) => {
      //console.log("receive msg ... "+this.socketReq);

      if (typeof msg.data == "string"){
        //console.log("Receive msg : "+msg.data);
        if (msg.data.startsWith("Hello back ")){
          this.sendSnakesRequestToServer();
          if (window.location.href.toString().toLowerCase().indexOf("debug")>=0)
            this.socket!.send("pause");
        } else if (msg.data.startsWith("MOVE ") && this.ctrlSnake){
          let infos = msg.data.split(" ");
          this.ctrlSnake!.moveSnake(parseFloat(infos[3]), parseFloat(infos[4]))
        }
      } else if (this.socketReq==1){
        let buffer = new Float32Array(msg.data);
        let nbsnakes = buffer[0];
        let nbfoods  = buffer[1];
        let sumsize  = buffer[2];

        console.log("get "+nbsnakes+" snakes and "+nbfoods+" foods and sumsize="+sumsize+" buffersize = "+buffer.length);

        // get the snakes
        for (let i=0; i < nbsnakes; i++) {
          let size   = buffer[3+i*7+0]
          let weight = buffer[3+i*7+1]
          let dirX   = buffer[3+i*7+2]
          let dirY   = buffer[3+i*7+3]
          let type   = buffer[3+i*7+4]
          let x0     = buffer[3+i*7+5]
          let y0     = buffer[3+i*7+6]
          let name:string;

          if (i==nbsnakes-1){
            this.panX = x0-window.innerWidth/2
            this.panY = y0-window.innerHeight/2

            name = name0;
            console.log("  "+name+" "+ x0+" "+y0+" panx = "+x0+"-"+(window.innerWidth/2)+"="+this.panX)
          } else {
            name = this.names[i%this.names.length];
            console.log("  "+name+" "+ x0+" "+y0+" type = "+type)
          }

          this.snakes[i] = new PixiSnake(this, name, weight,
            x0,
            y0,
            type,
            dirX,
            dirY,
            SnakeStrategy.GOBESTFOOD);
          this.app.stage.addChild((<PixiSnake>this.snakes[i])!.container);
          this.snakes.push(this.snakes[i]);
        }

        // position exactly each segment of the snakes
        let arrpos = 3+nbsnakes*7;
        for (let i=0; i < nbsnakes; i++) {
          let subarr = buffer.subarray(arrpos, arrpos+this.snakes[i]!.size*2)
          this.snakes[i]!.setLocations(subarr);
          arrpos += this.snakes[i]!.size*2;
        }

        console.log(this.snakes[10]!.name+" "+this.snakes[10]!.pos[0].x.toFixed(2)+","+this.snakes[10]!.pos[0].y.toFixed(2)
                                         +" "+this.snakes[10]!.pos[1].x.toFixed(2)+","+this.snakes[10]!.pos[1].y.toFixed(2)
                                         +" "+this.snakes[10]!.pos[2].x.toFixed(2)+","+this.snakes[10]!.pos[2].y.toFixed(2)
                                         +" ... "+this.snakes[10]!.pos[this.snakes[10]!.pos.length-1].x.toFixed(2)+","+this.snakes[10]!.pos[this.snakes[10]!.pos.length-1].y.toFixed(2))

        let minFoodX = 0;
        let maxFoodX = 0;
        for (let i=0; i < nbfoods; i++) {
          let x  = buffer[arrpos+0]
          let y  = buffer[arrpos+1]
          let rd = buffer[arrpos+2]
          arrpos+=3
          // if (isNaN(x)) console.log("problem food #"+i)
          this.foods[i] = PixiFood.newFood(this);
          this.foods[i].x = x;
          this.foods[i].y = y;
          if (i==0) {
            minFoodX = x;
            maxFoodX = x;
          } else {
            minFoodX = Math.min(minFoodX, x);
            maxFoodX = Math.max(maxFoodX, x);
          }
          this.foods[i].rd = rd;
          this.foodLayer.addChild((<PixiFood>this.foods[i]).sprite);
        }

        console.log(" food "+sumsize+"..%.."+buffer.length+" minmax = "+minFoodX+"-"+maxFoodX)

        // The last created snake must be me because this communication only happens when we get connected
        this.ctrlSnake = <PixiSnake>this.snakes[this.snakes.length-1]!
        this.ctrlSnake.name = name0
        this.socketReq = 0
      } else if (this.socketReq==3){
        let buffer = new Float32Array(msg.data);

        for (var i=2; i < buffer.length; i+=8) {
          let k = Math.floor((i-2)/8);
          if (this.snakes[k] != this.ctrlSnake) {
            let dirX:number   = buffer[i+0]
            let dirY:number   = buffer[i+1]
            let x0:number     = buffer[i+2]
            let y0:number     = buffer[i+3]
            let xn:number     = buffer[i+4]
            let yn:number     = buffer[i+5]
            let speed:number  = buffer[i+6]
            let weight:number = buffer[i+7]


            this.snakes[k]!.speed = speed;
            if (weight!=this.snakes[k]!.weight)
              this.snakes[k]!.setWeight(weight)
            this.snakes[k]!.moveSnake(dirX, dirY);
            this.snakes[k]!.translate(x0, y0, xn, yn)
          }
          //if (k==this.snakes.length-1)
            //console.log(k+"="+this.snakes[k]!.name+" => "+buffer[i]+","+buffer[i+1]);
          //  console.log(k+"="+this.snakes[k]!.name+" move toward "+buffer[i].toFixed(2)+","+buffer[i+1].toFixed(2)+" => server="+
          //                     buffer[i+2].toFixed(2)+","+buffer[i+3].toFixed(2)+" % client="+this.snakes[k]!.pos[0].x.toFixed(2)+","+this.snakes[k]!.pos[0].y.toFixed(2)+" it was at "+buffer[i+4].toFixed(2)+","+buffer[i+5].toFixed(2));
        }
        this.socketReq = 0
      }

      //console.log("received");
    };
  }



  initTextures(){
    //console.log("initTextures");
    let R = SaclaySlitherGame.IMG_SIZE;
    let img0 = createImage(R, R);
    let img1 = createImage(R, R);
    let img4 = createImage(R, R);

    let ctx0 = img0.getContext("2d")!;
    let ctx1 = img1.getContext("2d")!;

    let ctx4 = img4.getContext("2d")!;

    let imgRadar = createImage(128, 128);
    let imData0 = ctx0.createImageData(R, R);
    let imData1 = ctx1.createImageData(R, R);
    let imData4 = ctx4.createImageData(R, R);

    for (let j:number=0; j < R; j++) {
      for (let i:number=0; i < R; i++) {
        let d0: number = 0.7*dist(i, j, R/2, R/2)+0.22*Math.abs(i-R/2)+0.4*Math.abs(j-R/2);
        let d1: number = dist(i, j, R/2, R/2);
        let iii:number = Math.round(R/2+(i-R/2)* (1+2*Math.sqrt(d1/R/2))/3);
        let jjj:number = Math.round(R/2+(j-R/2)* (1+2*Math.sqrt(d1/R/2))/3);
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
          imData1.data[i*4+j*R*4+3] = Math.max(0, Math.min(255, (R/2-d1)*(255*R/4)/R));
        }
      }
    }
    // food image
    for (let j:number=0; j < R; j++) {
      for (let i:number=0; i < R; i++) {
        let d0:number = 0.6*dist(i, j, R/2, R/2)+0.6*Math.min(Math.abs(i-R/2), Math.abs(j-R/2));
        let d1:number = dist(i, j, R/3, R/3);
        if (d0<R/3) {
          imData4.data[i*4+j*R*4+0] = 255-d1*255/R;
          imData4.data[i*4+j*R*4+1] = 255-d1*255/R;
          imData4.data[i*4+j*R*4+2] = 255-d1*255/R;
          imData4.data[i*4+j*R*4+3] = 255;
        }
      }
    }
    ctx0.putImageData(imData0, 0, 0);
    ctx1.putImageData(imData1, 0, 0);
    ctx4.putImageData(imData4, 0, 0);

    // create Sprites for the food
    let foods:PIXI.Sprite[] = [];
    PixiSaclaySlitherGame.texfood = PIXI.Texture.fromCanvas(img4)
    PixiSaclaySlitherGame.texhead = PIXI.Texture.fromCanvas(img0)
    PixiSaclaySlitherGame.texbody = PIXI.Texture.fromCanvas(img1)

    this.app.ticker.speed = 0.2;
  }



  updateBeforeRender(){
    //console.log("updateBeforeRender pan="+this.panX+","+this.panY)

    if (this.ctrlSnake){
      let p = this.ctrlSnake.pos[0];
      let px = (p.x-this.panX-(window.innerWidth/2))*this.globZoom+(window.innerWidth/2);
      let py = (p.y-this.panY-(window.innerHeight/2))*this.globZoom+(window.innerHeight/2);

      let oldPanX = this.panX;
      let oldPanY = this.panY;

      if (px>window.innerWidth-SaclaySlitherGame.BORDER_SIZE)
        this.panX = -((((window.innerWidth-SaclaySlitherGame.BORDER_SIZE)-(window.innerWidth/2))/this.globZoom)+(window.innerWidth/2)-p.x);
      else if (px<SaclaySlitherGame.BORDER_SIZE)
        this.panX = -((((SaclaySlitherGame.BORDER_SIZE)-(window.innerWidth/2))/this.globZoom)+(window.innerWidth/2)-p.x);

      if (py>window.innerHeight-SaclaySlitherGame.BORDER_SIZE)
        this.panY = -((((window.innerHeight-SaclaySlitherGame.BORDER_SIZE)-(window.innerHeight/2))/this.globZoom)+(window.innerHeight/2)-p.y);
      else if (py<SaclaySlitherGame.BORDER_SIZE)
        this.panY = -((((SaclaySlitherGame.BORDER_SIZE)-(window.innerHeight/2))/this.globZoom)+(window.innerHeight/2)-p.y);

      this.targetX += Math.floor(this.panX-oldPanX);
      this.targetY += Math.floor(this.panY-oldPanY);

      if (this.automaticZoom)
        this.globZoom = 0.75+64.0/(128.0+this.snakes[0]!.size);
    //console.log("   pan="+this.panX+","+this.panY)

     this.foodLayer.x = window.innerWidth/2-this.panX;
     this.foodLayer.y = window.innerHeight/2-this.panY;

      for (let k in this.snakes)
        if (this.snakes[k]!=null)
          (<PixiSnake>this.snakes[k])!.drawSnake(1);
    }
  }



  sendUpdateToServer(debug:boolean){
    if (this.socketReq!=0)
      console.log("PROBLEM, WANT TO ASK SOMETHING TO THE SERVER BUT PREVIOUS REQUEST ISN'T FINISH")

    if (debug)
      console.log("sendUpdateToServer "+this.panX+","+this.panY);

    if (!this.ctrlSnake){
      console.log("PROBLEM, WANT UPDATE WHILE WE ARE DEAD")

    } else {
      this.socketReq = 3;
      var floatArray = new Float32Array(6);
        //console.log(this.ctrlSnake.name+" "+this.ctrlSnake.pos[0].x+","+this.ctrlSnake.pos[0].y+ " moving toward "+this.targetX.toFixed(2)+","+this.targetY.toFixed(2));
        floatArray[0] = this.targetX;
        floatArray[1] = this.targetY;
        floatArray[2] = this.ctrlSnake.speed;
        floatArray[3] = this.panX;
        floatArray[4] = this.panY;
        floatArray[5] = Math.max(window.innerWidth, window.innerHeight);
      this.socket!.send(floatArray.buffer);
    }
  }

  sendSnakesRequestToServer(){
    //console.log("sendSnakesRequestToServer");
    if (this.socketReq!=0)
      console.log("PROBLEM, WANT TO ASK SOMETHING TO THE SERVER BUT PREVIOUS REQUEST ISN'T FINISH")

    this.socketReq = 1;
    var floatArray = new Float32Array(4);
      //console.log("ask for snakes within "+this.panX+","+this.panY+" ... "+(this.panX+window.innerWidth)+","+(this.panY+window.innerHeight));
      floatArray[0] = this.panX;
      floatArray[1] = this.panY;
      floatArray[2] = window.innerWidth;
      floatArray[3] = window.innerHeight;
    this.socket!.send(floatArray.buffer);
  }

  initRenderingLoop(){
    // Listen for animate update
    this.app.ticker.add((delta) => {
      this.sendUpdateToServer(false);
      this.updateBeforeRender();
    });
  }
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

let selTeam:string = "0";

window.onload = () => {
  let gdiv  = <HTMLDivElement>document.createElement('div')
  let ldiv  = <HTMLDivElement>document.createElement('div')
  let opts = <HTMLTableElement>document.createElement('table')
  let row  = <HTMLTableRowElement>document.createElement('tr')

  let inp = <HTMLInputElement>document.createElement('input')
  document.body.setAttribute("style","background: radial-gradient(#444, #000);");
  gdiv.setAttribute("style","width:100%;height:100%;background-image:url('imgs/bg.png')");
  inp.setAttribute("type","text");
  inp.setAttribute("style","font-family: 'Courier New', Courier, monospace;background: radial-gradient(#fff, #aaa);border-radius:5px;background-color:#FFF;font-size:40px");
  ldiv.setAttribute("style","border:1px solid black;background: radial-gradient(#000, #444);border-radius:5px;padding:5px;box-shadow: 0px 0px 20px rgba(255,192,128,0.95);background-color:#222;position:absolute;top:50%;left:50%;transform: translate(-50%,-50%);");
  inp.setAttribute("id","snakename");
  inp.addEventListener('change', (e:any)=>{
    document.body.removeChild(gdiv);
    let ssg0 = new PixiSaclaySlitherGame(inp.value, parseInt(selTeam));
  })

  for (let i=0; i< SaclaySlitherGame.colors.length; i++){
    let labi  = <HTMLLabelElement>document.createElement('label')
    let inpi  = <HTMLInputElement>document.createElement('input')
    let namei = document.createTextNode(SaclaySlitherGame.teamNames[i]);     // Create a text node
    labi.setAttribute("style","color:white");
    labi.setAttribute("id","TEAM"+i);
    if (i==0) inpi.setAttribute("checked","true");
    inpi.addEventListener('change', (e:any)=>{
      selTeam = e.srcElement.parentNode.id.substring(4);
    })

    inpi.setAttribute("type","radio");
    inpi.setAttribute("name","snaketype");
    let cell  = <HTMLTableCellElement>document.createElement('td')
    cell.appendChild(labi);
    labi.appendChild(inpi);
    labi.appendChild(namei);
    row.appendChild(cell);
    if (i%4==3) {
      opts.appendChild(row);
      row  = <HTMLTableRowElement>document.createElement('tr')
    }
  }

  opts.appendChild(row);

  //inp.value="My Hero";
  ldiv.appendChild(inp);
  ldiv.appendChild(opts);
  document.body.appendChild(gdiv);
  gdiv.appendChild(ldiv);
  inp.focus();
}

