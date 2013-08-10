'use strict';


// create a square float texture to store datas
// (filter to nearest and no mimap )
/**
 * @param {Float32Array} data datas to initialize texture with
 * @param {number} width width of the texture
 * @param {number=} height height of the texture (defaults to width),
 * for square textures
 **/
function createDataTexture(data,width,height)
{
    height = height || width;
    return new THREE.DataTexture(data,
                                 width, //width
                                 width, //height
                                 THREE.RGBAFormat, // format
                                 THREE.FloatType, //type
                                 new THREE.UVMapping(),  //mapping
                                 THREE.ClampToEdgeWrapping,  //wrapS
                                 THREE.ClampToEdgeWrapping, //wrapT
                                 THREE.NearestFilter, //mag filter
                                 THREE.NearestFilter, //minfilter
                                 0 //anisotropy
                                );
}


/**
 * @constructor
 */
var SkelRaytracerMaterial = function(shaderDico,attrs) {
    this.shaderName =
        {
            fragment : "raytracer"+shaderDico.minified+".frag",
            vertex : "raytracer"+shaderDico.minified+".vert"
        };


    this.computeFragmentShader = function()
    {
        var statesStr = "";
        var sl = this.states.length;
        for (var i=0;i<sl;i++)
        {
            // make all the state define with appropriate values
            statesStr+="#define "+this.states[i]+" "+(1/sl).toFixed(15)+"\n";
        }
        // the espilon for testing equality with a state
        statesStr+="#define EPSILON_STATE "+(1/(sl+1)).toFixed(15)+"\n";

        // return string defines + struct frag + fshader
        return "#define MY_TEXTURE_SIZE "+this.textureSize+"\n"+
            "#define INV_MY_TEXTURE_SIZE_MINUS_ONE "+(1/(this.textureSize-1)).toFixed(5)+"\n"+
            "#define NUMBER_OF_SPHERES "+this.numberOfSpheres+"\n"+
            "#define NUMBER_OF_CYLINDERS "+this.numberOfCylinders+"\n"+
            "#define NUMBER_OF_CONES "+this.numberOfCones+"\n" +
            "#define "+this.renderOutput+"\n" +
            statesStr +
            shaderDico.text[this.shaderName.fragment];
    };
    this.states = attrs.states;

    // can be "DEPTH_MAP" as well
    this.renderOutput = attrs.defaultRenderOutput;

    this.numberOfSpheres = 0;
    this.numberOfCylinders = 0;
    this.numberOfCones = 0;

    // square texture : same width and height, that's a side
    // this.textureSize = attrs.maxTextureSize / 16.;
    // each texel is 4 values (RGBA) and each value is 4 bytes (float32)
     this.textureSize = 1024 / 16;
    // max distance after which we start discarding

    // 2 dimension square texture, so we have size * size texel

    // create an array that holds datas
    // 1 sphere is one vec4
    var sphereData = new Float32Array( this.textureSize * this.textureSize * 4  );
    // 1 cone is 2 vec4
    var coneData = new Float32Array( this.textureSize * this.textureSize * 4  );
    // 1 cylinder is 2 vec3 and 1 float (rounded up to 8 values)
    var cylinderData = new Float32Array( this.textureSize * this.textureSize * 4  );


    var uniformsDescription = {
        uEyePos: {
            type: 'v3',
            value : new THREE.Vector3()
        },
        uViewProjectionInverse: {
            type: 'm4',
            value: new THREE.Matrix4()
        },
        uNormalMatrix: {
            type: 'm4',
            value: new THREE.Matrix4()
        },
        uPointLight : {
            type: 'v3',
            value : new THREE.Vector3()
        },
        uSphereTex : {
            type : 't',
            value : createDataTexture( sphereData,this.textureSize )
        },
        uConeTex : {
            type : 't',
            value : createDataTexture( coneData,this.textureSize )
        },
        uCylinderTex : {
            type : 't',
            value : createDataTexture( cylinderData,this.textureSize )
        },
        uBackgroundRTT : {
            type : 't',
            value : attrs.backgroundRTT
        },
        uVerticesTexture : {
            type : 't',
            value : attrs.verticesTexture
        },
        uPrimitivesTexture : {
            type : 't',
            value : attrs.primitivesTexture
        },
        uStencilTexture : {
            type : 't',
            value : attrs.stencilTexture
        },
        uMaxDistance : {
            type : 'f',
            value : 0
        }
    };

    // got the material for 0 items
    THREE.ShaderMaterial.call(this,{
        uniforms:       uniformsDescription,
        attributes: {
            sceneTilePosition : {
                type : 'v2',
                value : [
                    new THREE.Vector2(-1,1),
                    new THREE.Vector2(1,1),
                    new THREE.Vector2(-1,-1),
                    new THREE.Vector2(1,-1)
                ]
            }
        },
        vertexShader:   shaderDico.text[this.shaderName.vertex],
        fragmentShader: this.computeFragmentShader(),
        depthTest : false
    });
};

SkelRaytracerMaterial.prototype = Object.create (THREE.ShaderMaterial.prototype );


SkelRaytracerMaterial.prototype.changeRenderOutput = function (renderOutput)
{
    this.renderOutput = renderOutput;
    this.fragmentShader = this.computeFragmentShader();
    this.needsUpdate = true;
};

SkelRaytracerMaterial.prototype.update = function (attrs)
{
    /////////////////// update our uniforms
    this.uniforms.uEyePos.value.copy(attrs.eyePos);
    // transpose coz' glsl is column major
    this.uniforms.uViewProjectionInverse.value.copy(attrs.viewProjectionInverse).transpose();
    // three js do not let you the opportunity to create uniforms of type mat3:
    // wtf please?
    this.uniforms.uNormalMatrix.value.set(
        attrs.normalMatrix.elements[0], attrs.normalMatrix.elements[1], attrs.normalMatrix.elements[2], 0,
        attrs.normalMatrix.elements[3], attrs.normalMatrix.elements[4], attrs.normalMatrix.elements[5], 0,
        attrs.normalMatrix.elements[6], attrs.normalMatrix.elements[7], attrs.normalMatrix.elements[8], 0,
        0,0,0,0);
    this.uniforms.uPointLight.value.copy(attrs.pointLight);

    this.uniforms.uMaxDistance.value = attrs.maxDistance;
    //////////////////// we update scene values
    // TODO: could we only update what's required, instead of everything?
    var uSphereTex = this.uniforms.uSphereTex;
    uSphereTex.needsUpdate = true;
    uSphereTex.value.needsUpdate = true;

    var uConeTex = this.uniforms.uConeTex;
    uConeTex.needsUpdate = true;
    uConeTex.value.needsUpdate = true;

    var uCylinderTex = this.uniforms.uCylinderTex;
    uCylinderTex.needsUpdate = true;
    uCylinderTex.value.needsUpdate = true;


    //////////////////////// set the new values
    for (var i=0;i<attrs.spheres.length;i++)
    {
        // one sphere => 1 texel
        uSphereTex.value.image.data[i*4] = attrs.spheres[i].x;
        uSphereTex.value.image.data[i*4 + 1] = attrs.spheres[i].y;
        uSphereTex.value.image.data[i*4 + 2] = attrs.spheres[i].z;
        uSphereTex.value.image.data[i*4 + 3] = attrs.spheres[i].w * attrs.scaleSizeFactor;
    }
    for (var j=0;j<attrs.cones.length;j++)
    {
        // one cone => 3 texels
        // v, inf | axis, sup | ctheta

        // first
        uConeTex.value.image.data[j*12] = attrs.cones[j].v.x;
        uConeTex.value.image.data[j*12 + 1] = attrs.cones[j].v.y;
        uConeTex.value.image.data[j*12 + 2] = attrs.cones[j].v.z;
        uConeTex.value.image.data[j*12 + 3] = attrs.cones[j].inf;

        // second
        uConeTex.value.image.data[j*12 + 4] = attrs.cones[j].axis.x;
        uConeTex.value.image.data[j*12 + 5] = attrs.cones[j].axis.y;
        uConeTex.value.image.data[j*12 + 6] = attrs.cones[j].axis.z;
        uConeTex.value.image.data[j*12 + 7] = attrs.cones[j].sup;

        // third
        uConeTex.value.image.data[j*12 + 8] = scaleConeThickness(attrs.cones[j].ctheta,attrs.scaleSizeFactor);
        // uConeTex.value.image.data[j*12 + 9] = null;
        // uConeTex.value.image.data[j*12 + 10] = null;
        // uConeTex.value.image.data[j*12 + 11] = null;

        // I SELL FREE SPACE
    }
    for (var k=0;k<attrs.cylinders.length;k++)
    {
        // CYLINDER TEXEL FORMAT: (RGBA,RGBA) => ((v1,r) , (v2,NULL))
        // the radius is inbetween the two vec3, last alpha value is null

        // one cylinder => 2 texels
        // v, radius | axis, sup

        // first
        uCylinderTex.value.image.data[k*8] = attrs.cylinders[k].v.x;
        uCylinderTex.value.image.data[k*8 + 1] = attrs.cylinders[k].v.y;
        uCylinderTex.value.image.data[k*8 + 2] = attrs.cylinders[k].v.z;
        uCylinderTex.value.image.data[k*8 + 3] = attrs.cylinders[k].radius * attrs.scaleSizeFactor;

        uCylinderTex.value.image.data[k*8 + 4] = attrs.cylinders[k].axis.x;
        uCylinderTex.value.image.data[k*8 + 5] = attrs.cylinders[k].axis.y;
        uCylinderTex.value.image.data[k*8 + 6] = attrs.cylinders[k].axis.z;
        uCylinderTex.value.image.data[k*8 + 7] = attrs.cylinders[k].sup;
    }


    // if we added / deleted an item, we have to recompile with new #define
    if ((this.numberOfSpheres != attrs.spheres.length) ||
        (this.numberOfCylinders != attrs.cylinders.length) ||
        (this.numberOfCones != attrs.cones.length))
    {
        this.numberOfSpheres = attrs.spheres.length;
        this.numberOfCones = attrs.cones.length;
        this.numberOfCylinders = attrs.cylinders.length;
        // number of item changed, let's recompile the shader with new #define
        this.fragmentShader = this.computeFragmentShader();
        // need to recompile the shader
        this.needsUpdate = true;
    }


    // do the same for the cylidners and cones
};
