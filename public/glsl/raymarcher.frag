//! FRAGMENT
#define MAX_DISTANCE 4096.
#define NUMBER_OF_STEPS 10

/* STRUCT DEFINITION */
varying vec3 vRayDir;
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
      nextStepLength=min(nextStepLength,
                         distSquared - uSpheres[i].w);
    }
}

vec4 computeColor (in Ray r,in float depth)
{
  return vec4(vec3(depth/1000.),1.);
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
      r.origin+=r.direction*sqrt(nextStepLength);
    }
  gl_FragColor = computeColor(r,depth);
}
