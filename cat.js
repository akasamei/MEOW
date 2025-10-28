
const holder = document.getElementById('sketch-holder');


const stage = document.createElement('div');
stage.id = 'photo-stage';
stage.style.position = 'relative';
stage.style.display = 'inline-block'; 
holder?.appendChild(stage);


const photo = new Image();
photo.id = 'bg-photo';
photo.src = 'images/meow.jpg'; 
photo.alt = 'meow';
photo.style.display = 'block';   
stage.appendChild(photo);


const pawEl = new Image();
pawEl.src = 'images/paw.png';


let pawWhiteCanvas = null;
let pawReady = false;

pawEl.onload = () => {
  const w = pawEl.naturalWidth, h = pawEl.naturalHeight;
  const can = document.createElement('canvas');
  can.width = w; can.height = h;
  const ctx = can.getContext('2d');
  ctx.drawImage(pawEl, 0, 0);
  try {
    const d = ctx.getImageData(0, 0, w, h);
    const p = d.data;
    for (let i = 0; i < p.length; i += 4) {
      const a = p[i + 3];
      p[i] = 255; p[i + 1] = 255; p[i + 2] = 255; p[i + 3] = a; 
    }
    ctx.putImageData(d, 0, 0);
    pawWhiteCanvas = can;
    pawReady = true;
  } catch (err) {
    console.error('Paw processing failed (likely CORS if remote image):', err);
  }
};


let prints = [];
let lastPos = null;
const stepDist = 26, offsetAmt = 12, PAW_SIZE = 36;
let leftStep = true;


photo.onload = () => {

  desiredW = photo.naturalWidth;
  desiredH = photo.naturalHeight;


  if (typeof resizeCanvas === 'function') {
    resizeCanvas(desiredW, desiredH);
    const canv = document.querySelector('#photo-stage canvas');
    if (canv) {
      
      canv.style.position = 'absolute';
      canv.style.left = '0';
      canv.style.top = '0';
      canv.style.pointerEvents = 'auto'; 
    }
  }
};


let desiredW = 800;
let desiredH = 400;

function setup() {

  const c = createCanvas(desiredW, desiredH);
 
  c.parent('photo-stage');

  const canv = c.canvas;
  canv.style.position = 'absolute';
  canv.style.left = '0';
  canv.style.top = '0';

  noStroke();
}

function draw() {

  clear(); 


  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    if (lastPos === null) lastPos = createVector(mouseX, mouseY);

    const nowPos = createVector(mouseX, mouseY);
    const d = p5.Vector.dist(nowPos, lastPos);

    if (d >= stepDist) {
      const dir = p5.Vector.sub(nowPos, lastPos).normalize();
      const normal = createVector(-dir.y, dir.x);
      const side = leftStep ? 1 : -1;

      const dropPos = p5.Vector.add(nowPos, p5.Vector.mult(normal, side * offsetAmt));
      const angle = atan2(dir.y, dir.x) + radians(random(-6, 6));

      prints.push({ x: dropPos.x, y: dropPos.y, angle, alpha: 255 });
      leftStep = !leftStep;
      lastPos = nowPos.copy();
    }
  } else {
    lastPos = null;
  }


  for (let i = prints.length - 1; i >= 0; i--) {
    const p = prints[i];
    drawPaw(p.x, p.y, PAW_SIZE, p.angle, p.alpha);
    p.alpha -= 4;
    if (p.alpha <= 0) prints.splice(i, 1);
  }
}

function drawPaw(x, y, h, angle, alpha) {
  if (!pawReady || !pawWhiteCanvas) return;
  const aspect = pawWhiteCanvas.width / pawWhiteCanvas.height;
  const w = h * aspect;

  drawingContext.save();
  drawingContext.translate(x, y);
  drawingContext.rotate(angle);
  drawingContext.globalAlpha = alpha / 255;
  drawingContext.drawImage(pawWhiteCanvas, -w / 2, -h / 2, w, h);
  drawingContext.restore();
}
