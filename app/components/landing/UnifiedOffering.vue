<template>
  <section class="py-24 relative overflow-hidden z-10 bg-slate-900">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2
          class="font-athletic text-4xl sm:text-5xl font-bold uppercase text-white mb-6 tracking-wide drop-shadow-sm"
        >
          Start Your Coaching Journey
        </h2>
        <p class="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Everything you need to succeed, unified into a single comprehensive coaching experience.
          We provide the guidance, tools, and expertise so you can focus on the work.
        </p>
        <UButton
          to="https://app.reclaim.ai/m/Coach-Nick/journey-begins"
          target="_blank"
          size="xl"
          class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold whitespace-nowrap px-10 py-4 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.6)] text-lg"
        >
          Book Your Exploratory Call
        </UButton>
        <p class="mt-6 text-sm text-slate-500">
          Not sure what you need?
          <NuxtLink to="/coaching-options" class="text-cyan-400 hover:underline"
            >View all coaching options</NuxtLink
          >
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
