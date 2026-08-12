<template>
  <div
    id="hero"
    class="relative isolate overflow-hidden min-h-[80vh] flex items-center justify-center bg-transparent"
  >
    <!-- Sci-Fi background -->
    <div
      class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/0 to-slate-950/0 opacity-100"
    ></div>
    <div class="absolute inset-0 -z-10 opacity-30 mix-blend-overlay"></div>
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[200%] h-full animate-[spin_60s_linear_infinite] opacity-40 pointer-events-none"
    >
      <div
        class="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/10 to-transparent blur-3xl rounded-full"
      ></div>
    </div>

    <div
      ref="heroRef"
      class="relative z-20 mx-auto flex max-w-352 flex-col items-center px-6 pb-16 pt-24 sm:pb-20 sm:pt-32 lg:px-8 text-center transition-all duration-1000 transform"
      :class="[isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
    >
      <!-- Central glowing waypoint dot for slider intersection -->
      <div
        class="absolute -top-12 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)] z-20"
      ></div>

      <!-- Solid wrapper container -->
      <div
        class="bg-slate-950 p-8 sm:p-16 rounded-[3rem] border border-white/5 shadow-2xl flex flex-col items-center relative z-20 w-full max-w-4xl mx-auto pointer-events-auto"
      >
        <img
          src="/media/Tri%20Nerd%20Logos/TriNerds_pixelbadge_logo.png"
          alt="Tri Nerds"
          class="w-32 h-auto mb-8 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
        />

        <h1
          class="font-athletic mt-6 text-balance text-5xl font-bold uppercase leading-[0.9] tracking-tight text-white sm:text-6xl xl:text-[5rem] max-w-4xl"
        >
          Level Up Your Endurance.<br />
          <span
            class="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-pink-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            >Welcome to the Tri Nerds.</span
          >
        </h1>
        <p class="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-cyan-100/70 sm:text-xl">
          We don't just log miles. We value the process. Join a community of multisport geeks
          powered by an elite AI Coaching Assistant.
        </p>

        <div class="mt-10 flex flex-wrap items-center justify-center gap-5">
          <UButton
            to="/join"
            size="xl"
            class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all hover:scale-105"
          >
            Take the Next Step
          </UButton>
          <UButton
            to="#bentoSectionRef"
            size="xl"
            variant="outline"
            class="border-pink-500/50 text-pink-400 hover:bg-pink-500/10 hover:border-pink-400 px-8 transition-all"
          >
            Explore the Tech
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue'

  const isVisible = ref(false)
  const heroRef = ref<HTMLElement | null>(null)

  onMounted(() => {
    // Slight delay for smooth load-in effect
    setTimeout(() => {
      isVisible.value = true
    }, 100)
  })
</script>
