<template>
  <section class="py-12 md:py-16 relative overflow-hidden z-10 bg-slate-900/30">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-10">
        <h2
          class="font-athletic text-4xl sm:text-5xl font-bold uppercase text-white mb-6 tracking-wide drop-shadow-sm"
        >
          What our Athletes say
        </h2>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 text-center relative group"
        >
          <div
            class="w-20 h-20 mx-auto rounded-full bg-slate-700 mb-6 border-4 border-slate-900 shadow-xl overflow-hidden group-hover:scale-110 transition-transform"
          >
            <UIcon name="i-heroicons-user" class="w-full h-full text-slate-500 p-4" />
          </div>
          <div class="text-slate-300 italic mb-6 relative">
            <span class="absolute -top-4 -left-2 text-4xl text-cyan-500/20">"</span>
            An incredible coaching experience that completely transformed my approach to endurance
            sports. Highly recommended!
            <span class="absolute -bottom-4 -right-2 text-4xl text-cyan-500/20">"</span>
          </div>
          <div class="font-bold text-white uppercase tracking-wider text-sm">Client Name</div>
          <div class="text-slate-500 text-xs tracking-widest uppercase mt-1">Triathlete</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
