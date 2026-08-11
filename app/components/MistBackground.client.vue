<template>
  <!-- 
    The opacity is dynamically controlled by scroll position.
    pointer-events-none prevents the canvas from capturing real DOM clicks.
  -->
  <div
    class="absolute inset-0 z-0 pointer-events-none w-full h-full mix-blend-screen overflow-hidden"
    :style="{ opacity: computedOpacity }"
  >
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
  import { useWindowScroll } from '@vueuse/core'
  // @ts-expect-error - no types available
  import WebGLFluid from 'webgl-fluid'

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const { y } = useWindowScroll()

  // Start fading in when the user scrolls down 300px, reach max opacity (0.75) by 900px
  const computedOpacity = computed(() => {
    if (y.value < 300) return 0
    const maxOpacity = 0.75
    const opacity = (y.value - 300) / 600
    return opacity > maxOpacity ? maxOpacity : opacity
  })

  let fluidInstance: any = null
  const globalListeners: { type: string; listener: EventListener }[] = []

  onMounted(() => {
    if (canvasRef.value) {
      // Advanced Proxy: webgl-fluid strictly listens to the canvas for mouse events.
      // Because our canvas sits at z-0, the z-10 UI elements completely block hover events.
      // We intercept the canvas.addEventListener calls and redirect them to the global window,
      // injecting the exact offsetX/Y coordinates it needs.
      const originalAddEventListener = canvasRef.value.addEventListener.bind(canvasRef.value)
      canvasRef.value.addEventListener = (type: string, listener: any, options?: any) => {
        if (
          ['mousemove', 'mousedown', 'mouseup', 'touchstart', 'touchmove', 'touchend'].includes(
            type
          )
        ) {
          const globalListener = (e: any) => {
            if (!canvasRef.value) return
            const rect = canvasRef.value.getBoundingClientRect()

            // Create a proxy event that safely returns the calculated offsets
            const proxyEvent = new Proxy(e, {
              get(target, prop) {
                if (prop === 'offsetX') {
                  const clientX =
                    e.clientX ?? (e.touches && e.touches.length > 0 ? e.touches[0].clientX : 0)
                  return clientX - rect.left
                }
                if (prop === 'offsetY') {
                  const clientY =
                    e.clientY ?? (e.touches && e.touches.length > 0 ? e.touches[0].clientY : 0)
                  return clientY - rect.top
                }
                const value = target[prop]
                return typeof value === 'function' ? value.bind(target) : value
              }
            })
            listener(proxyEvent)
          }
          window.addEventListener(type, globalListener, options)
          globalListeners.push({ type, listener: globalListener })
        } else {
          originalAddEventListener(type, listener, options)
        }
      }

      // Initialize WebGL Fluid Simulation with fog-like physics
      fluidInstance = WebGLFluid(canvasRef.value, {
        IMMEDIATE: true,
        TRIGGER: 'hover',
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        CAPTURE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 2.0,
        VELOCITY_DISSIPATION: 1.0,
        PRESSURE: 0.2,
        PRESSURE_ITERATIONS: 20,
        CURL: 15,
        SPLAT_RADIUS: 0.5,
        SPLAT_FORCE: 4000,
        SHADING: true,
        COLORFUL: true, // Use colors for visible fog
        PAUSED: false,
        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: false, // mix-blend-screen handles transparency
        BLOOM: true,
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.8,
        BLOOM_THRESHOLD: 0.4,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: true,
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 0.5
      })
    }
  })

  onBeforeUnmount(() => {
    // Clean up global window listeners
    globalListeners.forEach(({ type, listener }) => {
      window.removeEventListener(type, listener)
    })

    fluidInstance = null
  })
</script>
