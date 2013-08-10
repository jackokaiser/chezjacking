//! FRAGMENT

/* STRUCT DEFINITION */

#define TYPE_SPHERE 0
#define TYPE_CYLINDER 1
#define TYPE_CONE 2

varying vec3 vRayDir;

varying vec2 discardTexCoord;

uniform vec3 uEyePos;

varying vec3 vPointLight;
/* varying vec3 vDirLight; */

uniform sampler2D uBackgroundRTT;
uniform sampler2D uStencilTexture;

uniform sampler2D uSphereTex;
uniform sampler2D uCylinderTex;
uniform sampler2D uConeTex;
uniform sampler2D uVerticesTexture;
uniform sampler2D uPrimitivesTexture;

uniform float uMaxDistance;

uniform mat4 uNormalMatrix;

struct Cone {
  vec3 v;
  float inf;
  vec3 axis;
  float sup;
  float ctheta;
} ;

struct Cylinder {
  vec3 v;
  float r;
  vec3 axis;
  float sup;
} ;


struct Ray {
  vec3 origin;
  vec3 direction;
} ;

struct IntersectItem {
  float dist;
  vec3 p;
  vec3 normalVector;
  vec3 color;
  int type;
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



/* texture space is normalized between 0-1 */
vec4 indexTexture (in sampler2D dataTexture,in int index)
{
  /* return texture2D(dataTexture,vec2(float(index) / float(textureSize(dataTexture,0)),0.)); */
  /* return texelFetch2D(dataTexture,vec2(index,0)); */
  /* return texture2D(dataTexture,vec2(float(index) / float(MAX_NUMBER_OF_SPHERES),0.)); */

  /* start from top line */
  int division = index / MY_TEXTURE_SIZE ;
  int y = (MY_TEXTURE_SIZE - 1) - division;
  /* int x = mod(index,MY_TEXTURE_SIZE); */
  /* equivalent to */
  int x = index - MY_TEXTURE_SIZE * division;

  /* normalize texel Index */
  return texture2D(dataTexture,vec2(x,y) * INV_MY_TEXTURE_SIZE_MINUS_ONE);
}

void fetchCylinder (in int index, out Cylinder c)
{
  /* two texel for a cylinder */
  /* index 0 fetches texel 0 and 1 */
  int cylinderIndex = index*2;
  vec4 texel1 = indexTexture(uCylinderTex , cylinderIndex);
  vec4 texel2 = indexTexture(uCylinderTex , cylinderIndex+1);

  c.v = texel1.xyz;
  c.r = texel1.w;
  c.axis = texel2.xyz;
  c.sup = texel2.w;
}


void fetchCone (in int index, out Cone c)
{
  /* 3 texels for a cone */
  /* index 0 fetches texel 0, 1 and 2 */
  int coneIndex = index*3;
  vec4 texel1 = indexTexture(uConeTex , coneIndex);
  vec4 texel2 = indexTexture(uConeTex , coneIndex+1);
  vec4 texel3 = indexTexture(uConeTex , coneIndex+2);

  c.v = texel1.xyz;
  c.inf = texel1.w;
  c.axis = texel2.xyz;
  c.sup = texel2.w;
  c.ctheta = texel3.x;
}




Light sceneLight = Light (  vec3(0.1, 0.1, 0.1), //ambient
                            vec3(1., 0.8431372549, 0.),  //diffuse
                            /* vec3(0.5, 0.5, 0.5),  //diffuse */
                            vec3(1., 1., 1.));  //specular

ObjectMaterial sceneMaterial = ObjectMaterial (
                                               0.1, //ambient coeff
                                               0.8, //diffuse coeff
                                               1., //specular coeff
                                               50. //shininess
                                               );

vec3 sphereColor = vec3(0.9, 0., 0.);
vec3 coneColor = vec3(0., 0.9, 0.);
vec3 cylinderColor = vec3(0., 0., 0.9);


/* normal vector of a cone at given point */
vec3 coneNorm( in vec3 vp, in Cone c )
{
  vec3 VPcA=cross(vp,c.axis);
  return cross(vp,VPcA);
}

/* normal vector of a cylinder at given point */
vec3 cylinderNorm( in vec3 vp, in Cylinder c,in vec3 normalizedAxis )
{
  /* for some reason we take vector BA instead of AB */
  vec3 VPcA=cross(normalizedAxis,vp);
  return cross(VPcA,normalizedAxis);
}

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
  if ((i2.dist < uMaxDistance) && (i2.dist < i1.dist))
    return i2;
  else
    return i1;
}


void cylinderInter(in Ray r, in Cylinder cyl, out IntersectItem ret)
{
  ret.dist=uMaxDistance;
  ret.color=cylinderColor;
  ret.type = TYPE_CYLINDER;


  float inf = 0.;

  vec3 vtos = r.origin - cyl.v;
  float vtos_dot_ax = dot(vtos,cyl.axis);
  float dir_dot_ax = dot(r.direction,cyl.axis);

  vec3 tmp1 = r.direction - dir_dot_ax * cyl.axis;
  vec3 tmp2 = vtos - vtos_dot_ax * cyl.axis;

  float lengthTmp1= length(tmp1);
  float lengthTmp2= length(tmp2);
  float a = lengthTmp1*lengthTmp1;
  float b = 2.*dot(tmp1,tmp2);
  float c = lengthTmp2 * lengthTmp2 - cyl.r*cyl.r;

  float delta = b*b - 4.*a*c;


  if(delta>0.)
    {
      float root = sqrt(delta);

      /* check for the two intersection */
      /* first */
      float inv2a = 1./(2.*a);
      float t1=(-b - root)*inv2a;
      /* second */
      float t2=(-b + root)*inv2a;

      // we can always discard the second intersection : it's a
      // back-facing intersection.
      // This avoids the branching which is costly.
      float t = min(t1,t2);

      vec3 p  = getPOutOfRay(r,t);
      vec3 vp = p - cyl.v;

      if(t>0.      /* if negative distances, intersection is behind us */
         && isPointWithinBounds(vp,cyl.axis,inf,cyl.sup))
        {
          ret.p=p;
          ret.dist= (t<0. ? uMaxDistance : t);
          ret.normalVector=cylinderNorm(vp,cyl,cyl.axis);
        }
    }

}

void coneInter(in Ray r, in Cone c, out IntersectItem ret)
{
  ret.dist=uMaxDistance;
  ret.color=coneColor;
  ret.type = TYPE_CONE;

  float AdD = dot(c.axis,r.direction);
  float csqr= pow(c.ctheta,2.);
  vec3 E=r.origin-c.v;
  float AdE = dot(c.axis,E);
  float DdE = dot(r.direction,E);
  float EdE = dot(E,E);
  float c2 = AdD*AdD - csqr;
  float c1 = AdD*AdE - csqr*DdE;
  float c0 = AdE*AdE - csqr*EdE;
  float discr;

  if((abs(c2)>=0.) && ((discr=c1*c1 - c0*c2) > 0.))
    {
      float root = sqrt(discr);

      /* check for the two intersection */
      float invc2 = 1./c2;
      /* first */
      float t1=(-c1 - root)*invc2;
      /* second */
      float t2=(-c1 + root)*invc2;

      // we can always discard the second intersection : it's a
      // back-facing intersection.
      // This avoids the branching which is costly.
      float t = min(t1,t2);

      vec3 p=getPOutOfRay(r,t);
      vec3 vp = p - c.v;

      if(t >0.       /* if negative distances, intersection is behind us */
         && isPointWithinBounds(vp,c.axis,c.inf,c.sup))
        {
          /* first intersection within inf/sup bounds */
          ret.p=p;
          ret.dist= (t<0. ? uMaxDistance : t);
          ret.normalVector=coneNorm(vp,c);
        }
    }

}


void sphereInter(in Ray r,in vec4 s, out IntersectItem ret)
{
  ret.dist=uMaxDistance;
  ret.color=sphereColor;
  ret.type = TYPE_SPHERE;

  // Transform the ray into object space
  vec3 oro = r.origin - s.xyz;
  float b = 2.0 * dot(oro, r.direction);
  float c = dot(oro, oro) - s.w * s.w; // w is the sphere radius

  /* a is 1. because ray direction is normalized */
  float d = b * b - 4.0 * c;

  if(d >= 0.0)
    {
      float t=(-b - sqrt(d)) * 0.5;
      ret.dist= (t<0. ? uMaxDistance : t);
      ret.p=getPOutOfRay(r,ret.dist);
      ret.normalVector=sphereNorm(ret.p,s);
    }
}

void intersect(in Ray r, out IntersectItem firstIntersected )
{
  firstIntersected.dist=uMaxDistance;

  IntersectItem tmpIntersected;
  vec4 curSphere;
  Cylinder curCylinder;
  Cone curCone;

  for (int i = 0; i < NUMBER_OF_SPHERES; i++)
    {
      /* fetch current sphere */
      curSphere=indexTexture(uSphereTex,i);
      sphereInter(r,curSphere,tmpIntersected);
      firstIntersected = minInter(firstIntersected,tmpIntersected);
    }

  for (int i = 0; i < NUMBER_OF_CONES; i++)
    {
      /* fetch current cylinder */
      fetchCone(i,curCone);
      coneInter(r,curCone,tmpIntersected);
      firstIntersected = minInter(firstIntersected,tmpIntersected);
    }


  for (int i = 0; i < NUMBER_OF_CYLINDERS; i++)
    {
      /* fetch current cylinder */
      fetchCylinder(i,curCylinder);
      cylinderInter(r,curCylinder,tmpIntersected);
      firstIntersected = minInter(firstIntersected,tmpIntersected);
    }


}

#ifdef PHONG_SHADING
vec4 computeIntersectedColor (in IntersectItem boom)
{
  vec3 lightDir = normalize(vPointLight - boom.p);
  /* normalize the normal vector */
  boom.normalVector = normalize(boom.normalVector);

  vec3 eyeToP = normalize(boom.p - uEyePos);
  /* col = texture2D(uBackgroundRTT,abs(normalize(reflect(eyeToP,boom.normalVector).xy))).xyz + */
  /*   vec3(0.,0.,0.) ; */
  /* return; */
  float ambientContrib = sceneMaterial.ambientCoef;

  float diffuseContrib = sceneMaterial.diffuseCoef * max(dot(lightDir,boom.normalVector),0.);

  float specularContrib = (pow(max(dot(reflect(lightDir,boom.normalVector),eyeToP),0.),sceneMaterial.shininess));

  /* vec3 specularContrib = sceneMaterial.specularCoef */
  /*   * (pow(max(dot(reflectedLight,r.direction),0.),sceneMaterial.shininess)) */
  /*   * sceneLight.specular; */

  /* gl_FragColor = vec4 ( clamp(ambientContrib + diffuseContrib + specularContrib,0.,1.), 1.); */
  /* col=  clamp(boom.color * (ambientContrib + diffuseContrib),0.,1.); */
  return vec4(vec3(0.,67.,47.)/100. *(diffuseContrib + specularContrib),
              1.);
}

vec4 discardPixel ()
{
  return vec4(texture2D(uBackgroundRTT,discardTexCoord).rgb, 1.);
}
#endif
#ifdef ENV_MAP
vec4 computeIntersectedColor (in IntersectItem boom)
{
  /* normal matrix extraction */
  mat3 normalMatrix = mat3(uNormalMatrix[0].xyz,
                           uNormalMatrix[1].xyz,
                           uNormalMatrix[2].xyz);

  vec3 cameraSpaceNormal = normalize( normalMatrix * normalize(boom.normalVector));
  /* todo : filter between spheres and primitives */
  if (boom.type == TYPE_SPHERE)
    return vec4(texture2D(uVerticesTexture,
                          vec2(0.5) + 0.5*cameraSpaceNormal.xy).xyz,
                1.);
  else
    return vec4(texture2D(uPrimitivesTexture,
                          vec2(0.5) + 0.5*cameraSpaceNormal.xy).xyz,
                1.);
}

vec4 discardPixel ()
{
  return vec4(texture2D(uBackgroundRTT,discardTexCoord).rgb, 1.);
}
#endif
#ifdef DEPTH_MAP

vec3 pack(in float value) {
  return vec3(
              floor(value * 256.0)/255.0,
              floor(fract(value * 256.0) * 256.0)/255.0 ,
              floor(fract(value * 65536.0) * 256.0)/255.0);
}

vec4 computeIntersectedColor(in IntersectItem boom)
{
  return vec4(
              pack(boom.dist/uMaxDistance),
              MARCHING);
}
vec4 discardPixel ()
{
  return vec4(
              pack(1.),
              DISCARDED);
}
#endif

void main( void )
{
  /* stencil test */
  if (texture2D(uStencilTexture,discardTexCoord).r>0.1)
    {
      /* stencil discard */
      /* gl_FragData[0] = discardPixel(); */
      gl_FragColor = discardPixel();
      return;
    }
  /* the true main is to come */

  // Cast a ray out from the eye position into the scene
  Ray r=Ray(uEyePos,normalize(vRayDir));
  IntersectItem objectBoom;
  // See if the ray intesects with any objects.
  // Provides the normal of the nearest intersection point and color
  intersect(r,objectBoom);
  /* intersection! */
  if ( objectBoom.dist < uMaxDistance )
    {
      gl_FragColor = computeIntersectedColor(objectBoom);
      return;
    }
  else
    {
      gl_FragColor = discardPixel();
      return;
    }
}
