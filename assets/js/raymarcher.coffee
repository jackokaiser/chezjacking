window.requestAnimFrame =
    window.requestAnimationFrame ?
    window.webkitRequestAnimationFrame ?
    window.mozRequestAnimationFrame ?
    window.oRequestAnimationFrame ?
    window.msRequestAnimationFrame ?
    (callback, element) ->
        window.setTimeout(callback, 1000 / 60)


NProgress.start()
idInter=setInterval(NProgress.inc,200);


container = $('#container')

stats=null
numberOfSpheres=null
sphereRadius=null
sphereData=[]
controls=null
vertexShader=""
fragmentShader=""

if window.embed
    stats={}
    stats.update=() ->;
    numberOfSpheres=4
    sphereRadius=35
else
    $('#info').fadeIn()
    stats = new Stats()
    stats.domElement.style.position = 'absolute'
    stats.domElement.style.top = '0px'
    container.append( stats.domElement )
    numberOfSpheres=20
    sphereRadius=10


init = (callback) ->
    WIDTH = window.innerWidth
    HEIGHT = window.innerHeight
    rayTracingRenderer = new THREE.WebGLRenderer()
    rayTracingRenderer.autoClear=false
    rayTracingRenderer.autoClearColor=false
    rayTracingRenderer.setSize(WIDTH,HEIGHT)

    pars = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
    }
    rayTracingRenderer.rTracedTexture = new THREE.WebGLRenderTarget( WIDTH,
                                                                     HEIGHT,
                                                                    pars)


    viewProjectionInverse = new THREE.Matrix4()
    eyePos = new THREE.Vector3()


    camera = new THREE.PerspectiveCamera( 60,
        WIDTH / HEIGHT,
        1,
        1000 )

    camera.position.set(0,0,100)
    camera.up = new THREE.Vector3(0,1,0)
    camera.lookAt(new THREE.Vector3(0,0,0))

    controls = new THREE.TrackballControls( camera )

    controls.rotateSpeed = 1.0
    controls.zoomSpeed = 3
    controls.panSpeed = 3

    controls.noZoom = false
    controls.noPan = false

    controls.staticMoving = true
    controls.dynamicDampingFactor = 0.3

    controls.keys = [ 65, 83, 68 ]

    updateCamera = () ->
        camera.updateMatrixWorld()
        camera.updateMatrix()
        camera.projectionMatrixInverse.getInverse camera.projectionMatrix
        viewProjectionInverse.multiplyMatrices( camera.matrixWorld,
            camera.projectionMatrixInverse )
        viewProjectionInverse.transpose()
        eyePos.copy(camera.localToWorld(new THREE.Vector3(0,0,0)))

    render = () ->
        updateCamera()
        rayTracingRenderer.render(scene, rayTracingCamera)


    controls.addEventListener( 'change', render )

    scene = new THREE.Scene()

    container.append(rayTracingRenderer.domElement)





    attributes = {
        sceneTilePosition : {
            type : 'v2',
            value : [
                new THREE.Vector2(-1,1),
                new THREE.Vector2(1,1),
                new THREE.Vector2(-1,-1),
                new THREE.Vector2(1,-1)
            ]
        }
    }

    d = new Date()
    for i in [0..numberOfSpheres]
        sphereData.push(new THREE.Vector4(
            (Math.random() - 0.5),
            (Math.random() - 0.5),
            (Math.random() - 0.5),
            ((Math.random()+0.5) * sphereRadius)))

    maxDistance = 0;
    curDist = 0;
    for i in sphereData
        curDist = eyePos.distanceTo(sphereData) + sphereData.w
        if curDist > maxDistance
            maxDistance = curDist

    uniforms = {
        uTime:  {
            type: 'f',
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
        uMaxDistance : {
            type : 'f',
            value : maxDistance
        }

    }


    defines = "#define NUMBER_OF_SPHERES "+
        sphereData.length+"\n"

    rayTracingMaterial = new THREE.ShaderMaterial(
        uniforms:         uniforms,
        attributes:     attributes,
        vertexShader:   vertexShader,
        fragmentShader: defines + fragmentShader)

    rayQuad = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2),
        rayTracingMaterial)

    rayQuad.geometry.computeBoundingBox()
    rayQuad.geometry.computeBoundingSphere()

    scene.add(rayQuad)
    rayTracingCamera = new THREE.OrthographicCamera( WIDTH / - 2,
        WIDTH / 2,
        HEIGHT / 2,
        HEIGHT / - 2,
        -1, 10000 )

    callback()




animate = () ->
    requestAnimFrame( animate )
    stats.update()
    controls.update()


go = () ->
    init(() ->
        animate()
        clearInterval(idInter)
        NProgress.done())
# go = () ->
#     try
#         init(
#             () ->
#                 animate()
#                 clearInterval(idInter)
#                 NProgress.done())
#     catch e
#         $('#backup-img').show()

tryContinueVert = (data) ->
    vertexShader = data
    if (fragmentShader)
        go()

tryContinueFrag = (data) ->
    fragmentShader = data
    if (vertexShader)
        go()

window.onload = () ->
    $.ajax(
        url : "glsl/raytracer.vert"
    ).done(tryContinueVert)
    $.ajax(
        url : "glsl/raymarcher.frag"
    ).done(tryContinueFrag)
