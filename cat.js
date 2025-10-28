

let pawSrc, pawWhite, cattino;
let prints = [];
let lastPos = null;
const stepDist = 26;
const offsetAmt = 12;
let leftStep = true;

function preload() {

  pawSrc = loadImage('paw.png');   
  cattino = loadFont('Cattino.ttf'); 
}

function setup() {
  createCanvas(800, 400);
  textAlign(CENTER, CENTER);
  noStroke();

  pawWhite = makeWhite(pawSrc);
  imageMode(CENTER);
}


function draw() {
  background(0);


  fill(255);
  if (cattino) textFont(cattino);
  textSize(min(width, height) * 0.18); 
  text("MEOW", width / 2, height / 2);


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

      prints.push({
        x: dropPos.x,
        y: dropPos.y,
        angle,
        alpha: 255,
        scale: 36,     
      });

      leftStep = !leftStep;
      lastPos = nowPos.copy();
    }
  } else {
    lastPos = null;
  }


  for (let i = prints.length - 1; i >= 0; i--) {
    const p = prints[i];
    drawPawImage(p.x, p.y, p.scale, p.angle, p.alpha);
    p.alpha -= 4; 
    if (p.alpha <= 0) prints.splice(i, 1);
  }
}


function makeWhite(img) {
  const out = createImage(img.width, img.height);
  img.loadPixels();
  out.loadPixels();
  for (let i = 0; i < img.pixels.length; i += 4) {
    const a = img.pixels[i + 3]; 
    out.pixels[i + 0] = 255;
    out.pixels[i + 1] = 255;
    out.pixels[i + 2] = 255;
    out.pixels[i + 3] = a;
  }
  out.updatePixels();
  return out;
}


function drawPawImage(x, y, h, angle, alpha) {
  push();
  translate(x, y);
  rotate(angle);
  const aspect = pawWhite.width / pawWhite.height;
  const w = h * aspect;
  tint(255, alpha);       
  image(pawWhite, 0, 0, w, h);
  noTint();
  pop();
}
