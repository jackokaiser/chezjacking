"use strict";

// @see http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();

NProgress.start();
var idInter=setInterval(NProgress.inc,200);

var stats;
var numberOfSpheres;
var sphereRadius;
var controls;
var vertexShader;
var fragmentShader;


// get the DOM element to attach to
// - assume we've got jQuery to hand
var container = $('#container');

if(window.embed)
{
    stats={};
    stats.update=function(){};
    numberOfSpheres=4;
    sphereRadius=35;
}
else
{
    $('#info').fadeIn();
    stats = new Stats();
    // create the Stats element and append it to the Dome
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.append( stats.domElement );
    numberOfSpheres=20;
    sphereRadius=10;
}

function init (callback)
{

    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;


    // create a WebGL renderer, camera
    var rayTracingRenderer = new THREE.WebGLRenderer();
    rayTracingRenderer.autoClear=false;
    rayTracingRenderer.autoClearColor=false;
    rayTracingRenderer.setSize(WIDTH,HEIGHT);

    var pars={ minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
    rayTracingRenderer.rTracedTexture = new THREE.WebGLRenderTarget( WIDTH,
                                                                     HEIGHT);


    var viewProjectionInverse = new THREE.Matrix4();
    var eyePos = new THREE.Vector3();


    var camera = new THREE.PerspectiveCamera( 60,
                                              WIDTH / HEIGHT,
                                              1,
                                              1000 );

    camera.position.set(0,0,100.);
    camera.up = new THREE.Vector3(0,1,0);
    camera.lookAt(new THREE.Vector3(0,0,0));

    controls = new THREE.TrackballControls( camera );

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 3.;
    controls.panSpeed = 3;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.keys = [ 65, 83, 68 ];

    function render ()
    {
        updateCamera();
        // render ray traced scene
        rayTracingRenderer.render(scene, rayTracingCamera);
        // set up the next call
    }

    controls.addEventListener( 'change', render );

    var scene = new THREE.Scene();

    // attach the render-supplied DOM element
    // $container.append(rayTracingRenderer.domElement);
    container.append(rayTracingRenderer.domElement);



    function updateCamera() {
        camera.updateMatrixWorld();
        camera.updateMatrix();
        camera.projectionMatrixInverse.getInverse( camera.projectionMatrix );
        viewProjectionInverse.multiplyMatrices( camera.matrixWorld,
                                                camera.projectionMatrixInverse );
        viewProjectionInverse.transpose();
        eyePos.copy(camera.localToWorld(new THREE.Vector3(0.,0.,0.)));
    }

    var attributes = {
        sceneTilePosition : {
            type : 'v2',
            value : [
                new THREE.Vector2(-1,1),
                new THREE.Vector2(1,1),
                new THREE.Vector2(-1,-1),
                new THREE.Vector2(1,-1)
            ]
        }
    };
    var sphereData = [];

    for (var i=0;i<numberOfSpheres;i++)
    {
        sphereData.push(new THREE.Vector4(
            (Math.random() - 0.5) * i * 3 * sphereRadius,
            (Math.random() - 0.5) * 2 * sphereRadius,
            (Math.random() - 0.5) * i * 3 * sphereRadius,
            ((Math.random()+0.5) * sphereRadius)));
    }

    var d = new Date();

    var uniforms = {
        uTime:  {
            type: 'f', // a float
            value: 1
        },
        uEyePos : {
            type: 'v3',
            value : eyePos
        },
        uViewProjectionInverse: {
            type: 'm4',
            value: viewProjectionInverse
        },
        uSpheres : {
            type : 'v4v',
            value : sphereData
        }
    };

    var defines = "#define NUMBER_OF_SPHERES "+
        sphereData.length+"\n";

    var rayTracingMaterial = new THREE.ShaderMaterial({
        uniforms:         uniforms,
        attributes:     attributes,
        vertexShader:   vertexShader,
        fragmentShader: defines + fragmentShader
    });

    var rayQuad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2),
                                  rayTracingMaterial
                                );
    rayQuad.geometry.computeBoundingBox();
    rayQuad.geometry.computeBoundingSphere();

    //add the quad to the scene
    scene.add(rayQuad);
    var rayTracingCamera = new THREE.OrthographicCamera( WIDTH / - 2,
                                                         WIDTH / 2,
                                                         HEIGHT / 2,
                                                         HEIGHT / - 2,
                                                         -1, 10000 );
    callback();
}



function animate() {
    requestAnimationFrame( animate );
    stats.update();
    controls.update();
}

function go()
{
    try {
        init( function ()
              {
                  animate();
                  clearInterval(idInter);
                  NProgress.done();
              });
    }
    catch(e) {
        // failed to init, show an img
        $('#backup-img').show();
    }
}

function tryContinueVert (data)
{
    vertexShader = data;
    if (fragmentShader)
        go();
}
function tryContinueFrag (data)
{
    fragmentShader = data;
    if (vertexShader)
        go();
}

window.onload = function () {
    // load vertex shader request and try to continue
    $.ajax({
        url : "glsl/raytracer.vert"
    }).done(tryContinueVert);
    // load fragment shader request and try to continue
    $.ajax({
        url : "glsl/raytracer.frag"
    }).done(tryContinueFrag);
};
