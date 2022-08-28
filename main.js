import './style.styl'

import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { PixelShader } from 'three/examples/jsm/shaders/PixelShader.js'

(async () => {
  // loading
  const loadingManager = new THREE.LoadingManager(() => {
    const loadingScreen = document.getElementById('loading')
    loadingScreen.className = 'fade'
    loadingScreen.addEventListener('transitionend', (e) => {
      loadingScreen.remove()
    })
  })

  // scene
  const sceneOptions = { autoRotate: true, pixelShader: true, pixelSize: 4 }
  const screenW = window.innerWidth
  const screenH = window.innerHeight
  const scaler = window.devicePixelRatio
  const center = new THREE.Vector3(0, 0, 0)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xcccccc)

  // camera
  const camera = new THREE.PerspectiveCamera(100, screenW / screenH, 0.25, 1000)
  camera.position.y = 25
  camera.position.z = 60
  camera.lookAt(center)

  // piggy
  const mtlLoader = new MTLLoader(loadingManager)
  const materials = await mtlLoader.loadAsync('piggy.mtl')
  materials.preload()

  const objLoader = new OBJLoader(loadingManager)
  objLoader.setMaterials(materials)
  const piggy = await objLoader.loadAsync('piggy.obj')
  piggy.traverse((child) => {
    child.castShadow = true
    child.receiveShadow = true
  })
  scene.add(piggy)

  // plane
  const textureLoader = new THREE.TextureLoader(loadingManager)
  const texture = textureLoader.load('checker.png')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.NearestFilter
  texture.repeat.set(5, 5)

  const planeGeo = new THREE.PlaneBufferGeometry(50, 50)
  const planeMat = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(planeGeo, planeMat)
  plane.rotation.x = Math.PI * .5
  plane.position.x = 0
  plane.position.y = 0
  plane.position.z = 0
  plane.receiveShadow = true
  scene.add(plane)

  // lights
  const ambientLight = new THREE.AmbientLight(0xdddddd)
  scene.add(ambientLight)
  // const pointLight = new THREE.PointLight(0xffffff, 2, 100)
  // pointLight.position.set(10, 50, 75)
  // scene.add(pointLight)
  // const directionalLight = new THREE.DirectionalLight(0xffffff, .5)
  // directionalLight.position.set(20, 50, 30)
  // scene.add(directionalLight)
  const spotLight = new THREE.SpotLight(0xffffff, 2, 100, Math.PI / 6, 25)
  spotLight.position.set(10, 40, 25)
  spotLight.castShadow = true
  spotLight.shadowCameraNear = 2
  spotLight.shadowCameraFar = 10
  spotLight.shadowCameraFov = 30
  spotLight.shadowMapWidth = 1024
  spotLight.shadowMapHeight = 1024
  spotLight.shadowDarkness = 0.3
  scene.add(spotLight)

  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(screenW, screenH)
  renderer.shadowMapEnabled = true
  document.body.appendChild(renderer.domElement)
  renderer.setAnimationLoop((time) => {
    stats.begin()
    controls.autoRotate = sceneOptions.autoRotate
    controls.update()
    if (sceneOptions.pixelShader) {
      pixelPass.uniforms.pixelSize.value = sceneOptions.pixelSize
      composer.render()
    } else {
      renderer.render(scene, camera)
    }
    stats.end()
  })

  // controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.autoRotate = true
  controls.enablePan = false
  controls.enableZoom = false
  controls.target = center

  // shader
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const pixelPass = new ShaderPass(PixelShader)
  pixelPass.uniforms.resolution.value = new THREE.Vector2(screenW, screenH)
  pixelPass.uniforms.resolution.value.multiplyScalar(scaler)
  composer.addPass(pixelPass)

  // stats.js
  const stats = new Stats()
  document.body.appendChild(stats.dom)

  // dat.gui
  const gui = new GUI()
  // const cameraFolder = gui.addFolder('Camera')
  // cameraFolder.add(camera.position, 'z', 0, 100)
  // cameraFolder.open()
  const sceneFolder = gui.addFolder('Scene')
  sceneFolder.add(sceneOptions, 'autoRotate').name('Auto Rotate')
  sceneFolder.add(sceneOptions, 'pixelShader').name('Pixel Shader')
  sceneFolder.add(sceneOptions, 'pixelSize', 2, 16).name('Pixel Size')
  sceneFolder.open()
  const piggyFolder = gui.addFolder('Piggy')
  piggyFolder.add(piggy.position, 'x', -20, 20).name('Position X')
  piggyFolder.add(piggy.position, 'y', -20, 20).name('Position Y')
  piggyFolder.add(piggy.position, 'z', -20, 20).name('Position Z')
  piggyFolder.add(piggy.rotation, 'x', 0, Math.PI * 2).name('Rotation X')
  piggyFolder.add(piggy.rotation, 'y', 0, Math.PI * 2).name('Rotation Y')
  piggyFolder.add(piggy.rotation, 'z', 0, Math.PI * 2).name('Rotation Z')
  piggyFolder.open()
  const planeFolder = gui.addFolder('Plane')
  planeFolder.add(plane.rotation, 'x', 0, Math.PI * 2).name('Rotation X')
  planeFolder.add(plane.rotation, 'y', 0, Math.PI * 2).name('Rotation Y')
  planeFolder.add(plane.rotation, 'z', 0, Math.PI * 2).name('Rotation Z')
  planeFolder.add(texture.repeat, 'x', 1, 10).name('Texture Repeat X')
  planeFolder.add(texture.repeat, 'y', 1, 10).name('Texture Repeat Y')
  planeFolder.open()
  const lightFolder = gui.addFolder('Lighting')
  lightFolder.add(spotLight.position, 'x', 0, 30).name('Position X')
  lightFolder.add(spotLight.position, 'y', 0, 100).name('Position Y')
  lightFolder.add(spotLight.position, 'z', 0, 50).name('Position Z')
  lightFolder.open()

  window.addEventListener('resize', (e) => {
    const reziedW = window.innerWidth
    const reziedH = window.innerHeight
    camera.aspect = reziedW / reziedH
    camera.updateProjectionMatrix()
    renderer.setSize(reziedW, reziedH)
    pixelPass.uniforms.resolution.value.set(reziedW, reziedH).multiplyScalar(scaler)
  }, false)

  console.log({ scene })
})()
