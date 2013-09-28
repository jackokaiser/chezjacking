//! FRAGMENT
#define MAX_DISTANCE 4096.
#define NUMBER_OF_STEPS 10

/* STRUCT DEFINITION */
varying vec3 vRayDir;
uniform vec3 uLightDirMain;
uniform vec3 uLightDirSide;
varying vec2 discardTexCoord;
uniform float maxDistance;
uniform vec3 uEyePos;
uniform vec4 uSpheres[NUMBER_OF_SPHERES];
varying vec3 vPointLight;
/* varying vec3 vDirLight; */
struct Ray {
  vec3 origin;
  vec3 direction;
} ;

void march (in Ray r, out float nextStepLength)
{
  nextStepLength=MAX_DISTANCE;
  float distSquared;
  vec3 pToSphere;
  for (int i=0;i<NUMBER_OF_SPHERES;i++)
    {
      pToSphere = uSpheres[i].xyz - r.origin;
      distSquared=dot(pToSphere,pToSphere);
      /* furry */
      nextStepLength=min(nextStepLength,
                         sqrt(distSquared) - uSpheres[i].w);
      /* bubble */
      /* nextStepLength=min(nextStepLength, */
      /*                    sqrt(abs(distSquared - pow(uSpheres[i].w,2.)))); */
    }
}

vec4 computeColorBubble (in Ray r,in float depth)
{
  return vec4(abs(normalize(r.origin)),1.);
}
vec4 computeColorLambert (in Ray r,in float depth)
{
  vec3 normalSum=vec3(0);
  float distSquared;
  vec3 sphereToP;
  float distToSurface;
  for (int i=0;i<NUMBER_OF_SPHERES;i++)
    {
      sphereToP = r.origin - uSpheres[i].xyz;
      distToSurface=abs(dot(sphereToP,sphereToP) - pow(uSpheres[i].w,2.));
      /* current normal * weight  */
      normalSum += (1./(distToSurface+1.)) * normalize(sphereToP);
    }
  if(length(normalSum)<0.1)
    {
      /* WEAK */
      return vec4(
                  vec3(0.1,0.1,0.8) *
                  (r.direction.y+1.)/2.,
                  1.);
    }
  else
    {
      normalSum=normalize(normalSum);

      vec3 color1 =vec3(0.1,0.7,0.4);
      vec3 color2 =vec3(1);
      float lambert1 = clamp(abs(dot(uLightDirMain,normalSum)),0.,1.);
      float lambert2 = clamp(abs(dot(uLightDirSide,normalSum)),0.,1.)*0.3;
      /* vec3 color2 =vec3(0.2,0.,0.3); */
      /* float lambert1 = clamp(abs(dot(uLightDirMain,normalSum)),0.,1.); */
      /* float lambert2 = clamp(abs(dot(uLightDirSide,normalSum)),0.,1.)*0.4; */
      /* return vec4(abs(normalSum),1.); */

      return vec4(clamp(color1*lambert1 + color2*lambert2,
                        0.,1.)
                  ,1.);
    }
}

void main ()
{
  // Cast a ray out from the eye position into the scene
  Ray r=Ray(uEyePos,normalize(vRayDir));
  float nextStepLength;
  float depth=0.;
  for (int i=0;i<NUMBER_OF_STEPS;i++)
    {
      march(r, nextStepLength);
      depth+=nextStepLength;
      r.origin+=r.direction*nextStepLength;
    }
  gl_FragColor = computeColorLambert(r,depth);
}
