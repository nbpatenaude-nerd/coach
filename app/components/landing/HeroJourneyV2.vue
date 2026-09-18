<template>
  <div class="bg-[#e8e7e5]">
    <!-- 1. Fixed Background Hero (z-10) -->
    <section
      ref="heroContainer"
      class="fixed inset-0 w-full h-[100svh] z-10 pointer-events-none overflow-hidden"
    >
      <div class="absolute inset-0 w-full h-full pointer-events-auto">
        <!-- Mountain Layer -->
        <div ref="mountainLayer" class="absolute inset-0 w-full h-full z-0">
          <img
            src="/images/v2/bright_mountain.png"
            alt="Mountain Vista"
            class="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        <!-- Clouds 1 -->
        <div
          ref="driftingClouds1"
          class="absolute inset-0 w-[200%] h-full z-10 opacity-60 pointer-events-none mix-blend-normal"
          style="
            background-image: url('/images/v2/airy_clouds.png');
            background-size: cover;
            background-repeat: repeat-x;
          "
        ></div>

        <!-- Clouds 2 -->
        <div
          ref="driftingClouds2"
          class="absolute inset-0 w-[200%] h-full z-20 opacity-40 pointer-events-none mix-blend-screen"
          style="
            background-image: url('/images/v2/airy_clouds.png');
            background-size: cover;
            background-position: bottom;
            background-repeat: repeat-x;
          "
        ></div>

        <!-- Top Navigation (Glass Pill) -->
        <nav class="absolute top-0 right-0 flex items-center p-6 md:p-10 pointer-events-auto z-30">
          <div
            class="flex items-center gap-8 bg-white/30 backdrop-blur-md rounded-lg px-6 py-3 border-b border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)]"
          >
            <a
              href="#"
              class="text-[13px] font-normal tracking-[0.14em] uppercase text-slate-900 drop-shadow-md hover:text-cyan-800 transition-colors"
              >Programs</a
            >
            <a
              href="#"
              class="text-[13px] font-normal tracking-[0.14em] uppercase text-slate-900 drop-shadow-md hover:text-cyan-800 transition-colors"
              >The Experience</a
            >
            <a
              href="#"
              class="text-[13px] font-normal tracking-[0.14em] uppercase text-slate-900 drop-shadow-md hover:text-cyan-800 transition-colors"
              >Coaches</a
            >
            <button
              class="text-[13px] font-normal tracking-[0.14em] uppercase text-slate-900 border-b border-slate-900 hover:text-cyan-800 transition-colors pb-0.5"
            >
              Book Consultation
            </button>
            <div
              class="flex items-center gap-1 text-[12.5px] tracking-[0.18em] text-slate-800 ml-4 cursor-pointer"
            >
              <span>🇺🇸</span> EN
              <UIcon name="i-heroicons-chevron-down" class="w-3 h-3 ml-1 opacity-70" />
            </div>
          </div>
        </nav>

        <!-- Main Title -->
        <div
          ref="titleLayer"
          class="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
        >
          <div class="flex flex-col items-center pointer-events-auto -mt-20 lg:-mt-0 lg:-ml-[20%]">
            <div class="flex items-center gap-5">
              <UIcon name="i-heroicons-sparkles" class="w-12 h-12 text-slate-800" />
              <h1
                class="font-athletic text-[2.8rem] md:text-5xl lg:text-7xl font-light tracking-[0.3em] uppercase text-slate-900 m-0 leading-none drop-shadow-lg"
              >
                Journey Endurance
              </h1>
            </div>
            <div class="relative w-full flex justify-center mt-6 lg:justify-start lg:-ml-[40%]">
              <div class="flex flex-col items-center gap-2">
                <span
                  class="font-sans text-[0.68rem] font-bold tracking-[0.22em] uppercase text-slate-900 leading-none"
                  >Performance</span
                >
                <span
                  class="font-sans text-[0.92rem] font-medium tracking-[0.06em] text-slate-900 text-center leading-relaxed"
                  >Your potential, perfected.</span
                >
                <div
                  class="w-12 h-[1px] bg-gradient-to-r from-transparent via-cyan-700 to-transparent my-3"
                ></div>
                <button
                  class="flex items-center gap-2 text-[1.12rem] font-bold tracking-[0.05em] text-cyan-800 hover:text-cyan-900 transition-colors drop-shadow-sm"
                >
                  Explore tailored coaching <span class="text-xl leading-none">&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Spacer to allow scrolling over the fixed hero -->
    <div class="h-[100svh] relative z-0 pointer-events-none"></div>

    <!-- 3. Scrolling Content Section -->
    <section class="relative z-20 min-h-[200vh] -mt-[29vh]">
      <!-- Gradient transition into solid background -->
      <div
        class="absolute inset-0 pointer-events-none z-0"
        style="
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(232, 231, 229, 0.3) 15vh,
            rgba(232, 231, 229, 0.7) 25vh,
            #e8e7e5 35vh,
            #e8e7e5 100%
          );
        "
      ></div>

      <!-- Video Reveal Block -->
      <div class="relative z-10 pt-[40vh] pb-[6vh] px-12 flex justify-center">
        <div
          ref="videoBlock"
          class="relative w-full max-w-[1000px] shadow-[0_24px_48px_rgba(0,0,0,0.4)] rounded-xl overflow-hidden aspect-[16/9]"
          style="clip-path: inset(25%)"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-slate-900/10 to-cyan-900/10 pointer-events-none z-10 rounded-xl"
          ></div>
          <video
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            autoplay
            loop
            muted
            playsinline
            class="absolute inset-0 w-full h-full object-cover"
          ></video>
        </div>
      </div>

      <!-- Begin Here CTA -->
      <div class="relative z-10 flex justify-center pb-[10vh]">
        <button
          class="flex flex-col items-center gap-2 px-14 py-6 bg-[#0091ea]/85 border border-[#0091ea]/80 rounded-md cursor-pointer transition-all hover:bg-[#0091ea] shadow-[0_4px_24px_rgba(0,145,234,0.35),inset_0_1px_0_rgba(255,255,255,0.12)] group"
          style="animation: introCtaTextBreathe 3.5s cubic-bezier(0.45, 0, 0.55, 1) infinite"
        >
          <span class="text-[0.65rem] font-normal tracking-[0.35em] uppercase text-white/70"
            >Begin Here</span
          >
          <span
            class="text-[1.3rem] font-light tracking-[0.22em] uppercase text-white mt-1 group-hover:tracking-[0.26em]"
            style="transition: letter-spacing 0.7s cubic-bezier(0.22, 1, 0.36, 1)"
            >Schedule Consultation</span
          >
          <span
            class="block w-[80px] h-[1px] bg-gradient-to-r from-transparent via-white to-transparent mt-2"
            style="animation: introCtaBreathe 3.5s cubic-bezier(0.45, 0, 0.55, 1) infinite"
          ></span>
        </button>
      </div>

      <!-- Content text -->
      <div class="relative z-10 min-h-[60vh] px-12 flex items-center justify-center">
        <div class="text-center max-w-[900px]">
          <p class="text-[0.85rem] font-normal tracking-[0.3em] uppercase text-slate-500 mb-8">
            Our Approach
          </p>
          <h2
            class="text-[2.75rem] font-light leading-[1.15] tracking-[-0.03em] text-slate-900 m-0"
          >
            Innovating athletic coaching through data-driven programming, where every athlete's
            journey is crafted with precision.
          </h2>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { gsap } from 'gsap'
  import { ScrollTrigger } from 'gsap/ScrollTrigger'

  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
  }

  const mountainLayer = ref<HTMLElement | null>(null)
  const driftingClouds1 = ref<HTMLElement | null>(null)
  const driftingClouds2 = ref<HTMLElement | null>(null)
  const videoBlock = ref<HTMLElement | null>(null)
  const titleLayer = ref<HTMLElement | null>(null)

  let videoScrollTrigger: any = null
  let titleScrollTrigger: any = null
  let cloudAnimation1: any = null
  let cloudAnimation2: any = null

  const handleMouseMove = (e: MouseEvent) => {
    if (typeof window === 'undefined') return
    const { clientX, clientY } = e
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    const xMove = (clientX - centerX) / centerX
    const yMove = (clientY - centerY) / centerY

    // Subtle parallax
    gsap.to(mountainLayer.value, {
      x: xMove * -15,
      y: yMove * -15,
      duration: 1.5,
      ease: 'power2.out'
    })
    gsap.to(driftingClouds1.value, { y: yMove * -30, duration: 1.5, ease: 'power2.out' })
    gsap.to(driftingClouds2.value, { y: yMove * -50, duration: 1.5, ease: 'power2.out' })
  }

  onMounted(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('mousemove', handleMouseMove)

    // Endless drift
    cloudAnimation1 = gsap.to(driftingClouds1.value, {
      xPercent: -50,
      duration: 60,
      ease: 'none',
      repeat: -1
    })
    cloudAnimation2 = gsap.to(driftingClouds2.value, {
      xPercent: -50,
      duration: 45,
      ease: 'none',
      repeat: -1
    })

    // Parallax title layer on scroll to fade it out as you scroll down
    titleScrollTrigger = gsap.to(titleLayer.value, {
      y: -100,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: '500px top',
        scrub: true
      }
    })

    // Video clip-path reveal (SkyClinics style)
    if (videoBlock.value) {
      videoScrollTrigger = gsap.fromTo(
        videoBlock.value,
        { clipPath: 'inset(25%)', opacity: 0.8 },
        {
          clipPath: 'inset(0%)',
          opacity: 1,
          ease: 'power1.inOut',
          scrollTrigger: {
            trigger: videoBlock.value,
            start: 'top 85%',
            end: 'center center',
            scrub: 1
          }
        }
      )
    }
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', handleMouseMove)
    }
    if (videoScrollTrigger) videoScrollTrigger.kill()
    if (titleScrollTrigger) titleScrollTrigger.kill()
    if (cloudAnimation1) cloudAnimation1.kill()
    if (cloudAnimation2) cloudAnimation2.kill()
  })
</script>
