<template>
  <section class="py-12 md:py-16 relative overflow-hidden z-10 bg-slate-950/20">
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
          <h2
            class="font-athletic text-3xl font-bold uppercase tracking-tight text-white mb-4 drop-shadow-md"
          >
            The High-Touch <span class="text-cyan-500">Method</span>
          </h2>
          <p class="text-xl leading-relaxed font-light text-slate-200">
            Intelligent, individualized programming specifically designed for busy schedules,
            recovery needs, and precise race build-ups.
          </p>

          <ul class="space-y-6 mt-4">
            <li class="flex items-start gap-4">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-500 shrink-0 mt-1" />
              <div>
                <strong class="text-white block mb-1">Remove the Guesswork</strong>
                <span class="text-slate-400"
                  >Know exactly what to swim, bike, and run every single week. We remove all daily
                  guesswork so you can just focus on executing.</span
                >
              </div>
            </li>
            <li class="flex items-start gap-4">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-500 shrink-0 mt-1" />
              <div>
                <strong class="text-white block mb-1">Injury-Prevention Framework</strong>
                <span class="text-slate-400"
                  >We balance volume with proper intensity control. Arrive on race day feeling
                  strong, fresh, and fully capable, not broken down.</span
                >
              </div>
            </li>
            <li class="flex items-start gap-4">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-500 shrink-0 mt-1" />
              <div>
                <strong class="text-white block mb-1">Built for the Busy Athlete</strong>
                <span class="text-slate-400"
                  >Your training adapts to your life, not the other way around. Intelligent
                  adjustments ensure you progress without sacrificing your career or family.</span
                >
              </div>
            </li>
            <li class="flex items-start gap-4">
              <UIcon name="i-heroicons-check-circle" class="w-6 h-6 text-cyan-500 shrink-0 mt-1" />
              <div>
                <strong class="text-white block mb-1">High-Touch 1-on-1 Access</strong>
                <span class="text-slate-400"
                  >Weekly schedule adjustments, video movement checks, and race-day execution
                  strategies directly with your dedicated coach.</span
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
