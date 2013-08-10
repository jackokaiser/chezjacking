//! VERTEX

/* the position defines the size of the quad */
/* (that is, how many pixels are rasterized) */

/* the sceneTilePosition defines what part of the scene we are rendering */
/* -1 to 1 coords means the whole scene */
/* if it takes position.xy values then we render a part of the image */
attribute vec2 sceneTilePosition;

uniform vec3 uEyePos;

uniform vec3 uPointLight;
uniform mat4 uViewProjectionInverse;

varying vec3 vRayDir;
varying vec3 vPointLight;

varying vec2 discardTexCoord;

/* varying vec2 debug; */

void main( void )
{
  gl_Position = vec4(position.xy,-1., 1);
  /* reframe coords between 0 1*/
  discardTexCoord = (sceneTilePosition + 1.)/2.;
  /* discardTexCoord = (position.xy + 1.)/2.; */
  /* debug=(position.xy+1.)/2.; */
  /* point light is attached to the camera */
  vPointLight = uPointLight+uEyePos;

  /* computing the ray direction vector  */
  /* we have to unproject the near plane's tile */

  vec3 tilePosition = vec3(sceneTilePosition ,-1.);
  /* vec3 tilePosition = vec3(position.xy ,-1.); */
  /* tilePosition is a vector like (x,y,-1) with -1<=x,y<=1 */
  /* the origin is bottom left */


  /* apply the projection to the vector */
  /* see https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js */
  /* function apply projection */

  // perspective divide
  float d = 1. / (uViewProjectionInverse[3].x * tilePosition.x +
                  uViewProjectionInverse[3].y * tilePosition.y +
                  uViewProjectionInverse[3].z * tilePosition.z +
                  uViewProjectionInverse[3].w );

  /* I predict this update soon */
  /* vRayDir = d * vec3 ( transpose( mat3x4(uViewProjectionInverse) ) * vec4(tilePosition,1.) ); */

  vRayDir.x = ( uViewProjectionInverse[0].x * tilePosition.x +
                uViewProjectionInverse[0].y * tilePosition.y +
                uViewProjectionInverse[0].z  * tilePosition.z +
                uViewProjectionInverse[0].w );

  vRayDir.y = ( uViewProjectionInverse[1].x * tilePosition.x +
                uViewProjectionInverse[1].y * tilePosition.y +
                uViewProjectionInverse[1].z  * tilePosition.z +
                uViewProjectionInverse[1].w );

  vRayDir.z = ( uViewProjectionInverse[2].x * tilePosition.x +
                uViewProjectionInverse[2].y * tilePosition.y +
                uViewProjectionInverse[2].z * tilePosition.z +
                uViewProjectionInverse[2].w );

  vRayDir = normalize( d * vRayDir - uEyePos );
}
