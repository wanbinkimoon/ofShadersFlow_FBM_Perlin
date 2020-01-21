#version 150

out vec4 outputColor;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_sound;

float random (in vec2 _st) {
  return fract(sin(dot(_st.xy,
                       vec2(12.9898,78.233)))*
               43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd

float noise (in vec2 _st) {
  vec2 i = floor(_st);
  vec2 f = fract(_st);
  
  // Four corners in 2D of a tile
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(a, b, u.x) +
  (c - a)* u.y * (1.0 - u.x) +
  (d - b) * u.x * u.y;
}


#define NUM_OCTAVES 5

float fbm ( in vec2 _st) {
  float v = 0.0;
  float a = 0.5;
  vec2 shift = vec2(100.0);
  // Rotate to reduce axial bias
  mat2 rot = mat2(cos(0.5), sin(0.5),
                  -sin(0.5), cos(0.50));
  for (int i = 0; i < NUM_OCTAVES; ++i) {
    v += a * noise(_st);
    _st = rot * _st * 2.0 + shift;
    a *= 0.5;
  }
    return v;
//  return fbm(v + fbm(v + fbm(v)));
}

void main() {
  vec2 st = gl_FragCoord.xy/u_resolution.xy*3.;
//  st += st * abs(sin(u_time * 0.1) * 3.0);
//   st += st * abs(sin(u_sound*0.1)*3.0);
  
  st += st * sin(u_time * 0.1);

  vec2 q = vec2(0.);
//  q.x = fbm( st + 0.00*u_time);
//  q.y = fbm( st + vec2(1.0));
  q.x = fbm(st + fbm(st + fbm(st + u_time)));
  q.y = fbm(st + fbm(st + fbm(st + vec2(1.0))));
  
  vec2 r = vec2(0.);
  r.x = fbm(st + 2.0 * q + vec2(1.7,9.2)+ 0.15 * u_time);
  r.y = fbm(st + 1.0 * q + vec2(8.3,2.8)+ 0.16 * u_time);
  
  vec2 s = vec2(0.);
  s.x = fbm(st + 3.2 * r + vec2(1.7, 4.2));
  s.y = fbm(st + 2.1 * r + vec2(2.3, 2.8));
  
  vec2 u = vec2(0.);
  u.x = fbm(st + 1.3 * s + vec2(4.7, 1.2));
  u.y = fbm(st * s + vec2(2.3, 2.3));
  
  vec2 v = vec2(0.);
  //  v.x = fbm(u + vec2(1.7 * u_time, 1.2));
  //  v.y = fbm(u + vec2(5.3 * u_time, 2.3));
  v.x = fbm(u + fbm(u + vec2(sin(u_time), 1.2)));
  v.y = fbm(u + fbm(u + vec2(sin(u_time), cos(u_time))));
  
  vec2 z = vec2(0.);
  z.x = fbm(v + fbm(v + vec2(3.0 + (u_sound * 2.1) ,1.2)));
  z.y = fbm(v + fbm(v + vec2(0.1 + (u_sound * 2.1), 2.3)));
  
  float f = fbm(v + fbm(u + fbm(st + u)));

  
  vec3 color = vec3(0., random(vec2(0.2, .7)), random(vec2(0.3, 1.2)));
  
  color = mix(color,
              vec3(sin(u_sound * .6), 0.1 , 0.9),
              clamp(length(cos(f * u_time)), 0.0, 1.0));
  
  color = mix(color,
              vec3(cos(u_sound * .34), 0.2, 0.9),
              clamp(length(cos(q * u_sound)), .3, 1));
  
  color = mix(color,
              vec3(1, 0.1, 0.8),
              clamp(length(cos(s.x * u_sound)), .3, 1));
  
    
  vec3 color2 = vec3(0., random(vec2(0.1, .4)), random(vec2(0, 1)));
  
  
  color2 = mix(color2,
               vec3(sin(u_time * .2), 0.8, .1),
               clamp(length(sin(s.y * u_time)), .25 , 1.0));
  
  
  color2 = mix(color2,
               vec3(0.1,  sin(u_time * .8), .2),
               clamp(length(sin(z.y *  f * u_time)), .2 , .8));
  
  color2 = mix(color2,
               vec3(0.1, sin(u_time * .3), .2),
               clamp(length(z.y), .2 , .8));
  
  color = mix(color,
              color2,
              clamp(length(z.x), 0.0, u_sound * .85));
  
  //  outputColor = vec4((f*f+.6*f*f+.5*f)*color,
    outputColor = vec4((f * f * .3 + f * f * r.x + f * f * f + z.y)*color,1.);
//  outputColor = vec4((f * f * .3 + f * f + .3)*color,1.);
}

