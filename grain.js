const makeShader = (fs, uniforms) => {
  const s = createShader(vs, fs)
  const setUniform = (k,v) => s.setUniform(k,v)
  return (...args) => {
    shader(s)
    uniforms(setUniform, ...args)
    rect(-width/2,-height/2,width,height)
  }
}

const vs=`#version 300 es
precision mediump float;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

in vec3 aPosition;
in vec2 aTexCoord;
out vec2 pos;

void main() {
  pos = aTexCoord;
  vec4 positionVec4 = vec4(aPosition, 1.0);
  gl_Position = uProjectionMatrix * uModelViewMatrix * positionVec4;
 }`

const grain_fs=`#version 300 es
precision highp float;
in vec2 pos;

uniform sampler2D from;

out vec4 y;

void main() {
  y = texture(from, pos);
  if (y.r==1.) { return; }

  float mdf = .1;
  float noise = (fract(sin(dot(pos, vec2(12.9898,78.233)*2.0)) * 43758.5453));
  float dy = noise*mdf;
  if (dy > y.g) { dy*=-1.; }
  y.rgb -= dy;
}
`
const drawGrainy = (() => {
  let grainFb,grainShader
  return (draw) => {
    if (!grainFb || !grainShader) {
      grainFb = createFramebuffer()
      grainShader = makeShader(grain_fs,(setUniform) => {
        setUniform("from",grainFb)
      })
    }
    resetShader()
    grainFb.draw(draw)
    push()
    noStroke()
    grainShader()
    pop()
  }
})()