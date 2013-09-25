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
  if(length(normalSum)<0.5)
    {
      /* WEAK */
      return vec4(0);
    }
  else
    {
      normalSum=normalize(normalSum);

      vec3 color =vec3(0.1,0.7,0.4);
      float lambert = clamp(abs(dot(vec3(0.,0.,-1.),normalSum)),0.,1.);
      /* return vec4(abs(normalSum),1.); */
      return vec4(color*lambert,1.);
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
