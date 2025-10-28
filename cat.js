// cat.js — DOM image + transparent p5 canvas overlay for the paw trail

// --- Build a centered stage with <img> and an overlaid canvas ---
const holder = document.getElementById('sketch-holder');

// Create stage container (relative) so we can absolutely-position the canvas
const stage = document.createElement('div');
stage.id = 'photo-stage';
stage.style.position = 'relative';
stage.style.display = 'inline-block'; // allows centering via #sketch-holder flex
holder?.appendChild(stage);

// Add the image as a DOM element (NOT drawn in p5)
const photo = new Image();
photo.id = 'bg-photo';
photo.src = 'images/meow.jpg'; // <- your file path (can be a full URL too)
photo.alt = 'meow';
photo.style.display = 'block';   // remove inline gap
stage.appendChild(photo);

// Load the paw source (off-DOM). We'll convert it to pure white.
const pawEl = new Image();
pawEl.src = 'images/paw.png';

// Offscreen canvas for white paw sprite
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
      p[i] = 255; p[i + 1] = 255; p[i + 2] = 255; p[i + 3] = a; // force white, keep alpha
    }
    ctx.putImageData(d, 0, 0);
    pawWhiteCanvas = can;
    pawReady = true;
  } catch (err) {
    console.error('Paw processing failed (likely CORS if remote image):', err);
  }
};

// p5 state
let prints = [];
let lastPos = null;
const stepDist = 26, offsetAmt = 12, PAW_SIZE = 36;
let leftStep = true;

// Create the canvas only after the photo has its natural size
photo.onload = () => {
  // p5 will call setup() once it loads; we set desired size here
  desiredW = photo.naturalWidth;
  desiredH = photo.naturalHeight;

  // If p5 is already set up, resize then re-anchor canvas
  if (typeof resizeCanvas === 'function') {
    resizeCanvas(desiredW, desiredH);
    const canv = document.querySelector('#photo-stage canvas');
    if (canv) {
      // absolute overlay on top of the image
      canv.style.position = 'absolute';
      canv.style.left = '0';
      canv.style.top = '0';
      canv.style.pointerEvents = 'auto'; // keep mouse tracking on canvas
    }
  }
};

// Fallback size in case image fails to load
let desiredW = 800;
let desiredH = 400;

function setup() {
  // Create canvas with fallback size; we'll resize when image loads
  const c = createCanvas(desiredW, desiredH);
  // Attach to the same stage so it overlays the image
  c.parent('photo-stage');
  // Make the canvas overlay the photo
  const canv = c.canvas;
  canv.style.position = 'absolute';
  canv.style.left = '0';
  canv.style.top = '0';

  noStroke();
}

function draw() {
  // Keep the canvas transparent and only draw paws
  clear(); // transparent clear (no background)

  // Place paw prints when mouse moves enough over the canvas
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

  // Draw & fade prints
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
