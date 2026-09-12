<template>
  <div class="min-h-screen bg-slate-950 pt-32 pb-24">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <!-- Coaching Philosophy -->
      <section class="mb-24">
        <h1 class="font-athletic text-5xl font-bold uppercase text-white mb-8">
          Coaching Philosophy
        </h1>
        <div class="prose prose-invert prose-lg max-w-4xl">
          <p class="text-xl text-slate-300 leading-relaxed mb-6">
            At Journey Endurance, we believe that endurance sport is the ultimate catalyst for
            personal growth. The crucible of training and racing strips away the non-essential,
            forcing you to confront your limits and emerge stronger.
          </p>
          <p class="text-slate-400 mb-12">
            Every athlete's path follows the Hero's Journey: answering the call to adventure,
            crossing the threshold of comfort, facing trials and tribulations, and ultimately
            returning transformed. We coach the whole athlete, integrating physiological data with
            psychological resilience to guide you through your unique quest.
          </p>
        </div>

        <!-- Meet the Coaches -->
        <h2 class="font-athletic text-3xl font-bold uppercase text-white mb-6">Meet the Coaches</h2>
        <UCard class="max-w-2xl bg-slate-900 border-slate-800">
          <template #header>
            <div
              class="flex items-center gap-4 cursor-pointer"
              @click="coachExpanded = !coachExpanded"
            >
              <UAvatar src="/media/logo.webp" alt="Coach Nick" size="xl" class="bg-slate-800 p-2" />
              <div>
                <h3 class="text-xl font-bold text-white">Coach Nick</h3>
                <p class="text-cyan-400 text-sm">Head Coach & Founder</p>
              </div>
              <UIcon
                :name="coachExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="ml-auto w-5 h-5 text-slate-400"
              />
            </div>
          </template>
          <div v-show="coachExpanded" class="text-slate-300 space-y-4">
            <p>
              With years of experience guiding athletes through their endurance quests, Coach Nick
              combines elite scientific telemetry with a deep understanding of human psychology.
            </p>
            <p>
              "I view sport not just as a physical challenge, but as the most powerful catalyst for
              personal growth available to us. By leaning into the resistance, we uncover who we
              truly are."
            </p>
          </div>
        </UCard>
      </section>

      <!-- Community -->
      <section>
        <h2 class="font-athletic text-5xl font-bold uppercase text-white mb-8">The Community</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <UIcon name="i-heroicons-user-group" class="w-10 h-10 text-cyan-400 mb-4" />
            <h3 class="text-xl font-bold text-white mb-2">Virtual Town-Halls</h3>
            <p class="text-slate-400">
              Join our quarterly virtual town-hall meetings where athletes and coaches discuss
              training blocks, race reports, and strategy.
            </p>
          </div>
          <div class="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-10 h-10 text-cyan-400 mb-4" />
            <h3 class="text-xl font-bold text-white mb-2">Telegram Channel</h3>
            <p class="text-slate-400">
              24/7 access to our dedicated team Telegram channel. Celebrate wins, ask questions, and
              stay connected with the squad.
            </p>
          </div>
          <div class="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <UIcon name="i-heroicons-globe-alt" class="w-10 h-10 text-cyan-400 mb-4" />
            <h3 class="text-xl font-bold text-white mb-2">Team Events</h3>
            <p class="text-slate-400">
              Connect with fellow athletes at races around the world. Coordinate meetups and
              leverage the power of the Journey Endurance platform.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  definePageMeta({
    layout: 'home',
    auth: false
  })
  useSeoMeta({ title: 'About - Journey Endurance' })

  const coachExpanded = ref(true)
</script>
