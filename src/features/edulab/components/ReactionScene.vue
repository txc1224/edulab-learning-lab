<template>
  <div ref="sceneRoot" class="reaction-scene" aria-label="化学反应三维动画">
    <div v-if="webglError" class="reaction-scene__fallback">
      <strong>当前设备无法启用 3D 画面</strong>
      <span>右侧步骤和守恒信息仍然可以继续阅读。</span>
    </div>
    <div v-if="showLabels && labelPositions.length" class="reaction-scene__labels" aria-hidden="true">
      <svg class="reaction-scene__leaders">
        <line
          v-for="label in labelPositions"
          :key="`leader-${label.id}`"
          :x1="label.x"
          :y1="label.y + 14"
          :x2="label.anchorX"
          :y2="label.anchorY - 22"
        />
      </svg>
      <span
        v-for="label in labelPositions"
        :key="label.id"
        class="reaction-scene__label"
        :style="{ left: `${label.x}px`, top: `${label.y}px`, color: label.color }"
      >{{ label.text }}</span>
    </div>
    <div class="reaction-scene__hint">拖拽旋转 · 滚轮缩放</div>
  </div>
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { interpolateAtoms } from '../services/reaction-engine.js'

const props = defineProps({
  reactionData: { type: Object, default: null },
  progress: { type: Number, default: 0 },
  showLabels: { type: Boolean, default: true }
})

const sceneRoot = ref(null)
const labelPositions = ref([])
const webglError = ref('')

let scene
let camera
let renderer
let controls
let animationFrame
let resizeObserver
let atomMeshes = new Map()
let bondMeshes = []

function disposeObject(object) {
  object.traverse?.((child) => {
    child.geometry?.dispose?.()
    if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose())
    else child.material?.dispose?.()
  })
}

function clearSceneObjects() {
  atomMeshes.forEach((mesh) => {
    scene?.remove(mesh)
    disposeObject(mesh)
  })
  bondMeshes.forEach(({ mesh }) => {
    scene?.remove(mesh)
    disposeObject(mesh)
  })
  atomMeshes = new Map()
  bondMeshes = []
}

function createAtomMesh(atom) {
  const geometry = new THREE.SphereGeometry(atom.radius, 28, 20)
  const material = new THREE.MeshStandardMaterial({
    color: atom.color,
    roughness: 0.38,
    metalness: 0.04
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.atomId = atom.id
  scene.add(mesh)
  atomMeshes.set(atom.id, mesh)
}

function createBondMesh(bond, kind) {
  const geometry = new THREE.CylinderGeometry(0.055, 0.055, 1, 10)
  const color = kind === 'broken' ? 0xef6a62 : kind === 'formed' ? 0x32b57c : 0x94a3b8
  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: kind === 'kept' ? 0.72 : 0.95,
    roughness: 0.5
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
  bondMeshes.push({ mesh, bond, kind })
}

function buildSceneObjects() {
  if (!scene || !props.reactionData) return
  clearSceneObjects()
  props.reactionData.atoms.forEach(createAtomMesh)
  props.reactionData.bonds.kept.forEach((bond) => createBondMesh(bond, 'kept'))
  props.reactionData.bonds.broken.forEach((bond) => createBondMesh(bond, 'broken'))
  props.reactionData.bonds.formed.forEach((bond) => createBondMesh(bond, 'formed'))
  updateScene()
}

function updateBond(mesh, start, end) {
  const startVector = new THREE.Vector3(...start)
  const endVector = new THREE.Vector3(...end)
  const direction = new THREE.Vector3().subVectors(endVector, startVector)
  const length = Math.max(direction.length(), 0.001)
  mesh.position.copy(startVector).add(endVector).multiplyScalar(0.5)
  mesh.scale.set(1, length, 1)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize())
}

function updateLabels(currentAtoms) {
  if (!props.showLabels || !props.reactionData?.labels?.length || !camera || !sceneRoot.value) {
    labelPositions.value = []
    return
  }
  const atoms = new Map(currentAtoms.map((atom) => [atom.id, atom]))
  const rect = sceneRoot.value.getBoundingClientRect()
  const activePhase = props.progress < 0.58 ? 'reactant' : 'product'
  const labels = props.reactionData.labels
    .filter((label) => label.phase === activePhase)
    .map((label) => {
      const points = label.atoms.map((id) => atoms.get(id)?.position).filter(Boolean)
      const center = points.reduce((result, point) => result.add(new THREE.Vector3(...point)), new THREE.Vector3())
      if (points.length) center.multiplyScalar(1 / points.length)
      center.project(camera)
      return {
        id: label.id,
        text: label.text,
        color: label.color,
        width: Math.min(150, label.text.length * 11 + 22),
        anchorX: ((center.x + 1) / 2) * rect.width,
        x: ((center.x + 1) / 2) * rect.width,
        anchorY: ((-center.y + 1) / 2) * rect.height,
        y: ((-center.y + 1) / 2) * rect.height - 54
      }
    })

  for (let pass = 0; pass < 2; pass += 1) {
    labels.sort((a, b) => a.x - b.x)
    for (let index = 1; index < labels.length; index += 1) {
      const previous = labels[index - 1]
      const current = labels[index]
      if (Math.abs(previous.y - current.y) > 28) continue
      const minimumGap = (previous.width + current.width) / 2 + 10
      const overlap = minimumGap - (current.x - previous.x)
      if (overlap > 0) {
        previous.x -= overlap / 2
        current.x += overlap / 2
      }
    }
  }

  labelPositions.value = labels.map((label) => ({
    ...label,
    x: Math.min(rect.width - label.width / 2 - 8, Math.max(label.width / 2 + 8, label.x)),
    y: Math.max(20, label.y)
  }))
}

function updateScene() {
  if (!props.reactionData) return
  const currentAtoms = interpolateAtoms(props.reactionData.atoms, props.progress)
  const positions = new Map(currentAtoms.map((atom) => [atom.id, atom.position]))
  currentAtoms.forEach((atom) => {
    const mesh = atomMeshes.get(atom.id)
    mesh?.position.set(...atom.position)
  })

  bondMeshes.forEach(({ mesh, bond, kind }) => {
    const start = positions.get(bond.a)
    const end = positions.get(bond.b)
    if (!start || !end) return
    updateBond(mesh, start, end)
    const progress = props.progress
    let opacity = 0.8
    if (kind === 'broken') opacity = 1 - Math.min(1, Math.max(0, (progress - 0.36) / 0.34))
    if (kind === 'formed') opacity = Math.min(1, Math.max(0, (progress - 0.36) / 0.34))
    mesh.material.opacity = opacity
    mesh.visible = opacity > 0.02
  })
  updateLabels(currentAtoms)
}

function resize() {
  if (!renderer || !camera || !sceneRoot.value) return
  const { clientWidth, clientHeight } = sceneRoot.value
  renderer.setSize(clientWidth, clientHeight, false)
  camera.aspect = clientWidth / Math.max(clientHeight, 1)
  camera.updateProjectionMatrix()
}

function animate() {
  animationFrame = requestAnimationFrame(animate)
  controls?.update()
  updateScene()
  renderer?.render(scene, camera)
}

async function initialize() {
  await nextTick()
  if (!sceneRoot.value) return
  try {
    scene = new THREE.Scene()
    scene.background = new THREE.Color('#f6fbff')
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 15)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    sceneRoot.value.appendChild(renderer.domElement)
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.minDistance = 7
    controls.maxDistance = 24
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc7d9e8, 2.2))
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8)
    keyLight.position.set(2, 5, 8)
    scene.add(keyLight)
    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(sceneRoot.value)
    } else {
      window.addEventListener('resize', resize)
    }
    resize()
    buildSceneObjects()
    animate()
  } catch (error) {
    webglError.value = error.message || 'WebGL 初始化失败'
  }
}

watch(() => props.reactionData, buildSceneObjects, { deep: true })
watch(() => props.progress, updateScene)
watch(() => props.showLabels, updateLabels)

onMounted(initialize)

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrame)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', resize)
  controls?.dispose()
  clearSceneObjects()
  renderer?.dispose()
  renderer?.domElement?.remove()
})
</script>
