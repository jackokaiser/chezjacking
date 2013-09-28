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
animate=null
vertexShader=""
fragmentShader=""
speedFactor = (r) ->
    return 1/r*1.5

if window.embed
    stats={}
    stats.update=() ->;
    numberOfSpheres=3
    sphereRadius=35
else
    $('#info').fadeIn()
    stats = new Stats()
    stats.domElement.style.position = 'absolute'
    stats.domElement.style.top = '0px'
    container.append( stats.domElement )
    numberOfSpheres=5
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
    lightDirMain = new THREE.Vector3()
    lightDirSide = new THREE.Vector3()


    camera = new THREE.PerspectiveCamera( 60,
        WIDTH / HEIGHT,
        1,
        1000 )

    camera.position.set(0,2,15)
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
    # controls.addEventListener( 'change', render )

    ##########################################
    ##########################################
    ############### raytracer specific #######
    ##########################################
    ##########################################
    generateRandomSphere = () ->
        return new THREE.Vector4(
            (Math.random()-0.5) * 20,
            0,
            (Math.random()-0.5) * 10,
            (Math.random()+0.1) * 2)

    # original sphere: let's not touch it
    sphereData.push(THREE.Vector4(0,0,0,2))
    for i in [0..numberOfSpheres]
        sphereData.push(generateRandomSphere())

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
        uLightDirMain : {
            type: 'v3',
            value : lightDirMain
        },
        uLightDirSide : {
            type: 'v3',
            value : lightDirSide
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
        },
    }
    attributes =
        sceneTilePosition :
            type : 'v2',
            value : [
                new THREE.Vector2(-1,1),
                new THREE.Vector2(1,1),
                new THREE.Vector2(-1,-1),
                new THREE.Vector2(1,-1)
            ]

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



    scene = new THREE.Scene()
    scene.add(rayQuad)
    rayTracingCamera = new THREE.OrthographicCamera( WIDTH / - 2,
        WIDTH / 2,
        HEIGHT / 2,
        HEIGHT / - 2,
        -1, 10000 )

    ##########################################
    ##########################################
    ############### app's functions ##########
    ##########################################
    ##########################################

    mlv = new THREE.Vector3(-0.5,-0.5,-1).normalize()
    slv = new THREE.Vector3(0.2,0,0.7).normalize()

    updateCamera = () ->
        camera.updateMatrixWorld()
        camera.updateMatrix()
        camera.projectionMatrixInverse.getInverse camera.projectionMatrix
        viewProjectionInverse.multiplyMatrices( camera.matrixWorld,
            camera.projectionMatrixInverse )
        viewProjectionInverse.transpose()
        eyePos.copy(camera.localToWorld(new THREE.Vector3(0,0,0)))
        projector = new THREE.Projector()
        lightDirMain.copy(projector.unprojectVector(mlv, camera)).normalize()
        lightDirSide.copy(projector.unprojectVector(slv, camera)).normalize()




    container.append(rayTracingRenderer.domElement)







    updateSphere = (v4,timeElapsed) ->
        if v4.y > 10
            v4.copy(generateRandomSphere())
        else
        # update bubble like:
        # it's going up
        v4.y+=speedFactor(v4.w)*timeElapsed*Math.random()
        # # and as a sinusoide
        v4.x+=speedFactor(v4.w)*timeElapsed*Math.sin(v4.y)
        v4.z+=speedFactor(v4.w)*timeElapsed*Math.cos(v4.y)


    begin = new Date().getTime()

    updateSphereBuffer = (first, others...) ->
        now = new Date().getTime()
        for s in others
            updateSphere(s,(now-begin)/1000)
        begin = now


    animate = () ->
        requestAnimFrame( animate )
        stats.update()
        controls.update()
        updateCamera()
        l = sphereData.length
        # we don't hit the first one
        updateSphereBuffer sphereData...
        rayTracingRenderer.render(scene, rayTracingCamera)

    # call the callback at the end of the init
    callback()






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
