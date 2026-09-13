<template>
  <canvas
    ref="canvas"
    class="fixed inset-0 w-full h-full"
    style="z-index: 0; background: #020617"
  ></canvas>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import * as THREE from 'three'
  import { useWindowScroll, useWindowSize } from '@vueuse/core'

  const canvas = ref(null)
  const { y } = useWindowScroll()
  const { width, height } = useWindowSize()

  let scene, camera, renderer, starSystem
  let animationFrameId
  let lastY = 0
  let currentZ = 0
  let velocityZ = 0

  onMounted(() => {
    if (!canvas.value) return

    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(75, width.value / height.value, 0.1, 5000)
    camera.position.z = 0

    renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: false })
    renderer.setClearColor(0x020617, 1)
    renderer.setSize(width.value, height.value)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    // --- Starfield ---
    const count = 18000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    const palette = [
      new THREE.Color(0x38bdf8), // cyan
      new THREE.Color(0x818cf8), // indigo
      new THREE.Color(0xc084fc), // purple
      new THREE.Color(0xe2e8f0), // cool white
      new THREE.Color(0xfbbf24) // amber (rare star)
    ]

    for (let i = 0; i < count; i++) {
      const r = 20 + Math.random() * 500
      const theta = 2 * Math.PI * Math.random()
      const z = (Math.random() - 0.5) * 6000

      positions[i * 3 + 0] = r * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(theta)
      positions[i * 3 + 2] = z

      // Nebula clusters by depth
      const band = Math.abs(Math.sin(z * 0.003))
      let c
      if (band > 0.85)
        c = palette[2] // dense purple nebula
      else if (band > 0.7)
        c = palette[0] // cyan nebula
      else if (Math.random() > 0.96)
        c = palette[4] // rare amber star
      else if (Math.random() > 0.9)
        c = palette[1] // indigo
      else c = palette[3] // default white

      c.toArray(colors, i * 3)
      sizes[i] = 0.5 + Math.random() * 2.5
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const mat = new THREE.ShaderMaterial({
      uniforms: { uVelocity: { value: 0 }, uCameraZ: { value: 0 } },
      vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uVelocity;
      uniform float uCameraZ;
      void main() {
        vColor = color;
        vec3 pos = position;
        // Infinite Z loop
        float zOffset = mod(pos.z - uCameraZ + 3000.0, 6000.0) - 3000.0;
        pos.z = uCameraZ + zOffset;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        // Hyperspace stretch
        float speed = abs(uVelocity);
        gl_PointSize = size * (400.0 / -mv.z) * (1.0 + speed * 0.15);
        gl_Position = projectionMatrix * mv;
      }
    `,
      fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.1, d);
        gl_FragColor = vec4(vColor, a * 0.9);
      }
    `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    starSystem = new THREE.Points(geo, mat)
    scene.add(starSystem)

    // --- Constellation lines (Orion) ---
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.3
    })
    const linePoints = [
      new THREE.Vector3(-80, 60, -300),
      new THREE.Vector3(-40, 30, -300),
      new THREE.Vector3(0, 50, -300),
      new THREE.Vector3(40, 30, -300),
      new THREE.Vector3(80, 60, -300)
    ]
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints)
    scene.add(new THREE.Line(lineGeo, lineMat))

    // --- Animation ---
    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      const targetZ = -y.value * 3
      currentZ += (targetZ - currentZ) * 0.06
      camera.position.z = currentZ

      const scrollDelta = y.value - lastY
      velocityZ += (scrollDelta * 0.5 - velocityZ) * 0.15
      lastY = y.value

      mat.uniforms.uVelocity.value = velocityZ
      mat.uniforms.uCameraZ.value = currentZ
      starSystem.rotation.z += delta * 0.01

      renderer.render(scene, camera)
    }
    animate()
  })

  onUnmounted(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    renderer?.dispose()
  })

  watch([width, height], () => {
    if (!camera || !renderer) return
    camera.aspect = width.value / height.value
    camera.updateProjectionMatrix()
    renderer.setSize(width.value, height.value)
  })
</script>
