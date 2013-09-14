//! FRAGMENT
#define MAX_DISTANCE 4096.
/* STRUCT DEFINITION */
varying vec3 vRayDir;
varying vec2 discardTexCoord;
uniform vec3 uEyePos;
uniform vec4 uSpheres[NUMBER_OF_SPHERES];
varying vec3 vPointLight;
/* varying vec3 vDirLight; */
struct Ray {
  vec3 origin;
  vec3 direction;
} ;
struct IntersectItem {
  float dist;
  vec3 p;
  vec3 normalVector;
  vec4 color;
};
struct Light {
  vec3 ambient;
  vec3 diffuse;
  vec3 specular;
};
struct ObjectMaterial {
  float ambientCoef;
  float diffuseCoef;
  float specularCoef;
  float shininess;
};
/* CODE */
//
// Description : Array and textureless GLSL 2D/3D/4D simplex
//               noise functions.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : ijm
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//
const vec4 plane = vec4 (0.,1.,0.,28.);
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}
vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise(vec3 v)
{
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;
  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
                                     i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
Light sceneLight = Light (  vec3(0.1, 0.1, 0.1), //ambient
                            vec3(1., 0.8431372549, 0.),  //diffuse
                            /* vec3(0.5, 0.5, 0.5),  //diffuse */
                            vec3(1., 1., 1.));  //specular
ObjectMaterial sceneMaterial = ObjectMaterial (
                                               0.2, //ambient coeff
                                               0.8, //diffuse coeff
                                               1., //specular coeff
                                               100. //shininess
                                               );
/* normal vector of a sphere at given point */
vec3 sphereNorm( in vec3 pt, in vec4 s )
{
  return pt - s.xyz;
}
vec3 getPOutOfRay (in Ray r, in float t)
{
  return r.origin+r.direction*t;
}
bool isPointWithinBounds(in vec3 vp, in vec3 axis,in float inf,in float sup)
{
  float vpDP=dot(vp,axis);
  return ((vpDP > inf) && (vpDP < sup));
}
/* return min intersection between two intersection */
/* if no inter then return i1 */
IntersectItem minInter(in IntersectItem i1,
                       in IntersectItem i2)
{
  if ((i2.dist < MAX_DISTANCE) && (i2.dist < i1.dist))
    return i2;
  else
    return i1;
}
void sphereInter(in Ray r,in vec4 s, out IntersectItem ret)
{
  ret.dist=MAX_DISTANCE;
  // Transform the ray into object space
  vec3 oro = r.origin - s.xyz;
  float b = 2.0 * dot(oro, r.direction);
  float c = dot(oro, oro) - s.w * s.w; // w is the sphere radius
  /* a is 1. because ray direction is normalized */
  float d = b * b - 4.0 * c;
  if(d >= 0.0)
    {
      float t=(-b - sqrt(d)) * 0.5;
      ret.dist= (t<0. ? MAX_DISTANCE : t);
      ret.p=getPOutOfRay(r,ret.dist);
      ret.normalVector=sphereNorm(ret.p,s);
    }
}
void planeInter (in Ray r,in vec4 pl, out IntersectItem ret)
{
  float t = -(dot(pl.xyz,r.origin)+pl.w)/dot(pl.xyz,r.direction);
  ret.dist= (t<0. ? MAX_DISTANCE : t);
  ret.color = vec4(vec3(1.),0.3);
  ret.p=getPOutOfRay(r,ret.dist);
  ret.normalVector=pl.xyz;
}
void intersect(in Ray r, out IntersectItem firstIntersected )
{
  firstIntersected.dist=MAX_DISTANCE;
  IntersectItem tmpIntersected;
  vec4 curSphere;
  for (int i = 0; i < NUMBER_OF_SPHERES; i++)
    {
      /* fetch current sphere */
      curSphere=uSpheres[i];
      sphereInter(r,curSphere,tmpIntersected);
      firstIntersected = minInter(firstIntersected,tmpIntersected);
    }
  firstIntersected.color=vec4(
                              clamp(
                                    normalize(vec3(
                                                   sin(firstIntersected.p.x/40.*3.14)+1.01,
                                                   cos(firstIntersected.p.y/40.*3.14)+1.01,
                                                   cos(-firstIntersected.p.z/40.*3.14)+1.01)
                                              ) * abs(snoise (firstIntersected.p/5.))
                                    ,0.,1.),
                              0.9);
  planeInter(r,plane,tmpIntersected);
  firstIntersected = minInter(firstIntersected,tmpIntersected);
}
bool isShadowed (in vec3 p)
{
  vec3 newDir = normalize(vPointLight - p);
  Ray r = Ray (p+newDir*0.1,newDir);
  IntersectItem tmpIntersected;
  vec4 curSphere;
  for (int i = 0; i < NUMBER_OF_SPHERES; i++)
    {
      /* fetch current sphere */
      curSphere=uSpheres[i];
      sphereInter(r,curSphere,tmpIntersected);
      if (tmpIntersected.dist<MAX_DISTANCE)
        return true;
    }
  return false;
}
vec4 computeColor (in IntersectItem boom)
{
  if (isShadowed(boom.p))
    {
      return vec4(vec3(0),0.9);
    }
  vec3 lightDir = normalize(vPointLight - boom.p);
  /* normalize the normal vector */
  boom.normalVector = normalize(boom.normalVector);
  vec3 eyeToP = normalize(boom.p - uEyePos);
  float ambientContrib = sceneMaterial.ambientCoef;
  float diffuseContrib = sceneMaterial.diffuseCoef * max(dot(lightDir,boom.normalVector),0.);
  float specularContrib = (pow(max(dot(reflect(lightDir,boom.normalVector),eyeToP),0.),sceneMaterial.shininess));
  return  boom.color * (diffuseContrib + specularContrib + ambientContrib);
}
vec4 discardPixel ()
{
  return vec4(normalize(abs(vRayDir)),1.);
}
vec4 computeIntersectedColor (in IntersectItem boom, in Ray reflected)
{
  IntersectItem boom2;
  intersect(reflected,boom2);
  vec4 color1=computeColor(boom);
  vec4 color2;
  if (boom2.dist<MAX_DISTANCE)
    color2=computeColor(boom2);
  else
    color2 = discardPixel()*0.2;
  color2*=0.3;
  return vec4(
              color1.rgb*color1.a + color2.rgb*(1.-color1.a),
              1.);
}
void main( void )
{
  // Cast a ray out from the eye position into the scene
  Ray r=Ray(uEyePos,normalize(vRayDir));
  IntersectItem objectBoom;
  // See if the ray intesects with any objects.
  // Provides the normal of the nearest intersection point and color
  intersect(r,objectBoom);
  vec3 refDirection=normalize(reflect(r.direction,objectBoom.normalVector));
  Ray reflected = Ray(objectBoom.p+refDirection*0.1,refDirection);
  /* intersection! */
  if ( objectBoom.dist < MAX_DISTANCE )
    {
      gl_FragColor = computeIntersectedColor(objectBoom,reflected);
      return;
    }
  else
    {
      gl_FragColor = discardPixel();
      return;
    }
}
