'use strict';


/**
 * @constructor
 */
var RaytracerRenderer = function (shaderDico,attrs)
{
    this.defaultRenderOutput="ENV_MAP";
    // this.defaultRenderOutput="PHONG_SHADING";

    this.cameraMan=attrs.cameraMan;

    this.pointLight = attrs.pointLight;

    this.maxTextureSize = attrs.maxTextureSize;
    this.maxTextureUnits = attrs.maxTextureUnits;

    this.screen_width = attrs.screen_width;
    this.screen_height = attrs.screen_height;
    this.backgroundRTT = attrs.backgroundRTT;
    this.verticesTexture = attrs.verticesTexture;
    this.primitivesTexture = attrs.primitivesTexture;

    this.scaleSizeFactor = 1;

    // sqrt of the number of vertices sampled
    var dataTextureSize = 1024/2;
    // var dataTextureSize = 1024/8;

    // projected obbs texture
    // also background texture for surface ray tracing
    this.tmpTexture = new THREE.WebGLRenderTarget( this.screen_width,
                                                   this.screen_height,
                                                   {
                                                       minFilter: THREE.NearestFilter,
                                                       magFilter: THREE.NearestFilter,
                                                       format: THREE.RGBFormat,
                                                       depthBuffer : false
                                                   });

    // depth texture of the skel raytracer
    // only required if we're raytracing
    // holds depth of the bounding volumes (in and out) when needed
    this.depthTexture = new THREE.WebGLRenderTarget( this.screen_width,
                                                     this.screen_height,
                                                     {
                                                         minFilter: THREE.LinearFilter,
                                                         magFilter: THREE.NearestFilter,
                                                         format: THREE.RGBFormat,
                                                         depthBuffer : false
                                                     });



    this.refinement = 0;
    var refinementMax = 5;
    this.multiresolutionSize = [];
    // this.multiresolutionSize.push(new THREE.Vector3(this.screen_width/5,this.screen_height/5));
    this.multiresolutionSize.push(new THREE.Vector2(this.screen_width,this.screen_height));
    // for ( var refineLvl = refinementMax; refineLvl > 0; refineLvl--)
    // {
    //     this.multiresolutionSize.push(new THREE.Vector2(this.screen_width,this.screen_height)
    //                                   .divideScalar(refineLvl));
    // }

    // Screen objects => item projected to the screen
    // Main objects => where the magic happens (debug or raytrace)

    var states = [
        "DISCARDED",
        "SURFACE_FOUND",
        "MARCHING"
    ];
    var maxNumberOfStep = 5;

    this.raytracingScene = new THREE.Scene();

    this.raytracingCamera = new THREE.OrthographicCamera( this.screen_width / - 2, this.screen_width / 2,
                                                          this.screen_height / 2, this.screen_height / - 2,
                                                          -1, 10000 );

    // texture to project to the screen
    this.screenTexture = new THREE.WebGLRenderTarget( this.screen_width,
                                                      this.screen_height,
                                                      {
                                                          minFilter: THREE.NearestFilter,
                                                          magFilter: THREE.LinearFilter,
                                                          format: THREE.RGBFormat,
                                                          depthBuffer : false
                                                      });

    this.skelRayQuad = new THREE.Mesh(  new THREE.PlaneGeometry( 2, 2),
                                        new SkelRaytracerMaterial(
                                            shaderDico,
                                            {
                                                maxTextureSize : this.maxTextureSize,
                                                maxTextureUnits : this.maxTextureUnits,
                                                backgroundRTT : this.backgroundRTT,
                                                verticesTexture : this.verticesTexture,
                                                primitivesTexture : this.primitivesTexture,
                                                stencilTexture : this.tmpTexture,
                                                defaultRenderOutput : this.defaultRenderOutput,
                                                states : states
                                            }));
    this.skelRayQuad.geometry.computeBoundingBox();
    this.skelRayQuad.geometry.computeBoundingSphere();



    this.evalMarchQuad = new THREE.Mesh( new THREE.PlaneGeometry( 2,
                                                                  2),
                                         new EvaluationMaterial(
                                             shaderDico,
                                             {
                                                 screen_width : this.screen_width,
                                                 screen_height : this.screen_height,
                                                 textureSize : dataTextureSize,
                                                 primitiveToDebug : attrs.primitiveToDebug,
                                                 depthTexture : this.depthTexture,
                                                 action : "March",
                                                 states : states,
                                                 maxNumberOfStep : maxNumberOfStep
                                             }));
    this.evalMarchQuad.geometry.computeBoundingBox();
    this.evalMarchQuad.geometry.computeBoundingSphere();


    this.evalRenderQuad = new THREE.Mesh( new THREE.PlaneGeometry( 2,
                                                                   2),
                                          new EvaluationMaterial(
                                              shaderDico,
                                              {
                                                  screen_width : this.screen_width,
                                                  screen_height : this.screen_height,
                                                  textureSize : dataTextureSize,
                                                  primitiveToDebug : attrs.primitiveToDebug,
                                                  depthTexture : this.screenTexture,
                                                  backgroundRTT : this.backgroundRTT,
                                                  action : "Render",
                                                  states : states,
                                                  maxNumberOfStep : maxNumberOfStep
                                              }));
    this.evalRenderQuad.geometry.computeBoundingBox();
    this.evalRenderQuad.geometry.computeBoundingSphere();


    this.evalDebugQuad = new THREE.Mesh( new THREE.PlaneGeometry( 2,
                                                                  2),
                                         new EvaluationMaterial(
                                             shaderDico,
                                             {
                                                 screen_width : this.screen_width,
                                                 screen_height : this.screen_height,
                                                 textureSize : dataTextureSize,
                                                 primitiveToDebug : attrs.primitiveToDebug,
                                                 depthTexture : this.depthTexture,
                                                 backgroundRTT : this.backgroundRTT,
                                                 valueToDebug : attrs.valueToDebug,
                                                 action : "Debug",
                                                 states : states,
                                                 maxNumberOfStep : maxNumberOfStep
                                             }));
    this.evalDebugQuad.geometry.computeBoundingBox();
    this.evalDebugQuad.geometry.computeBoundingSphere();


    this.screenQuad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2),
                                      new PostProcessMaterial(
                                          shaderDico,
                                          {
                                              texture : this.screenTexture,
                                              width : this.screen_width,
                                              height : this.screen_height
                                          }));
    this.screenQuad.geometry.computeBoundingBox();
    this.screenQuad.geometry.computeBoundingSphere();

    this.copyQuad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2),
                                    new CopyMaterial(
                                        shaderDico,
                                        {
                                            texture : this.screenTexture
                                        }));
    this.copyQuad.geometry.computeBoundingBox();
    this.copyQuad.geometry.computeBoundingSphere();






    this.raytracingScene.add(this.skelRayQuad);
    this.raytracingScene.add(this.evalMarchQuad);
    this.raytracingScene.add(this.evalRenderQuad);
    this.raytracingScene.add(this.evalDebugQuad);
    this.raytracingScene.add(this.screenQuad);
    this.raytracingScene.add(this.copyQuad);


    this.viewProjectionInverse = new THREE.Matrix4();
    this.normalMatrix = new THREE.Matrix3();

    // OBB projections
    this.numberOfOBBs = 300;
    this.meshOBBs = null;
    this.initializeGeometry();
    this.geometryOBBs.vertices.currentIdx = 0;
    this.geometryOBBs.faces.currentIdx = 0;

    this.skelRayQuad.visible=false;
    this.evalMarchQuad.visible=false;
    this.evalRenderQuad.visible=false;
    this.evalDebugQuad.visible=false;
    this.screenQuad.visible=false;
    this.copyQuad.visible=false;
    this.meshOBBs.visible=false;

};


RaytracerRenderer.prototype = {
    setMultiresolutionSize : function (vSize)
    {
        // TODO
        // will apply to eval quad as well

        var w=vSize.x;
        var h=vSize.y;
        // the size of the quad on which we are doing our raytracing
        // top left
        this.skelRayQuad.geometry.vertices[0].set(-w/this.screen_width,
                                           h/this.screen_height);
        // top right
        this.skelRayQuad.geometry.vertices[1].set(w/this.screen_width,
                                           h/this.screen_height);
        // bottom left
        this.skelRayQuad.geometry.vertices[2].set(-w/this.screen_width,
                                           -h/this.screen_height);
        // bottom right
        this.skelRayQuad.geometry.vertices[3].set(w/this.screen_width,
                                           -h/this.screen_height);
        this.skelRayQuad.geometry.verticesNeedUpdate=true;

        // the coordinates where we have to fetch raytracing's texture
        this.screenQuad.material.updateMultiresolutionSize(w,h);
    },

    updateSkelData : function (attrs) {

        var cones = attrs.cones;
        var cylinders = attrs.cylinders;
        var spheres = attrs.spheres ;
        var parameters={
            cones: cones,
            cylinders: cylinders,
            spheres: spheres,
            eyePos: this.eyePos,
            viewProjectionInverse : this.viewProjectionInverse,
            normalMatrix : this.normalMatrix,
            pointLight : this.pointLight,
            // update the thickness of object we raytrace
            scaleSizeFactor : this.scaleSizeFactor,
            maxDistance : this.maxDistance
        };

        this.skelRayQuad.material.update(parameters);
        ///////// update the obb buffer
        var currentNumberOfObjects =  cones.length + cylinders.length + spheres.length;
        // (indeed we have one OBB per object)
        if (this.numberOfOBBs < currentNumberOfObjects)
        {
            // oops, too much objects, let's recreate a new geometry buffer
            // amortized complexity
            this.numberOfOBBs = currentNumberOfObjects * 2;
            this.initializeGeometry();
        }
        else
        {
            // set the unused part of the buffer to null datas
            this.resetGeometryBuffer(currentNumberOfObjects);
        }

        this.geometryOBBs.vertices.currentIdx = 0;
        this.geometryOBBs.faces.currentIdx = 0;

        ///////// update obbs values
        // with respect to our scaleFactor

        // for the sphere obbs, we also want to expand their A-B
        // indeed their obbs doens't react the same way to a changement of thickness
        // we need to consider each axis
        // (actually cones and cylinders as well,
        // but we assume the part we're missing is within a sphereOBB)
        this.addOBBsGeometry(spheres,this.scaleSizeFactor,true);
        this.addOBBsGeometry(cones,this.scaleSizeFactor);
        this.addOBBsGeometry(cylinders,this.scaleSizeFactor);
        // should prevent from wrong culling
        this.geometryOBBs.computeBoundingBox();
        this.geometryOBBs.computeBoundingSphere();
        this.geometryOBBs.verticesNeedUpdate = true;
    },
    renderLow : function (renderer) {
        // reset the refinement level
        this.refinement=0;
        // set the resolution size
        this.setMultiresolutionSize(this.multiresolutionSize[this.refinement]);
        // render the frame
        this.renderSkel(renderer);
    },
    renderRefine : function(renderer)
    {
        // if there's still refinement to do
        if (this.refinement < this.multiresolutionSize.length)
        {
            console.log("refine to level "+this.refinement);
            // reset the refinement level
            // set the resolution size
            this.setMultiresolutionSize(this.multiresolutionSize[this.refinement]);
            // render the frame
            this.renderSkel(renderer);
            this.refinement++;
        }
    },
    renderSkelRTT : function (renderer) {
        // TODO : remove obselete multi res steps
        // projecting obbs to texture
        this.meshOBBs.visible=true;
        renderer.render(this.raytracingScene,this.cameraMan.camera,this.tmpTexture,true);
        this.meshOBBs.visible=false;

        // raytrace the whole quad with early discard of pixel not in obbs
        this.skelRayQuad.visible=true;
        renderer.render(this.raytracingScene,this.raytracingCamera,this.depthTexture,false);
        this.skelRayQuad.visible=false;
    },
    renderSkel : function (renderer) {
        /////////// useful for debugging
        // projecting obbs to screen
        // renderer.render(this.projectedOBBsScene,this.cameraMan.camera);
        // projecting obbs to texture
        this.meshOBBs.visible=true;
        renderer.render(this.raytracingScene,this.cameraMan.camera,this.tmpTexture,true);
        this.meshOBBs.visible=false;

        // // raytrace the whole quad with early discard of pixel not in obbs
        this.skelRayQuad.visible=true;
        renderer.render(this.raytracingScene,this.raytracingCamera,this.screenTexture,false);
        this.skelRayQuad.visible=false;

        // // render the texture to the screen, resize it (linear interpolation done by OpenGL)
        this.screenQuad.visible=true;
        renderer.render(this.raytracingScene,this.raytracingCamera);
        this.screenQuad.visible=false;
    },
    initializeGeometry : function ()
    {
        // this function assumes that we have reset the numberOfOBBs accordingly
        if (this.meshOBBs !== null)
            this.raytracingScene.remove(this.meshOBBs);

        this.geometryOBBs = new THREE.Geometry();
        // initialize the geometry vertices buffer
        // we have 8 vertices per OBB
        for (var i=0;i<this.numberOfOBBs*8;i++)
        {
            this.geometryOBBs.vertices.push(new THREE.Vector3(0,0,0));
        }
        // initialize the geometry face buffer
        // we have 6 faces per OBB
        for (var j=0;j<this.numberOfOBBs*6;j++)
        {
            this.geometryOBBs.faces.push(new THREE.Face4(0,0,0,0));
        }
        // create the mesh along with the geometry and a black material
        this.meshOBBs = new THREE.Mesh(this.geometryOBBs,new THREE.MeshBasicMaterial(
            {
                color : new THREE.Color(0x00ffff),
                side : THREE.DoubleSide
            }));

        // add the mesh to the scene
        this.raytracingScene.add(this.meshOBBs);
        this.meshOBBs.visible=false;
    },

    /**
     * this functions look at obbs description in the array,
     * compute their geometry and add it to the geometry buffer
     * is scales the radius of the OBB when adding it,
     * handy when rendering bounding volumes
     * if scaleOnABFactor is true, we also scale size on AB axis
     *
     * @param {Array.<{pointA,pointB,expendingVector,radius}>} sceneOBBs
     * @param {number} scaleSizeFactor factor we want to scale the OBBs
     * @param {boolean=} scaleOnABFactor whether we want to scale on AB (defaults: no)
     *
     * @return
     */
    addOBBsGeometry : function (sceneOBBs, scaleSizeFactor, scaleOnABFactor)
    {
        var operationOnAB;
        if (scaleOnABFactor)
        {
            // lets move a and b along their axis
            operationOnAB = function(a,b)
            {
                var middlePoint = new THREE.Vector3().addVectors(a,b).divideScalar(2);
                var expendVector = new THREE.Vector3().subVectors(b,a)
                    .multiplyScalar(scaleSizeFactor/2);

                a.copy(middlePoint).sub(expendVector);
                b.copy(middlePoint).add(expendVector);
            };
        }
        else
        {
            // identity func, we don't touch a and b
            operationOnAB = function(a,b){};
        }

        // scene vertices that define one OBB
        var pointsInScene = [
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3(),
            new THREE.Vector3()
        ];
        var expend1 = new THREE.Vector3();
        var expend2 = new THREE.Vector3();
        var axis = new THREE.Vector3();
        var a = new THREE.Vector3();
        var b = new THREE.Vector3();
        var radius;

        var curIdxVert = this.geometryOBBs.vertices.currentIdx;
        var curIdxFace = this.geometryOBBs.faces.currentIdx;

        for (var i=0;i<sceneOBBs.length;i++)
        {
            a.copy(sceneOBBs[i].pointA);
            b.copy(sceneOBBs[i].pointB);
            radius = sceneOBBs[i].radius;

            // function that modify a and b accordingly to the scale factor
            // or doesnt :-)
            operationOnAB(a,b);

            // get the OBBs points
            axis.subVectors(b,a)
                .normalize();
            // let's get expend1 and expend2,
            // the direction and radius in which to extend our obb
            expend1.copy(sceneOBBs[i].expendingVector)
                .normalize()
                .multiplyScalar(radius * scaleSizeFactor);
            expend2.crossVectors(sceneOBBs[i].expendingVector,axis)
                .normalize()
                .multiplyScalar(radius * scaleSizeFactor);

            // extract 3D vertices of the iem OBB
            pointsInScene[0].copy(a).add(expend1).add(expend2); // A+e1+e2
            pointsInScene[1].copy(a).add(expend1).sub(expend2); // A+e1-e2
            pointsInScene[2].copy(a).sub(expend1).sub(expend2); // A-e1-e2
            pointsInScene[3].copy(a).sub(expend1).add(expend2); // A-e1+e2

            pointsInScene[4].copy(b).add(expend1).add(expend2); // B+e1+e2
            pointsInScene[5].copy(b).add(expend1).sub(expend2); // B+e1-e2
            pointsInScene[6].copy(b).sub(expend1).sub(expend2); // B-e1-e2
            pointsInScene[7].copy(b).sub(expend1).add(expend2); // B-e1+e2

            // push the vertices
            // curIdxVert : previous idx of the vertices buffer before that function call
            // i : idx of the current object of the object array we dealing
            // (we have 8 vertices per OBB (=object))
            for (var j=0;j<8;j++)
                this.geometryOBBs.vertices[curIdxVert+i*8+j].copy(pointsInScene[j]);

            // push the faces (6 per OBB)
            // A face
            this.geometryOBBs.faces[curIdxFace+i*6].set(
                curIdxVert+i*8,
                curIdxVert+i*8+1,
                curIdxVert+i*8+2,
                curIdxVert+i*8+3);
            // B face
            this.geometryOBBs.faces[curIdxFace+i*6+1].set(
                curIdxVert+i*8+4,
                curIdxVert+i*8+5,
                curIdxVert+i*8+6,
                curIdxVert+i*8+7);
            // the four others
            this.geometryOBBs.faces[curIdxFace+i*6+2].set(
                curIdxVert+i*8,
                curIdxVert+i*8+1,
                curIdxVert+i*8+5,
                curIdxVert+i*8+4);
            this.geometryOBBs.faces[curIdxFace+i*6+3].set(
                curIdxVert+i*8+2,
                curIdxVert+i*8+3,
                curIdxVert+i*8+7,
                curIdxVert+i*8+6);
            this.geometryOBBs.faces[curIdxFace+i*6+4].set(
                curIdxVert+i*8,
                curIdxVert+i*8+3,
                curIdxVert+i*8+7,
                curIdxVert+i*8+4);
            this.geometryOBBs.faces[curIdxFace+i*6+5].set(
                curIdxVert+i*8+1,
                curIdxVert+i*8+2,
                curIdxVert+i*8+6,
                curIdxVert+i*8+5);

            // we have new current idx, let's store them where we've found them
            this.geometryOBBs.vertices.currentIdx = sceneOBBs.length*8 + curIdxVert;
            this.geometryOBBs.faces.currentIdx = sceneOBBs.length*6 + curIdxFace;

        }
    },
    resetGeometryBuffer : function (begin)
    {
        // set from begin to end vertices to 0
        for (var i=begin*8; i<this.geometryOBBs.vertices.length; i++)
        {
            this.geometryOBBs.vertices[i].set(0,0,0);
        }
        // set from begin to face to 0
        for (var j=begin*6; j<this.geometryOBBs.faces.length; j++)
        {
            this.geometryOBBs.faces[j].set(0,0,0,0);
        }
    },

    updateShared : function(blobtreeAABB)
    {
        ///////// update the raytracer material
        ///////// those are actually updated in the skelraytracer...
        this.cameraMan.rotNode.updateMatrixWorld();
        this.cameraMan.rotNode.updateMatrix();
        this.cameraMan.transNode.updateMatrixWorld();
        this.cameraMan.transNode.updateMatrix();
        this.cameraMan.camera.updateMatrixWorld();
        this.cameraMan.camera.updateMatrix();

        // the unprojection matrix
        var camera = this.cameraMan.camera;

        camera.projectionMatrixInverse.getInverse( camera.projectionMatrix );
        this.viewProjectionInverse.multiplyMatrices( camera.matrixWorld,
                                                     camera.projectionMatrixInverse );
        this.eyePos =  this.cameraMan.getCameraWorldPosition();

        this.normalMatrix.getNormalMatrix(camera.matrixWorld);

        var blobBoundingSphere = blobtreeAABB.getBoundingSphere();

        // this.maxDistance = 4096.;
        this.maxDistance = this.eyePos.clone()
            .sub(blobBoundingSphere.center)
            .length()
            + blobBoundingSphere.radius;
    },
    // update blobtree and stuff
    updateEval : function (blobtree) {

        var parameters={
            blobtree : blobtree,
            eyePos: this.eyePos,
            viewProjectionInverse : this.viewProjectionInverse,
            pointLight : this.pointLight,
            maxDistance : this.maxDistance
        };

        this.evalMarchQuad.material.update(parameters);
        this.evalRenderQuad.material.update(parameters);
    },
    updateDebug : function (blobtree,planeDepth,planeSize)
    {
        var parameters={
            blobtree : blobtree,
            eyePos: this.eyePos,
            viewProjectionInverse : this.viewProjectionInverse,
            pointLight : this.pointLight,
            maxDistance : this.maxDistance
        };

        this.evalDebugQuad.material.update(parameters);
        this.evalDebugQuad.material.setEvaluationParameters(blobtree,planeDepth,planeSize);
    },
    renderEvalDebug : function (renderer) {
        this.evalDebugQuad.visible=true;
        renderer.render(this.raytracingScene,this.raytracingCamera);
        this.evalDebugQuad.visible=false;
    },
    // render surface and stuff
    renderEval : function (renderer) {
        // march and compute depth
        this.evalMarchQuad.visible=true;
        renderer.render(this.raytracingScene,this.raytracingCamera,this.screenTexture,false);
        this.evalMarchQuad.visible=false;


        // // render to screen
        this.evalRenderQuad.visible=true;
        renderer.render(this.raytracingScene,this.raytracingCamera);
        this.evalRenderQuad.visible=false;

        // for the next render, we want to start marching at the calculated depth
        // therefore we copy depth values in inputs of our surf raytracer
        this.copyQuad.visible=true;
        renderer.render(this.raytracingScene,this.raytracingCamera,this.depthTexture,false);
        this.copyQuad.visible=false;



        // multires
        // this.screenQuad.visible=true;
        // renderer.render(this.raytracingScene,this.raytracingCamera);
        // this.screenQuad.visible=false;
    },
    setSkelRTT : function (scaleSizeFactor)
    {
        this.skelRayQuad.material.changeRenderOutput("DEPTH_MAP");
        this.setMultiresolutionSize(new THREE.Vector2(this.screen_width,this.screen_height));
        this.scaleSizeFactor = scaleSizeFactor;
    },
    unsetSkelRTT : function (scaleSizeFactor)
    {
        this.skelRayQuad.material.changeRenderOutput(this.defaultRenderOutput);
        this.scaleSizeFactor = scaleSizeFactor;
    }
};
