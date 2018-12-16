//require ('./Snake')
import {Point, Food, Snake, SnakeStrategy} from '../Snake';
import {NetworkSnake} from './NetworkSnake';
import {SaclaySlitherGame} from '../SaclaySlitherGame';

import http = require('http');

import * as WebSocket from 'ws';

let Quadtree = require("quadtree-lib")

console.log("TS server launching ... "+SaclaySlitherGame.WORLDRADIUS)

let wsServer = new WebSocket.Server({ port: 9090 });

let ctrlSnake:{ [ip: string]: NetworkSnake; }   = {};
let ssg0:SaclaySlitherGame = new SaclaySlitherGame();
let serverTime = 0;
let timer:NodeJS.Timer|null;
let foodUpdate:{[index:number]: number[]}



function initGame(){
  ssg0 = new SaclaySlitherGame();

  for (let k:number=0; k<SaclaySlitherGame.NBINITIALFOODS; k++) {
    let f:Food = Food.newFood(ssg0);
    ssg0.foods.push(f);
  }

  for (let k:number=0; k<SaclaySlitherGame.NBINITIALSNAKES; k++) {
    ssg0.snakes[k] = new Snake(ssg0, ssg0.names[k%ssg0.names.length], Math.max(40, 400+50*(k-1)),
      SaclaySlitherGame.WORLDRADIUS/2+Math.floor(900*Math.cos(k*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES)),
      SaclaySlitherGame.WORLDRADIUS/2+Math.floor(900*Math.sin(k*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES)),
      k%SaclaySlitherGame.colors.length,
      Math.floor((SaclaySlitherGame.SPACEBETWEENSEGMENTS)*Math.cos(k*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES)),
      Math.floor((SaclaySlitherGame.SPACEBETWEENSEGMENTS)*Math.sin(k*2*Math.PI/SaclaySlitherGame.NBINITIALSNAKES)),
      SnakeStrategy.GOBESTFOOD);
  }
  console.log("INI "+ssg0.snakes[10]!.name+" "+ssg0.snakes[10]!.pos[0].x.toFixed(2)+" "+ssg0.snakes[10]!.pos[0].y.toFixed(2)
                                          +" "+ssg0.snakes[10]!.pos[1].x.toFixed(2)+" "+ssg0.snakes[10]!.pos[1].y.toFixed(2)
                                          +" "+ssg0.snakes[10]!.pos[2].x.toFixed(2)+" "+ssg0.snakes[10]!.pos[2].y.toFixed(2)+"..."
                                          +" "+ssg0.snakes[10]!.pos[ssg0.snakes[10]!.pos.length-1].x.toFixed(2)+" "+ssg0.snakes[10]!.pos[ssg0.snakes[10]!.pos.length-1].y.toFixed(2))
}



function updateSnakes(){
  serverTime++;
  console.log("AV "+ssg0.snakes[10]!.name+" "+ssg0.snakes[10]!.pos[0].x.toFixed(2)+","+ssg0.snakes[10]!.pos[0].y.toFixed(2)
                                         +" "+ssg0.snakes[10]!.pos[1].x.toFixed(2)+","+ssg0.snakes[10]!.pos[1].y.toFixed(2)
                                         +" "+ssg0.snakes[10]!.pos[2].x.toFixed(2)+","+ssg0.snakes[10]!.pos[2].y.toFixed(2)+"..."
                                         +" "+ssg0.snakes[10]!.pos[ssg0.snakes[10]!.pos.length-1].x.toFixed(2)+" "+ssg0.snakes[10]!.pos[ssg0.snakes[10]!.pos.length-1].y.toFixed(2)+
                                         " ===> "+ssg0.snakes[10]!.dirX.toFixed(2)+","+ssg0.snakes[10]!.dirY.toFixed(2))

  // a new array to contain oll the food updates
  foodUpdate[serverTime] = [];

  for (let k=0; k<ssg0.snakes.length; k++){
    if (ssg0.snakes[k] instanceof NetworkSnake) {
      let snake = <NetworkSnake>ssg0.snakes[k];
      snake.lastDirX = ssg0.snakes[k]!.dirX;
      snake.lastDirY = ssg0.snakes[k]!.dirY;

      snake.moveSnake(snake.dirX, snake.dirY);
      //console.log("  "+snake.name+"@"+snake.pos[0].x.toFixed(2)+","+snake.pos[0].y.toFixed(2)+" MOVED TOWARD "+snake.lastDirX.toFixed(2)+","+snake.lastDirY.toFixed(2)+" AND NOW WILL MOVE TOWARD "+ssg0.snakes[k]!.dirX.toFixed(2)+","+ssg0.snakes[k]!.dirY.toFixed(2))

      if (snake.ws.readyState==WebSocket.OPEN)snake.ws.send("MOVE "+snake.pos[0].x+" "+snake.pos[0].y+" "+snake.lastDirX+" "+snake.lastDirY);

    } else if (ssg0.snakes[k]) {
      //let x  = ssg0.snakes[k]!.pos[0].x;
      //let y  = ssg0.snakes[k]!.pos[0].y;
      //ssg0.snakes[k]!.moveSnake(ssg0.snakes[k]!.dirX, ssg0.snakes[k]!.dirY);
      let dx = ssg0.snakes[k]!.dirX;
      let dy = ssg0.snakes[k]!.dirY;
      let x  = ssg0.snakes[k]!.pos[0].x;
      let y  = ssg0.snakes[k]!.pos[0].y;
      let dd = Math.hypot(x, y);

      let ndx = (10+Math.random()*5)*dx + (Math.random()*16-8)*dy;
      let ndy = (10+Math.random()*5)*dy - (Math.random()*16-8)*dx;

      if (dd>1000) {
        ndx += -x*(dd-1000)/dd;
        ndy += -y*(dd-1000)/dd;
      }

      if (ssg0.snakes[k]!.state==SnakeStrategy.AVOIDBORDER && ssg0.snakes[k]!.closestSnakeP!=null){
        let d = Math.hypot(x, y);
        let ddx = -x/d*20;
        let ddy = -y/d*20;
        let dda = Math.atan2(ddy, ddx);
        ssg0.snakes[k]!.moveSnake( x+20*Math.cos(dda), y+20*Math.sin(dda));
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.AVOIDCLOSEST && ssg0.snakes[k]!.closestSnakeP!=null){
        let p = ssg0.snakes[k]!.closestSnakeP!;
        let ddx = x-p.x;
        let ddy = y-p.y;
        let dda = Math.atan2(ddy, ddx);
        ssg0.snakes[k]!.moveSnake(x+20*Math.cos(dda), y+20*Math.sin(dda));
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.AVOIDWORST && ssg0.snakes[k]!.closestBadSnakeP!=null){
        let p = ssg0.snakes[k]!.closestBadSnakeP!;
        let ddx = x-p.x;
        let ddy = y-p.y;
        let dda = Math.atan2(ddy, ddx);
        ssg0.snakes[k]!.moveSnake(x+20*Math.cos(dda), y+20*Math.sin(dda));
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.GOBESTFOOD && ssg0.snakes[k]!.bestFood!=null){
        let f = ssg0.snakes[k]!.bestFood!;
        //console.log(k+"_"+snakes[k].name+" @"+x+","+y+" goes to "+f.x+", "+f.y);
        ssg0.snakes[k]!.moveSnake( f.x, f.y);
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.GOCLOSESTFOOD && ssg0.snakes[k]!.closestFood!=null){
        let f = ssg0.snakes[k]!.closestFood!;
        //console.log(k+"_"+snakes[k].name+" @"+x+","+y+" goes to "+f.x+", "+f.y);
        ssg0.snakes[k]!.moveSnake( f.x, f.y);
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.FASTSTRAIGHT){
        if (ssg0.snakes[k]!.speed<SaclaySlitherGame.MAX_SPEED && ssg0.snakes[k]!.weight>40+SaclaySlitherGame.LOOSEWEIGHT)
          ssg0.snakes[k]!.speed=SaclaySlitherGame.MAX_SPEED;
        ssg0.snakes[k]!.moveSnake( x+dx, y+dy);
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.ROT){
        ssg0.snakes[k]!.moveSnake( x+ndx, y+ndy);
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.RANDWALK){
        ssg0.snakes[k]!.moveSnake( x+10*dx-100*dy, y+10*dy+100*dx);
      } else {
        ssg0.snakes[k]!.moveSnake( x+dx, y+dy);
        //console.log(k+"_"+snakes[k].name+" is lost !!! ");
      }


      if (ssg0.snakes[k]!.testCollision(foodUpdate[serverTime])) {
        console.log(ssg0.snakes[k]!.name+" is dead");
        for (let i=0; i<ssg0.snakes[k]!.pos.length; i++) {
          let p = ssg0.snakes[k]!.pos[i];
          let f = new Food(p.x, p.y, 0);
          f.rd = 10;
          if (i%2==0) ssg0.foods.push(f);
        }
        let a = Math.random()*2*Math.PI;
        let d = Math.random()*SaclaySlitherGame.WORLDRADIUS;

        ssg0.snakes[k] = new Snake(ssg0, ssg0.names[k%ssg0.names.length], 40,
                                   Math.floor(d*Math.cos(a)),
                                   Math.floor(d*Math.sin(a)),
                                   k%SaclaySlitherGame.colors.length,
                                   10* Math.cos(k* Math.PI/3),
                                   10* Math.sin(k* Math.PI/3),
                                   SnakeStrategy.GOBESTFOOD);
      }

      //console.log(snakes[k].name+" @ "+snakes[k].state+" cBSp="+snakes[k].closestBadSnakeP.x+", "+snakes[k].closestBadSnakeP.y);

      // Apres le deplacement on evalue si c'est pas le bon moment de changer de strategie
      if (ssg0.snakes[k]!.state!=SnakeStrategy.AVOIDBORDER) {
        let h = ssg0.snakes[k]!.pos[0];
        let d = Math.hypot(h.x, h.y);
        if (d>SaclaySlitherGame.WORLDRADIUS-100)
          ssg0.snakes[k]!.state=SnakeStrategy.AVOIDBORDER;/////
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.AVOIDBORDER) {
        let h = ssg0.snakes[k]!.pos[0];
        let d = Math.hypot(h.x, h.y);
        if (d<SaclaySlitherGame.WORLDRADIUS-200)
          ssg0.snakes[k]!.state=SnakeStrategy.GOBESTFOOD;/////
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.AVOIDWORST && ssg0.snakes[k]!.closestBadSnakeP!=null){
        let p = ssg0.snakes[k]!.closestBadSnakeP!;
        let d = ssg0.snakes[k]!.dclosestBadSnake;
        console.log(ssg0.snakes[k]!.name+" would not be affraid anymore if sketch.dist to "+ssg0.snakes[k]!.closestBadSnake!.name+" ="+d+">400   p="+p.x+","+p.y);
        if (d>200){
          ssg0.snakes[k]!.state=SnakeStrategy.GOBESTFOOD;/////
          console.log(ssg0.snakes[k]!.name+" is not affraid anymore");
        }
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.AVOIDCLOSEST && ssg0.snakes[k]!.closestSnakeP!=null){
        let p =ssg0.snakes[k]!.closestSnakeP!;
        if (ssg0.snakes[k]!.closestSnake==ssg0.snakes[0]!) console.log(ssg0.snakes[k]!.name+" is affraid of me point["+k+"]="+p.x+","+p.y); //+" sketch.dist="+dd +"  DIFFANGLE="+da+" => "+(dd*sin(da/2+1))

        let d = Math.hypot(p.x-x, p.y-y);
        if (d>300)
          ssg0.snakes[k]!.state=SnakeStrategy.GOBESTFOOD;/////
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.AVOIDWORST && ssg0.snakes[k]!.closestBadSnakeP==null){
        ssg0.snakes[k]!.state=SnakeStrategy.GOBESTFOOD;/////
        console.log(ssg0.snakes[k]!.name+" is not affraid anymore");
      } else if (ssg0.snakes[k]!.state==SnakeStrategy.GOBESTFOOD && ssg0.snakes[k]!.closestBadSnakeP!=null){
        let p = ssg0.snakes[k]!.closestBadSnakeP!;
        let d = ssg0.snakes[k]!.dclosestBadSnake;
        if (d<100){
          console.log(ssg0.snakes[k]!.name+" is now affraid of "+ssg0.snakes[k]!.closestBadSnake!.name+" because "+d+"<200  p="+p.x+","+p.y);
          ssg0.snakes[k]!.state=SnakeStrategy.AVOIDWORST;///
        }
      }
    }
  }
  console.log("AP "+ssg0.snakes[10]!.name+" "+ssg0.snakes[10]!.pos[0].x.toFixed(2)+","+ssg0.snakes[10]!.pos[0].y.toFixed(2)
                                         +" "+ssg0.snakes[10]!.pos[1].x.toFixed(2)+","+ssg0.snakes[10]!.pos[1].y.toFixed(2)
                                         +" "+ssg0.snakes[10]!.pos[2].x.toFixed(2)+","+ssg0.snakes[10]!.pos[2].y.toFixed(2)+"..."
                                         +" "+ssg0.snakes[10]!.pos[ssg0.snakes[10]!.pos.length-1].x.toFixed(2)+" "+ssg0.snakes[10]!.pos[ssg0.snakes[10]!.pos.length-1].y.toFixed(2)+
                                         " ===> "+ssg0.snakes[10]!.dirX.toFixed(2)+","+ssg0.snakes[10]!.dirY.toFixed(2))

}


wsServer.on('connection', (ws: WebSocket, req:http.IncomingMessage) => {

  const ip:string = req.connection.remoteAddress!;
  console.log((new Date()) + " Connection accepted "+ip);

  ws.on('message', function(message:WebSocket.Data, type:string) {
    //console.log(message+" === "+ typeof message);
    if (typeof message === 'string') {
      //console.log("Received utf8 Message : " +message.utf8Data);
      //console.log(message);
      if ((<string>message).startsWith("Hello, I am ")){
        let name = (<string>message).substring(12, (<string>message).indexOf(";"));
        let team = (<string>message).substring((<string>message).indexOf(";")+1);

        if (Object.keys(ctrlSnake).length ==0){
          console.log("initGame "+SaclaySlitherGame.WORLDRADIUS)
          initGame();
          //timer = <NodeJS.Timer>setInterval(updateSnakes, 20)
        }

        if (ctrlSnake[ip]){
          ssg0.snakes.splice(ssg0.snakes.indexOf(ctrlSnake[ip]), 1);
          delete ctrlSnake[ip];
          console.log(ssg0.snakes.length+"+1 snake renewed: "+name)
          ws.send("Hello back "+name+", I am the server: "+ssg0.snakes.length+"+1 snake renewed");
        } else {
          console.log(ssg0.snakes.length+"+1 snake: "+name)
          ws.send("Hello back "+name+", I am the server: "+ssg0.snakes.length+"+1 snake");
        }

        ctrlSnake[ip] = new NetworkSnake(ssg0, name, 500, SaclaySlitherGame.WORLDRADIUS/2, SaclaySlitherGame.WORLDRADIUS/2, parseInt(team), 10, 0, SnakeStrategy.GOBESTFOOD, ws)
        ssg0.snakes.push(ctrlSnake[ip]);
      } else if ((<string>message).startsWith("pause")){
        if (timer!=null){
          clearInterval(timer);
          timer = null;
          console.log("pause")
        } else
          console.log("CANT PAUSE NON RUNNING GAME")

      } else if ((<string>message).startsWith("play")){
        if (timer!=null){
          console.log("CANT RUN A RUNNING GAME")
        } else{
          timer = <NodeJS.Timer>setInterval(updateSnakes, 20);
          console.log("play")
        }
      } else if ((<string>message).startsWith("reset")){
        if (timer!=null) clearInterval(timer);
        initGame();
        let type = ctrlSnake[ip].type;
        let name = ctrlSnake[ip].name;
        ctrlSnake[ip] = new NetworkSnake(ssg0, name, 500, SaclaySlitherGame.WORLDRADIUS/2, SaclaySlitherGame.WORLDRADIUS/2, type, 10, 0, SnakeStrategy.GOBESTFOOD, ws)
      } else if ((<string>message).startsWith("update")){
        updateSnakes();
      }
    }
    else if (typeof message === 'object') {

      let data = <Buffer>message;
      //console.log("Received Binary Message of " + data.length + " bytes");
      //console.log(message);

      if (data.length==6*4) { // UPDATE
        let arr:Float32Array = new Float32Array(2+ssg0.snakes.length*8)

        let tx   = data.readFloatLE(0);
        let ty   = data.readFloatLE(4);
        ctrlSnake[ip].speed = data.readFloatLE(8);
        let minx = data.readFloatLE(12);
        let miny = data.readFloatLE(16);
        let wh   = data.readFloatLE(20);

        let px:number = 0;
        let py:number = 0;

        ctrlSnake[ip].dirX = tx;
        ctrlSnake[ip].dirY = ty;

        console.log("receive update from "+ip+" = "+ctrlSnake[ip].name);


        let p0x = ctrlSnake[ip].pos[0].x;
        let p0y = ctrlSnake[ip].pos[0].y;
        //console.log("NET REC:"+ctrlSnake[ip].name+"@"+ctrlSnake[ip].pos[0].x.toFixed(2)+","+ctrlSnake[ip].pos[0].y.toFixed(2)+" MOVING TOWARD "+tx.toFixed(2)+","+ty.toFixed(2))
        //console.log("PAN "+minx.toFixed(2)+","+miny.toFixed(2))

        ctrlSnake[ip].dirX = tx;
        ctrlSnake[ip].dirY = ty;

        arr[0] = serverTime;
        arr[1] = ssg0.snakes.length;

        for (let k=0; k<ssg0.snakes.length; k++) {
          arr[2+k*8+0] = ssg0.snakes[k]!.dirX;
          arr[2+k*8+1] = ssg0.snakes[k]!.dirY;
          arr[2+k*8+2] = ssg0.snakes[k]!.pos[0].x;
          arr[2+k*8+3] = ssg0.snakes[k]!.pos[0].y;
          arr[2+k*8+4] = ssg0.snakes[k]!.pos[ssg0.snakes[k]!.pos.length-1].x;
          arr[2+k*8+5] = ssg0.snakes[k]!.pos[ssg0.snakes[k]!.pos.length-1].y;
          arr[2+k*8+6] = ssg0.snakes[k]!.speed;
          arr[2+k*8+7] = ssg0.snakes[k]!.weight;
        }
        ws.send(arr);
      } else if (data.length==4*4) { // ALL SNAKES & FOOD
        let sumSize = 0;
        for (let k =0; k<ssg0.snakes.length; k++)
          sumSize += ssg0.snakes[k]!.size

        let arr:Float32Array = new Float32Array(3+ssg0.snakes.length*7+sumSize*2+ssg0.foods.length*3)

        let x = data.readFloatLE(0);
        let y = data.readFloatLE(4);
        let w = data.readFloatLE(8);
        let h = data.readFloatLE(12);

        arr[0] = ssg0.snakes.length;
        arr[1] = ssg0.foods.length;
        arr[2] = sumSize;

        let arrpos = 3;
        for (let k =0; k<ssg0.snakes.length; k++) {
          //console.log(k+" => "+ssg0.snakes[k]!.type+" "+ssg0.snakes[k]!.size)
          arr[arrpos+0] = ssg0.snakes[k]!.size
          arr[arrpos+1] = ssg0.snakes[k]!.weight
          arr[arrpos+2] = ssg0.snakes[k]!.dirX
          arr[arrpos+3] = ssg0.snakes[k]!.dirY

          arr[arrpos+4] = ssg0.snakes[k]!.type
          arr[arrpos+5] = ssg0.snakes[k]!.pos[0].x
          arr[arrpos+6] = ssg0.snakes[k]!.pos[0].y
          arrpos+=7;
        }

        for (let k =0; k<ssg0.snakes.length; k++) {
          for (let l=0; l<ssg0.snakes[k]!.size; l++){
            arr[arrpos+0] = ssg0.snakes[k]!.pos[l].x
            arr[arrpos+1] = ssg0.snakes[k]!.pos[l].y
            arrpos+=2
          }
        }
        for (let k =0; k<ssg0.foods.length; k++) {
          arr[arrpos+0] = ssg0.foods[k]!.x
          arr[arrpos+1] = ssg0.foods[k]!.y
          arr[arrpos+2] = ssg0.foods[k]!.rd
          arrpos+=3
        }
        console.log("  sent "+arrpos+"%"+arr.length)
        console.log("=> "+ssg0.snakes[10]!.name+" "+ssg0.snakes[10]!.pos[0].x.toFixed(2)+" "+ssg0.snakes[10]!.pos[0].y.toFixed(2)
                                               +" "+ssg0.snakes[10]!.pos[1].x.toFixed(2)+" "+ssg0.snakes[10]!.pos[1].y.toFixed(2)
                                               +" "+ssg0.snakes[10]!.pos[2].x.toFixed(2)+" "+ssg0.snakes[10]!.pos[2].y.toFixed(2))

        ws.send(arr);
      }
    } else {
      console.log("Unknown message type: "+type)
    }
  });
  //ws.send("Hello ??? ");

  wsServer.on('close', function(reasonCode:number, description:string) {
    console.log((new Date()) + " Peer " + wsServer.address + " disconnected.");
  });
});



