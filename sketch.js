let flock
const num = 10

function setup() {
  colorMode(HSB, 360, 100, 100, 100)

  createCanvas(500, 300)
  flock = new Flock()

  for (let i = 0; i < num; i++) {
    let b = new Boid(width / 2, height / 2)
    flock.addBoid(b)
  }
}

function draw() {
  fill(0, 30)
  rect(0, 0, width, height)
  flock.run() //flock内で全boidが更新
}

function mouseDragged() {
  flock.addBoid(new Boid(mouseX, mouseY))
}
