// this sketch features the world's first flower launcher,
// spreading the seeds of blooms within range of its
// blossom boomer.

const flowerFiles = [
  "/assets/flower-1.png",
  "/assets/flower-2.png",
  "/assets/flower-3.png",
];

const landFile = "/assets/land.wav";

const themeMusicFile = "/assets/random.mp3";

let flowerImages;
let landSound;
let themeMusicSound;

const ground = {
  y: 0,
  color: "#2a760a",
};

const launcher = {
  // properties updated in setup to use the actual canvas size
  x: 0,
  y: 0,
  height: 20,
  width: 40,
  cannonLength: 30,
  angle: 0.7,
  power: 10,
  color: "#2c2e3a",
};

// these have the shape { x, y, dx, dy, ax, ay }
const projectiles = [];

const flowers = [];

const musicButtons = {
  size: 30,
  gap: 10,
  margin: 15,
  play: { x: 0, y: 0 },
  pause: { x: 0, y: 0 },
  stop: { x: 0, y: 0 },
};

let flightSound;
let inFlight = false;

async function setup() {
  createCanvas(windowWidth, 400);
  flowerImages = [];
  for (const file of flowerFiles) {
    flowerImages.push(await loadImage(file));
  }
  landSound = await loadSound(landFile);
  themeMusicSound = await loadSound(themeMusicFile);

  initEverything();
  flightSound = new p5.Oscillator("triangle");
}

function initEverything() {
  // ground is 3/4 the way down
  ground.y = height * 0.75;

  // tank sits on the ground, 1/8 of the way from the left
  launcher.y = ground.y - launcher.height;
  launcher.x = width * (1 / 8);
  launcher.angle = -0.9;

  // music buttons sit in the top-right corner, stop nearest the edge
  const { size, gap, margin } = musicButtons;
  musicButtons.stop.x = width - margin - size;
  musicButtons.pause.x = musicButtons.stop.x - gap - size;
  musicButtons.play.x = musicButtons.pause.x - gap - size;
  musicButtons.play.y = musicButtons.pause.y = musicButtons.stop.y = margin;
}

function draw() {
  background("#5fdef1");
  adjustLauncher();
  updateProjectiles();
  updateFlightSound();
  drawGround();
  drawLauncher();
  drawProjectiles();
  drawFlowers();
  drawMusicButtons();
}

function mousePressed() {
  if (isInsideButton(musicButtons.play)) themeMusicSound.play();
  else if (isInsideButton(musicButtons.pause)) themeMusicSound.pause();
  else if (isInsideButton(musicButtons.stop)) {
    themeMusicSound.stop();
    // p5.sound's stop() doesn't clear the internal "paused" flag that
    // pause() sets, so play() after pause+stop wrongly no-ops instead of
    // restarting the node — reset it here to work around that
    themeMusicSound.paused = false;
  }
}

function isInsideButton(button) {
  const { size } = musicButtons;
  return (
    mouseX >= button.x &&
    mouseX <= button.x + size &&
    mouseY >= button.y &&
    mouseY <= button.y + size
  );
}

function drawMusicButtons() {
  drawMusicButton(musicButtons.play, drawPlayIcon);
  drawMusicButton(musicButtons.pause, drawPauseIcon);
  drawMusicButton(musicButtons.stop, drawStopIcon);
}

function drawMusicButton(button, drawIcon) {
  const { x, y } = button;
  const { size } = musicButtons;
  push();
  noStroke();
  fill(255, 255, 255, 200);
  rect(x, y, size, size, 4);
  fill(40);
  drawIcon(x, y, size);
  pop();
}

function drawPlayIcon(x, y, size) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size * 0.28;
  triangle(cx - r * 0.6, cy - r, cx - r * 0.6, cy + r, cx + r, cy);
}

function drawPauseIcon(x, y, size) {
  const barWidth = size * 0.16;
  const barHeight = size * 0.5;
  const barY = y + size / 2 - barHeight / 2;
  rect(x + size * 0.32 - barWidth / 2, barY, barWidth, barHeight);
  rect(x + size * 0.68 - barWidth / 2, barY, barWidth, barHeight);
}

function drawStopIcon(x, y, size) {
  const s = size * 0.4;
  rect(x + size / 2 - s / 2, y + size / 2 - s / 2, s, s);
}

function drawFlowers() {
  for (const f of flowers) {
    drawFlower(f);
  }
}

function drawFlower(f) {
  push();
  imageMode(CENTER);
  image(f.img, f.x, f.y - flowerSize / 2, flowerSize, flowerSize);
  pop();
}

function adjustLauncher() {
  if (keyIsDown(UP_ARROW)) launcher.power += 0.1;
  if (keyIsDown(DOWN_ARROW)) launcher.power -= 0.1;
  if (keyIsDown(LEFT_ARROW)) launcher.angle -= 0.02;
  if (keyIsDown(RIGHT_ARROW)) launcher.angle += 0.02;
}

function keyPressed() {
  if (code === "Space") {
    fireProjectile();
  }
}

function fireProjectile() {
  const { x1, y1 } = calcLauncher();
  const p = {
    x: x1,
    y: y1,
    dx: launcher.power * cos(launcher.angle),
    dy: launcher.power * sin(launcher.angle),
    ax: 0,
    // positive ay pulls the projectile toward larger y, i.e. down the
    // screen, since y grows downward here
    ay: 0.4,
  };
  projectiles.push(p);
}

function updateProjectiles() {
  for (const p of projectiles) {
    // the delta is dependent on the acceleration, which is constant
    p.dx += p.ax;
    p.dy += p.ay;
    // the position is dependent on the delta
    p.x += p.dx;
    p.y += p.dy;
  }
  // now we figure out which projectiles have landed, and when they do we
  // plant a flower and remove it from the list. We also remove projectiles if
  // they go out of bounds in the x dimension.
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    if (p.y >= ground.y) {
      plantFlower(p);
      projectiles.splice(i, 1); // remove one item from list at index i
    } else if (p.x < 0 || p.x > width) {
      projectiles.splice(i, 1);
    }
  }
}

const flowerSize = 40;

function plantFlower(p) {
  flowers.push({ x: p.x, y: ground.y, img: random(flowerImages) });
  landSound.play();
  // land.wav has ~200ms of silence up front; jump past it so the sound
  // is heard right when the flower lands. jump() only takes effect once
  // the file is already playing, so it has to come after play(). This is
  // suboptimal - a better fix would be to edit the file offline so
  // running play() starts at the right spot. I found this value
  // experimentally.
  landSound.jump(0.26);
}

function updateFlightSound() {
  if (projectiles.length > 0 && !inFlight) {
    flightSound.start();
    inFlight = true;
  } else if (projectiles.length === 0 && inFlight) {
    flightSound.stop();
    inFlight = false;
  }

  if (!inFlight) return;

  // track whichever projectile was fired most recently
  const p = projectiles[projectiles.length - 1];
  // 'constrain' is a p5 function to keep a value in some range.
  const elevation = constrain(ground.y - p.y, 0, ground.y);
  const distance = constrain(dist(p.x, p.y, launcher.x, launcher.y), 0, width);

  // projectiles realistically only reach ~150px elevation and ~400px
  // distance at typical power settings, so scale against that instead of
  // the (much larger) canvas dimensions, or the range barely gets used.
  // 'map' is a p5 function that does linear mapping of a value from a source
  // range (like 0 to 150) to a destination range (like 150 to 1200).
  flightSound.freq(map(elevation, 0, 150, 150, 1200));

  // closeness is 1 right at the launcher and fades linearly to 0 by 400px away.
  const closeness = 1 - constrain(distance / 400, 0, 1);
  flightSound.amp(0.6 * closeness, 0.05);
}

function drawGround() {
  push();
  noStroke();
  fill(ground.color);
  rect(0, ground.y, width, height - ground.y);
  pop();
}

function calcLauncher() {
  const cannonX0 = launcher.x + launcher.width / 2;
  const cannonY0 = launcher.y + launcher.height / 2;
  return {
    x0: cannonX0,
    y0: cannonY0,
    x1: cannonX0 + launcher.cannonLength * cos(launcher.angle),
    y1: cannonY0 + launcher.cannonLength * sin(launcher.angle),
  };
}

function drawLauncher() {
  push();
  noStroke();
  fill(launcher.color);
  rect(launcher.x, launcher.y, launcher.width, launcher.height);
  const { x0, y0, x1, y1 } = calcLauncher();

  strokeWeight(4);
  stroke(launcher.color);
  line(x0, y0, x1, y1);
  pop();
}

function drawProjectiles() {
  for (const p of projectiles) {
    drawProjectile(p);
  }
}

function drawProjectile(p) {
  push();
  fill("blue");
  noStroke();
  circle(p.x, p.y, 10);
  pop();
}
