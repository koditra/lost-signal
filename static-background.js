const canvas = document.querySelector("#static-background");
const context = canvas.getContext("2d", { alpha: false });
const cellSize = 24;
const colors = ["#087d8a", "#0b9299", "#20afb1", "#45c8c8", "#72ded8"];
const motionReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let width = 0;
let height = 0;
let lastFrame = 0;

function resizeCanvas() {
  const pixelRatio = Math.min(devicePixelRatio || 1, 2);
  width = innerWidth;
  height = innerHeight;
  canvas.width = Math.ceil(width * pixelRatio);
  canvas.height = Math.ceil(height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  drawStatic();
}

function drawStatic(time = 0) {
  if (!motionReduced && time - lastFrame < 140) {
    requestAnimationFrame(drawStatic);
    return;
  }
  lastFrame = time;

  for (let y = 0; y < height; y += cellSize) {
    for (let x = 0; x < width; x += cellSize) {
      const checker = (x / cellSize + y / cellSize) % 2;
      const pulse = (x + y) % 96 === 0 && Math.random() < 0.5;
      const shift = pulse && Math.random() < 0.18 ? Math.floor(Math.random() * 3) : 0;
      context.fillStyle = colors[Math.min(4, checker ? 1 + shift : 3 + shift)];
      context.fillRect(x, y, cellSize, cellSize);
    }
  }

  if (!motionReduced) requestAnimationFrame(drawStatic);
}

addEventListener("resize", resizeCanvas);
resizeCanvas();