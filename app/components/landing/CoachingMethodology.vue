<template>
  <section class="py-24 relative overflow-hidden z-10 bg-slate-950">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <!-- Image Placeholder (left) -->
        <div class="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
          <div class="aspect-[4/5] bg-slate-900 flex items-center justify-center">
            <!-- Placeholder for Coach Nick picture -->
            <UIcon name="i-heroicons-photo" class="w-24 h-24 text-slate-700" />
          </div>
        </div>

        <!-- Text (right) -->
        <div class="flex flex-col gap-6 text-slate-300">
          <p class="text-xl leading-relaxed font-light text-slate-200">
            With our growth-oriented coaching philosophy, uncover your potential, unlock your
            capability, and unleash your passion. Find the meaning behind training and competing.
          </p>

          <ul class="space-y-6 mt-4">
            <li class="flex items-start gap-4">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-500 shrink-0 mt-1" />
              <div>
                <strong class="text-white block mb-1">Learn to contextualize your training</strong>
                <span class="text-slate-400"
                  >Every step in your journey brings you closer to the person you want to be.</span
                >
              </div>
            </li>
            <li class="flex items-start gap-4">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-500 shrink-0 mt-1" />
              <div>
                <strong class="text-white block mb-1">Don't waste your time with guesswork</strong>
                <span class="text-slate-400"
                  >As your personal Guide, your Coach will help you optimize every step of your
                  path. Ensuring you have time to spend on the things that matter in life.</span
                >
              </div>
            </li>
            <li class="flex items-start gap-4">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-500 shrink-0 mt-1" />
              <div>
                <strong class="text-white block mb-1">Train based on YOUR Physiology</strong>
                <span class="text-slate-400"
                  >Don't waste time on calculations that don't take your personal physiology into
                  consideration. Measure and track based on your own unique self.</span
                >
              </div>
            </li>
            <li class="flex items-start gap-4">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-500 shrink-0 mt-1" />
              <div>
                <strong class="text-white block mb-1"
                  >Improve your longevity, in health and sport</strong
                >
                <span class="text-slate-400"
                  >Train and make decisions that support your health and that allow you to
                  participate in your life and sport for longer.</span
                >
              </div>
            </li>
          </ul>

          <div class="mt-8">
            <UButton
              to="https://app.reclaim.ai/m/Coach-Nick/journey-begins"
              target="_blank"
              size="xl"
              class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold whitespace-nowrap px-8 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]"
            >
              Book your Exploratory Call
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
