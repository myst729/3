import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

(async () => {
  // stats.js
  const stats = new Stats()
  document.body.appendChild(stats.dom)

  // scene
  const canvas = document.getElementById('canvas')
  const screenW = window.innerWidth
  const screenH = window.innerHeight
  const center = new THREE.Vector3(0, 0, 0)
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xcccccc)

  // camera
  const camera = new THREE.PerspectiveCamera(100, screenW / screenH, 0.25, 1000)
  camera.position.y = 25
  camera.position.z = 60
  camera.lookAt(center)

  // controls
  const controls = new OrbitControls(camera, canvas)
  controls.autoRotate = true
  controls.enablePan = false
  controls.enableZoom = false
  controls.target = center

  // piggy
  const mtlLoader = new MTLLoader()
  const materials = await mtlLoader.loadAsync('pig.mtl')
  materials.preload()

  const objLoader = new OBJLoader()
  objLoader.setMaterials(materials)
  const piggy = await objLoader.loadAsync('pig.obj')
  piggy.traverse((child) => {
    child.castShadow = true
    child.receiveShadow = true
  })
  scene.add(piggy)

  // plane
  const textureLoader = new THREE.TextureLoader()
  const texture = textureLoader.load('checker.png')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.magFilter = THREE.NearestFilter
  texture.repeat.set(5, 5)

  const planeGeo = new THREE.PlaneBufferGeometry(50, 50)
  const planeMat = new THREE.MeshPhongMaterial({ map: texture, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(planeGeo, planeMat)
  plane.rotation.x = Math.PI * -.5
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

  // dat.gui
  const gui = new GUI()
  // const cameraFolder = gui.addFolder('Camera')
  // cameraFolder.add(camera.position, 'z', 0, 100)
  // cameraFolder.open()
  const piggyFolder1 = gui.addFolder('Piggy Position')
  piggyFolder1.add(piggy.position, 'x', -20, 20)
  piggyFolder1.add(piggy.position, 'y', -20, 20)
  piggyFolder1.add(piggy.position, 'z', -20, 20)
  piggyFolder1.open()
  const piggyFolder2 = gui.addFolder('Piggy Spin')
  piggyFolder2.add(piggy.rotation, 'x', 0, Math.PI * 2)
  piggyFolder2.add(piggy.rotation, 'y', 0, Math.PI * 2)
  piggyFolder2.add(piggy.rotation, 'z', 0, Math.PI * 2)
  piggyFolder2.open()
  const textureFolder = gui.addFolder('Plane Texture')
  textureFolder.add(texture.repeat, 'x', 1, 10)
  textureFolder.add(texture.repeat, 'y', 1, 10)
  textureFolder.open()
  const planeFolder = gui.addFolder('Plane Spin')
  planeFolder.add(plane.rotation, 'z', 0, Math.PI * 2)
  planeFolder.open()
  const lightFolder = gui.addFolder('Lighting Position')
  lightFolder.add(spotLight.position, 'x', 0, 30)
  lightFolder.add(spotLight.position, 'y', 0, 100)
  lightFolder.add(spotLight.position, 'z', 0, 50)
  lightFolder.open()

  // renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas })
  renderer.shadowMapEnabled = true
  renderer.setSize(screenW, screenH)
  renderer.setAnimationLoop((time) => {
    stats.begin()
    controls.update()
    renderer.render(scene, camera)
    stats.end()
  })

  console.log({ scene })
})()
