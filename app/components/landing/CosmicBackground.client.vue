<template>
  <div ref="container" class="fixed inset-0 z-0 bg-[#020617] pointer-events-none"></div>
</template>

<script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import * as THREE from 'three'
  import { useWindowScroll, useWindowSize } from '@vueuse/core'

  const container = ref(null)
  const { y } = useWindowScroll()
  const { width, height } = useWindowSize()

  let scene, camera, renderer, starSystem
  let animationFrameId
  let lastY = y.value || 0
  let targetZ = 0
  let currentZ = 0
  let velocityZ = 0

  onMounted(() => {
    if (!container.value) return

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x020617, 0.0015)

    camera = new THREE.PerspectiveCamera(75, width.value / height.value, 0.1, 2000)
    camera.position.z = 0

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width.value, height.value)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.value.appendChild(renderer.domElement)

    const particleCount = 15000
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    const colorPalette = [
      new THREE.Color(0x38bdf8),
      new THREE.Color(0x818cf8),
      new THREE.Color(0xc084fc),
      new THREE.Color(0xffffff)
    ]

    for (let i = 0; i < particleCount; i++) {
      const radius = 10 + Math.random() * 400
      const theta = 2 * Math.PI * Math.random()

      positions[i * 3] = radius * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(theta)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3000

      const cluster = Math.sin(positions[i * 3 + 2] * 0.005) + Math.cos(positions[i * 3] * 0.01)
      let colorObj
      if (cluster > 1.2) colorObj = colorPalette[2]
      else if (cluster < -1.2) colorObj = colorPalette[0]
      else if (Math.random() > 0.9) colorObj = colorPalette[1]
      else colorObj = colorPalette[3]

      colorObj.toArray(colors, i * 3)
      sizes[i] = Math.random() * 2
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uVelocity: { value: 0 }
      },
      vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float uVelocity;
      void main() {
        vColor = color;
        vec3 pos = position;
        pos.z += uVelocity * 2.0; 
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + abs(uVelocity) * 0.1);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
      fragmentShader: `
      varying vec3 vColor;
      void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float ll = length(xy);
        if (ll > 0.5) discard;
        float alpha = (0.5 - ll) * 2.0;
        gl_FragColor = vec4(vColor, alpha * 0.8);
      }
    `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    starSystem = new THREE.Points(geometry, material)
    scene.add(starSystem)

    const clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const delta = clock.getDelta()

      targetZ = -y.value * 2.5
      currentZ += (targetZ - currentZ) * 0.05
      camera.position.z = currentZ

      const scrollDelta = y.value - lastY
      velocityZ += (scrollDelta - velocityZ) * 0.1
      lastY = y.value

      material.uniforms.uTime.value += delta
      material.uniforms.uVelocity.value = velocityZ

      starSystem.rotation.z += delta * 0.02
      renderer.render(scene, camera)
    }

    animate()
  })

  onUnmounted(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    if (renderer) {
      renderer.dispose()
      if (container.value && renderer.domElement) {
        container.value.removeChild(renderer.domElement)
      }
    }
  })

  watch([width, height], () => {
    if (camera && renderer) {
      camera.aspect = width.value / height.value
      camera.updateProjectionMatrix()
      renderer.setSize(width.value, height.value)
    }
  })
</script>
