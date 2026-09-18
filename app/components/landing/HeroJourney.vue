<template>
  <section
    class="relative min-h-[90vh] flex flex-col justify-center py-20 px-6 sm:px-12 lg:px-24 overflow-hidden"
  >
    <!-- Background element with video and overlay -->
    <div class="fixed inset-0 bg-slate-950 overflow-hidden pointer-events-none z-0">
      <video
        ref="bgVideo"
        src="/images/v2/Volcano_fast_13761902-hd_1920_1080_30fps.mp4"
        autoplay
        muted
        playsinline
        class="absolute w-full h-full object-cover transition-opacity duration-[1500ms] ease-in-out"
        :class="isFading ? 'opacity-0' : 'opacity-60'"
        @timeupdate="onTimeUpdate"
        @ended="onEnded"
        @play="onPlay"
      ></video>
      <!-- Gradient for bottom transition only -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent h-48 bottom-0 top-auto"
      ></div>
    </div>

    <!-- Centered Title Layout (SkyClinics Inspired) -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div class="flex flex-col items-center pointer-events-auto w-full px-4 mt-24">
        <div class="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <h1
            class="font-athletic text-3xl md:text-5xl lg:text-6xl font-bold uppercase text-white m-0 leading-tight drop-shadow-2xl text-center max-w-4xl"
          >
            Master the Crucible of Endurance Sport:<br /><span class="text-cyan-400"
              >Science-Backed Coaching to Build Peak Performance and Long-Term Athleticism</span
            >
          </h1>
        </div>

        <div class="relative w-full flex justify-center mt-8 md:mt-10">
          <div class="flex flex-col items-center gap-6 max-w-3xl">
            <!-- Uppercase Bold Subtitle (The Hook) -->
            <span
              class="font-sans text-[0.8rem] md:text-[0.95rem] font-semibold tracking-wide text-slate-200 leading-relaxed text-center drop-shadow-md"
            >
              Stop letting random internet plans burn you out or get you injured before you even
              reach the starting line. Cut through the noise, protect your joints, and build a
              sustainable, high-performance engine for your next half Ironman.
            </span>

            <div
              class="w-16 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent my-5 opacity-70"
            ></div>

            <div class="flex flex-col sm:flex-row gap-5 w-full sm:w-auto mt-2">
              <UButton
                to="https://app.reclaim.ai/m/Coach-Nick/journey-begins"
                target="_blank"
                size="xl"
                color="neutral"
                class="!bg-white/95 backdrop-blur-md text-slate-950 font-bold whitespace-nowrap px-10 py-3.5 text-[0.8rem] tracking-[0.15em] uppercase hover:!bg-white justify-center transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]"
                >Book Free Consult</UButton
              >
              <UButton
                to="#pricing"
                size="xl"
                variant="outline"
                color="neutral"
                class="text-white hover:bg-slate-800/80 border-white/20 backdrop-blur-md bg-black/40 px-10 py-3.5 text-[0.8rem] tracking-[0.15em] uppercase justify-center transition-all"
                >Explore Coaching</UButton
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  const bgVideo = ref<HTMLVideoElement | null>(null)
  const isFading = ref(true)

  const onTimeUpdate = () => {
    if (!bgVideo.value) return
    const current = bgVideo.value.currentTime
    const duration = bgVideo.value.duration

    if (!duration) return

    // Start fade out ~1.5s real-time before end (0.75s video time at 0.5x speed)
    if (duration - current <= 0.75 && !isFading.value) {
      isFading.value = true
    }
  }

  const onEnded = () => {
    if (!bgVideo.value) return
    bgVideo.value.currentTime = 0
    bgVideo.value.play()
  }

  const onPlay = () => {
    // Fade in shortly after playback starts
    setTimeout(() => {
      isFading.value = false
    }, 100)
  }

  onMounted(() => {
    if (bgVideo.value) {
      bgVideo.value.playbackRate = 0.5
    }
  })
</script>
