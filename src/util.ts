export function dist(x1:number, y1:number, x2:number, y2:number):number{
  let dx = x2-x1;
  let dy = y2-y1;
  return Math.sqrt(dx*dx+dy*dy);
}

// adapted from https://github.com/kittykatattack/learningPixi#keyboard
export function keyboard(keyCode:number) {
  let key:any = {}
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = (event:any) => {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }else console.log("unknown = "+event.keyCode)
    event.preventDefault();
  };

  //The `upHandler`
  key.upHandler = (event:any) => {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
    event.preventDefault();
  };

  //Attach event listeners
  window.addEventListener(
    "keydown", key.downHandler.bind(key), false
  );
  window.addEventListener(
    "keyup", key.upHandler.bind(key), false
  );
  return key;
}