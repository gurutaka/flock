class Boid {
  constructor(x, y) {
    this.acceleration = createVector(0, 0)
    this.velocity = createVector(random(-1, 1), random(-1, 1))
    this.position = createVector(x, y) //自身の位置
    this.r = 3.0
    this.maxspeed = 2.5 // Maximum speed
    this.maxforce = 0.05 // Maximum steering force

    const fishColor = [
      color(100, 200, 250),
      color(60, 250, 250),
      color(400, 200, 250)
    ]

    this.outForceLine = 100
    this.color = fishColor[floor(random(3))]
    this.angleLimit = (5 * PI) / 6
    this.desiredseparation = 25
    this.neighbordist = 50
    this.sum = {
      sep: createVector(0, 0),
      coh: createVector(0, 0),
      ali: createVector(0, 0)
    }
    this.steer = {
      sep: createVector(0, 0),
      coh: createVector(0, 0),
      ali: createVector(0, 0)
    }
    this.count = { sep: 0, ali: 0, coh: 0 }

    this.paramSteer = { sep: 1.5, ali: 1, coh: 1 }
  }

  init() {
    for (let key in this.count) {
      this.sum[key].mult(0)
      this.steer[key].mult(0)
      this.count[key] = 0
    }
    this.acceleration.mult(0)
  }

  //最終的に更新される関数
  run(boids) {
    this.init()
    this.flock(boids)
    this.boundaries()
    this.update()
    this.borders()
    this.render()
  }

  applyForce(force) {
    this.acceleration.add(force)
  }

  flock(boids) {
    this.judgeBoidTheory(boids)
    this.setBoidSteer()
    this.applyBoidSteer()
  }

  applyBoidSteer() {
    Object.keys(this.steer).forEach(key => {
      this.applyForce(this.steer[key].mult(this.paramSteer[key]))
    })
  }

  setBoidSteer() {
    Object.keys(this.count).forEach(key => {
      if (this.count[key] > 0) {
        this.setBoidSteerCase(key)
      }
    })
  }

  setBoidSteerCase(key) {
    switch (key) {
      case 'coh':
        this.sum[key].div(this.count[key])
        this.steer[key] = this.seek(this.sum[key])
        break

      default:
        this.sum[key]
          .div(this.count[key])
          .normalize()
          .mult(this.maxspeed)
        this.steer[key] = p5.Vector.sub(this.sum[key], this.velocity)
        this.steer[key].limit(this.maxforce)
    }
  }

  boundaries() {
    let desired = null

    if (this.position.x < this.outForceLine) {
      desired = createVector(this.maxspeed, this.velocity.y)
    } else if (this.position.x > width - this.outForceLine) {
      desired = createVector(-this.maxspeed, this.velocity.y)
    }

    if (this.position.y < this.outForceLine) {
      desired = createVector(this.velocity.x, this.maxspeed)
    } else if (this.position.y > height - this.outForceLine) {
      desired = createVector(this.velocity.x, -this.maxspeed)
    }

    if (desired !== null) {
      desired.normalize()
      desired.mult(this.maxspeed * 1.5)
      let steer = p5.Vector.sub(desired, this.velocity)
      steer.limit(this.maxforce)
      this.applyForce(steer)
    }
  }

  update() {
    this.velocity.add(this.acceleration)
    this.velocity.limit(this.maxspeed)
    this.position.add(this.velocity)
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.position)
    desired.normalize().mult(this.maxspeed)
    let steer = p5.Vector.sub(desired, this.velocity)
    steer.limit(this.maxforce)
    return steer
  }

  render() {
    const theta = this.velocity.heading() + PI / 2
    push()
    noStroke()
    translate(this.position.x, this.position.y)
    rotate(theta)

    //胴体
    beginShape()
    fill(this.color)
    vertex(0, 15)
    bezierVertex(0, 12, -2.5, 2.5, 0, 0)
    bezierVertex(0, 0, 2.5, 2.5, 0, 12)
    endShape()

    pop()
  }

  borders() {
    if (this.position.x < -this.r) this.position.x = width + this.r
    if (this.position.y < -this.r) this.position.y = height + this.r
    if (this.position.x > width + this.r) this.position.x = -this.r
    if (this.position.y > height + this.r) this.position.y = -this.r
  }

  judgeBoidTheory(boids) {
    for (let i = 0; i < boids.length; i++) {
      let d = p5.Vector.dist(this.position, boids[i].position)
      let angle = p5.Vector.angleBetween(this.velocity, boids[i].velocity)
      this.judgeAlign(d, angle, boids[i])
      this.judgeCohesion(d, angle, boids[i])
      this.judgeSeparate(d, angle, boids[i])
    }
  }

  judgeSeparate(d, angle, boid) {
    if (d > 0 && d < this.desiredseparation && angle < this.angleLimit) {
      let diff = p5.Vector.sub(this.position, boid.position)
      diff.normalize().div(d) // 正規化→スケーリング
      this.sum.sep.add(diff)
      this.count.sep++
    }
  }

  // 整列
  judgeAlign(d, angle, boid) {
    if (d > 0 && d < this.neighbordist && angle < this.angleLimit) {
      this.sum.ali.add(boid.velocity)
      this.count.ali++
    }
  }

  // 分離
  judgeCohesion(d, angle, boid) {
    if (d > 0 && d < this.neighbordist && angle < this.angleLimit) {
      this.sum.coh.add(boid.position)
      this.count.coh++
    }
  }
}
