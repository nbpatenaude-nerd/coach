<template>
  <div id="tech" class="relative isolate overflow-hidden bg-transparent py-16 sm:py-24">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div
        class="mx-auto max-w-2xl text-center mb-16 relative bg-slate-950/60 backdrop-blur-sm p-8 sm:p-12 rounded-3xl border border-cyan-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] pointer-events-auto"
      >
        <div
          class="absolute -top-12 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.9)] z-20"
        ></div>
        <h2
          class="font-athletic text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400"
        >
          Charting Your Trajectory
        </h2>
        <p class="mt-4 text-lg leading-8 text-cyan-100/70">
          Every mission requires the right telemetry. Navigate your athletic journey with tools
          designed to keep you on course.
        </p>
      </div>

      <div ref="timelineRef" class="relative mx-auto max-w-5xl">
        <div class="flex flex-col gap-12 sm:gap-24 relative z-10">
          <!-- Node 1: Left Aligned Desktop -->
          <div
            class="group relative flex flex-col sm:flex-row items-center gap-8 w-full transition-all duration-700 transform"
            :class="[isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
            style="transition-delay: 100ms"
          >
            <!-- Mobile Waypoint -->
            <div
              class="sm:hidden absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 z-20 top-1/2 -translate-y-1/2"
              :class="[
                scrollProgress > 15
                  ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] scale-125'
                  : 'bg-slate-700 shadow-none'
              ]"
            ></div>
            <!-- Desktop Waypoint -->
            <div
              class="hidden sm:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 z-20"
              :class="[
                scrollProgress > 15
                  ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] scale-125'
                  : 'bg-slate-700 shadow-none'
              ]"
            ></div>

            <div class="w-full sm:w-1/2 flex sm:justify-end pl-14 sm:pl-0 sm:pr-12">
              <UCard
                class="w-full text-left backdrop-blur-sm border transition-all duration-500 ease-in-out cursor-pointer hover:scale-[1.02] pointer-events-auto"
                :class="[
                  scrollProgress > 15
                    ? 'bg-slate-950/60 border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                    : 'bg-slate-950/40 border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                ]"
                @click="toggleNode(1)"
              >
                <div class="p-4 sm:p-6">
                  <UIcon
                    name="i-heroicons-cpu-chip"
                    class="h-10 w-10 text-cyan-400 mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <h3
                    class="text-2xl font-bold tracking-tight text-white mb-2 font-athletic uppercase"
                  >
                    Your AI Co-Pilot
                  </h3>
                  <p class="text-cyan-100/90 font-semibold mb-2">
                    Subjective wellness meets objective stress.
                  </p>

                  <div
                    class="grid transition-all duration-300 ease-in-out"
                    :class="[
                      expandedNode === 1
                        ? 'grid-rows-[1fr] opacity-100 mt-4'
                        : 'grid-rows-[0fr] opacity-0 sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100 sm:group-hover:mt-4'
                    ]"
                  >
                    <div class="overflow-hidden">
                      <p class="text-cyan-100/70 text-sm leading-relaxed pb-2">
                        You have your human coach, and then you have your AI assistant to help with
                        the day-to-day difficulties of training. Our engine analyzes your
                        biomechanical fatigue markers and enforces structured periodization,
                        adjusting your volume before you overtrain.
                      </p>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
            <div class="hidden sm:block sm:w-1/2"></div>
          </div>

          <!-- Node 2: Right Aligned Desktop -->
          <div
            class="group relative flex flex-col sm:flex-row items-center gap-8 w-full transition-all duration-700 transform"
            :class="[isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
            style="transition-delay: 200ms"
          >
            <!-- Mobile Waypoint -->
            <div
              class="sm:hidden absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 z-20 top-1/2 -translate-y-1/2"
              :class="[
                scrollProgress > 40
                  ? 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,1)] scale-125'
                  : 'bg-slate-700 shadow-none'
              ]"
            ></div>
            <!-- Desktop Waypoint -->
            <div
              class="hidden sm:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 z-20"
              :class="[
                scrollProgress > 40
                  ? 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,1)] scale-125'
                  : 'bg-slate-700 shadow-none'
              ]"
            ></div>

            <div class="hidden sm:block sm:w-1/2"></div>
            <div class="w-full sm:w-1/2 flex sm:justify-start pl-14 sm:pl-12 sm:pr-0">
              <UCard
                class="w-full text-left backdrop-blur-sm border transition-all duration-500 ease-in-out cursor-pointer hover:scale-[1.02] pointer-events-auto"
                :class="[
                  scrollProgress > 40
                    ? 'bg-slate-950/60 border-pink-500/60 shadow-[0_0_30px_rgba(236,72,153,0.3)]'
                    : 'bg-slate-950/40 border-pink-500/20 hover:border-pink-400/40 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                ]"
                @click="toggleNode(2)"
              >
                <div class="p-4 sm:p-6">
                  <UIcon
                    name="i-heroicons-arrow-path-rounded-square"
                    class="h-10 w-10 text-pink-500 mb-4 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)] transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <h3
                    class="text-2xl font-bold tracking-tight text-white mb-2 font-athletic uppercase"
                  >
                    Open-Source Stat Tracking
                  </h3>
                  <p class="text-cyan-100/90 font-semibold mb-2">
                    Build your ultimate Athlete Character Sheet.
                  </p>

                  <div
                    class="grid transition-all duration-300 ease-in-out"
                    :class="[
                      expandedNode === 2
                        ? 'grid-rows-[1fr] opacity-100 mt-4'
                        : 'grid-rows-[0fr] opacity-0 sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100 sm:group-hover:mt-4'
                    ]"
                  >
                    <div class="overflow-hidden">
                      <p class="text-cyan-100/70 text-sm leading-relaxed pb-2">
                        We leverage powerful open-source platforms like Intervals.icu to democratize
                        access to elite metrics. Consider this your dynamic "character
                        sheet"—tracking your CTL (Fitness), ATL (Fatigue), and TSB (Form) to
                        perfectly balance your stats before you enter the next dungeon... or race.
                      </p>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Node 3: Left Aligned Desktop -->
          <div
            class="group relative flex flex-col sm:flex-row items-center gap-8 w-full transition-all duration-700 transform"
            :class="[isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
            style="transition-delay: 300ms"
          >
            <!-- Mobile Waypoint -->
            <div
              class="sm:hidden absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 z-20 top-1/2 -translate-y-1/2"
              :class="[
                scrollProgress > 65
                  ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] scale-125'
                  : 'bg-slate-700 shadow-none'
              ]"
            ></div>
            <!-- Desktop Waypoint -->
            <div
              class="hidden sm:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 z-20"
              :class="[
                scrollProgress > 65
                  ? 'bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] scale-125'
                  : 'bg-slate-700 shadow-none'
              ]"
            ></div>

            <div class="w-full sm:w-1/2 flex sm:justify-end pl-14 sm:pl-0 sm:pr-12">
              <UCard
                class="w-full text-left backdrop-blur-sm border transition-all duration-500 ease-in-out cursor-pointer hover:scale-[1.02] pointer-events-auto"
                :class="[
                  scrollProgress > 65
                    ? 'bg-slate-950/60 border-purple-500/60 shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-950/40 border-purple-500/20 hover:border-purple-400/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                ]"
                @click="toggleNode(3)"
              >
                <div class="p-4 sm:p-6">
                  <UIcon
                    name="i-heroicons-bolt"
                    class="h-10 w-10 text-cyan-400 mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <h3
                    class="text-2xl font-bold tracking-tight text-white mb-2 font-athletic uppercase"
                  >
                    Optimal Fueling Strategy
                  </h3>
                  <p class="text-cyan-100/90 font-semibold mb-2">
                    Fuel your journey with precision.
                  </p>

                  <div
                    class="grid transition-all duration-300 ease-in-out"
                    :class="[
                      expandedNode === 3
                        ? 'grid-rows-[1fr] opacity-100 mt-4'
                        : 'grid-rows-[0fr] opacity-0 sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100 sm:group-hover:mt-4'
                    ]"
                  >
                    <div class="overflow-hidden">
                      <p class="text-cyan-100/70 text-sm leading-relaxed pb-2">
                        Powered by F2C Nutrition principles. Train harder, recover faster, and fuel
                        smarter. We integrate high-carbohydrate availability and optimal
                        plant-protein timing directly into your recovery feedback, complete with a
                        proprietary Race Day Fuel planner.
                      </p>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
            <div class="hidden sm:block sm:w-1/2"></div>
          </div>

          <!-- Node 4: Right Aligned Desktop -->
          <div
            class="group relative flex flex-col sm:flex-row items-center gap-8 w-full transition-all duration-700 transform"
            :class="[isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12']"
            style="transition-delay: 400ms"
          >
            <!-- Mobile Waypoint -->
            <div
              class="sm:hidden absolute left-6 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 z-20 top-1/2 -translate-y-1/2"
              :class="[
                scrollProgress > 90
                  ? 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,1)] scale-125'
                  : 'bg-slate-700 shadow-none'
              ]"
            ></div>
            <!-- Desktop Waypoint -->
            <div
              class="hidden sm:block absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500 z-20"
              :class="[
                scrollProgress > 90
                  ? 'bg-pink-500 shadow-[0_0_20px_rgba(236,72,153,1)] scale-125'
                  : 'bg-slate-700 shadow-none'
              ]"
            ></div>

            <div class="hidden sm:block sm:w-1/2"></div>
            <div class="w-full sm:w-1/2 flex sm:justify-start pl-14 sm:pl-12 sm:pr-0">
              <UCard
                class="w-full text-left backdrop-blur-sm border transition-all duration-500 ease-in-out cursor-pointer hover:scale-[1.02] pointer-events-auto"
                :class="[
                  scrollProgress > 90
                    ? 'bg-slate-950/60 border-cyan-400/60 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                    : 'bg-slate-950/40 border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'
                ]"
                @click="toggleNode(4)"
              >
                <div class="p-4 sm:p-6">
                  <UIcon
                    name="i-heroicons-user-group"
                    class="h-10 w-10 text-pink-500 mb-4 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)] transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <h3
                    class="text-2xl font-bold tracking-tight text-white mb-2 font-athletic uppercase"
                  >
                    The Tri Nerds Guild
                  </h3>
                  <p class="text-cyan-100/90 font-semibold mb-2">
                    A fellowship of athletes working together.
                  </p>

                  <div
                    class="grid transition-all duration-300 ease-in-out"
                    :class="[
                      expandedNode === 4
                        ? 'grid-rows-[1fr] opacity-100 mt-4'
                        : 'grid-rows-[0fr] opacity-0 sm:group-hover:grid-rows-[1fr] sm:group-hover:opacity-100 sm:group-hover:mt-4'
                    ]"
                  >
                    <div class="overflow-hidden">
                      <p class="text-cyan-100/70 text-sm leading-relaxed pb-2">
                        Training is a solo endeavor, but the Journey doesn't have to be. Stay
                        connected via our dedicated Telegram group, RSVP to team events on our
                        Community Calendar, and join a community of multi-sport geeks united towards
                        a common goal of self-discovery and improvement.
                      </p>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useIntersectionObserver, useElementBounding, useWindowScroll } from '@vueuse/core'

  const timelineRef = ref(null)
  const isVisible = ref(false)

  const { top, height } = useElementBounding(timelineRef)

  const scrollProgress = computed(() => {
    if (typeof window === 'undefined') return 0
    const viewportMiddle = window.innerHeight / 2
    const scrolledPast = viewportMiddle - top.value

    if (scrolledPast <= 0) return 0
    if (scrolledPast >= height.value) return 100

    return (scrolledPast / height.value) * 100
  })

  // Track expanded node for mobile clicks
  const expandedNode = ref<number | null>(null)

  const toggleNode = (nodeId: number) => {
    expandedNode.value = expandedNode.value === nodeId ? null : nodeId
  }

  useIntersectionObserver(
    timelineRef,
    (entries) => {
      const isIntersecting = entries[0]?.isIntersecting
      if (isIntersecting) {
        isVisible.value = true
      }
    },
    { threshold: 0.1 }
  )
</script>
