<template>
  <section class="py-24 relative overflow-hidden z-10 bg-slate-950">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-4xl mx-auto mb-16">
        <h2
          class="font-athletic text-4xl sm:text-5xl font-bold uppercase text-white mb-6 tracking-wide drop-shadow-sm"
        >
          Coaches don't just tell you what to do, they tell you how and why.
        </h2>
        <p class="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Working with a Coach is more than just a training program. They're a resource, an
          experienced human that can contextualize the training you're going through. They have
          experience training and racing, and know what it takes to achieve big changes.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Aerobic Response Rate -->
        <div
          class="bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-cyan-900/30 flex flex-col hover:border-cyan-500/50 transition-colors shadow-lg"
        >
          <div class="w-12 h-12 rounded-lg bg-cyan-950 flex items-center justify-center mb-6">
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-cyan-400" />
          </div>
          <h3 class="font-bold text-xl text-white mb-4 uppercase tracking-wide">
            Aerobic Response Rate
          </h3>
          <p class="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
            In a study on Response Rate, there was a ~42% response rate in the self-guided generic
            training group vs a <strong class="text-cyan-400">100% response rate</strong> via
            individualized threshold targeting.
          </p>
          <div class="text-xs text-slate-600 italic">
            Wolpern, A. E., et al. (2015). Is a threshold-based model a superior method... BMC
            Sports Science, Medicine and Rehabilitation, 7.
          </div>
        </div>

        <!-- Cardiovascular Adaptation -->
        <div
          class="bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-cyan-900/30 flex flex-col hover:border-cyan-500/50 transition-colors shadow-lg"
        >
          <div class="w-12 h-12 rounded-lg bg-cyan-950 flex items-center justify-center mb-6">
            <UIcon name="i-heroicons-heart" class="w-6 h-6 text-cyan-400" />
          </div>
          <h3 class="font-bold text-xl text-white mb-4 uppercase tracking-wide">
            Cardiovascular Adaptation
          </h3>
          <p class="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
            Coached individuals experienced a significantly greater improvement in aerobic
            capacity/VO2 Max (<strong class="text-cyan-400">7% improvement</strong>) compared to the
            self-guided group (0.3% improvement).
          </p>
          <div class="text-xs text-slate-600 italic">
            Storer, T. W., et al. (2014). Effect of Supervised, Periodized Exercise Training vs.
            Self-Directed Training... Journal of Strength and Conditioning Research, 28.
          </div>
        </div>

        <!-- Adherence & Retention -->
        <div
          class="bg-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-cyan-900/30 flex flex-col hover:border-cyan-500/50 transition-colors shadow-lg"
        >
          <div class="w-12 h-12 rounded-lg bg-cyan-950 flex items-center justify-center mb-6">
            <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-cyan-400" />
          </div>
          <h3 class="font-bold text-xl text-white mb-4 uppercase tracking-wide">
            Adherence & Retention
          </h3>
          <p class="text-slate-400 text-sm leading-relaxed mb-6 flex-grow">
            Individuals experience significant increase in compliance and completion rates when
            training with an Individualized program.
          </p>
          <div class="text-xs text-slate-600 italic">
            Collado-Mateo, D., et al. (2021). Key Factors Associated with Adherence to Physical
            Exercise... International Journal of Environmental Research and Public Health, 18.
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
