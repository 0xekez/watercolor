colors = ["FFCBF2", "F3C4FB", "ECBCFD", "E5B3FE", "E2AFFF", "DEAAFF", "D8BBFF", "D0D1FF", "C8E7FF", "C0FDFF"]

const edge = (angle, length) => {
  const v = createVector(1,1)
  v.normalize()
  v.setHeading(angle)
  v.mult(length)
  v.variance = randomGaussian(sqrt(length), length/2)
  return v
}

const polygon = (n, radius) => {
  const l = 2*radius*sin(PI/n)
  const da = 2*PI/n
  let r = []
  for (let i=0;i<n;i+=1)
    r.push(edge(i*da, l))
  return r
}

const splitEdge = (e) => {
  const theta = e.heading()
  const length = e.mag()
  
  const dc = randomGaussian(0, e.variance)

  const thetap = atan2(dc, sqrt(length/2))
  const lenp = sqrt(length/2*length/2 + dc*dc)

  const edgeup = edge(theta-thetap, lenp)
  const edgedown = p5.Vector.sub(e, edgeup)

  edgeup.variance = e.variance/1.4
  edgedown.variance = e.variance/1.4
  
  return [edgeup, edgedown]
}

const splitPolygon = (polygon) => {
  const newp = []
  for (let edge of polygon) {
    newp.push(...splitEdge(edge))
  }
  return newp
}

const deformPolygon = (polygon, n) => {
  if (n == 0) return polygon
  return deformPolygon(splitPolygon(polygon),n-1)
}

const drawPolygon = (shape, pos) => {
    beginShape()
    vertex(pos.x, pos.y)
    for (let edge of shape) {
      pos.add(edge)
      vertex(pos.x, pos.y)
    }
    endShape()
}

const dp = 22
let w, h

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL)
  noStroke()
  
  w=windowWidth/2
  h=w*windowHeight/windowWidth
  
  background(255)
  paintFb = createFramebuffer()
  grainShader = makeShader(grain_fs,(setUniform) => {
    setUniform("from",paintFb)
  })
}

const randomGridSpot = () => {
  const rows = Math.floor(w/dp) + 1
  const cols = Math.floor(h/dp) + 1
  const row = Math.floor(random()*rows)
  const col = Math.floor(random()*cols)
  return createVector(row*dp-w/2, col*dp-h/2)
}

const m = {}
const spotColor = (row, col) => {
  const k = `${row},${col}`
  let v = m[k]
  if (v == undefined) {
    m[k] = random(colors)
    v = m[k]
  }
  return v
}

const mp = {}
const spotBasepolygon = (row, col) => {
  const k = `${row},${col}`
  let v = mp[k]
  if (v == undefined) {
    const p = polygon(3, 5)
    for (let edge of p) edge.variance += row/width*20+col/height*18
    mp[k] = p
    v = mp[k]
  }
  return v  
}

function draw() {
  background(255)
  const spot = randomGridSpot()
  const color = spotColor(spot.x, spot.y)
  fill("#"+color+"1a")
  const basep = deformPolygon(spotBasepolygon(spot.x, spot.y), 4)
  paintFb.draw(() => drawPolygon(deformPolygon(basep, 7), spot))
  grainShader()
  resetShader()
}