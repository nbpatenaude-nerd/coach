<template>
  <div class="min-h-screen bg-slate-950 pt-32 pb-24">
    <div class="max-w-7xl mx-auto px-6 lg:px-8">
      <h1 class="font-athletic text-5xl font-bold uppercase text-white mb-8">Media & Content</h1>
      <p class="text-xl text-slate-400 mb-16 max-w-2xl">
        Tune into the Journey Endurance podcast, read our latest training blogs, and stay updated
        with our community on Instagram.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div class="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <h2 class="text-2xl font-bold text-white mb-4">The Podcast</h2>
          <p class="text-slate-400 mb-6">
            Coming soon. Deep dives into physiology, training methodology, and interviews with elite
            athletes.
          </p>
          <UButton color="primary" variant="outline" disabled>Listen Now</UButton>
        </div>
        <div class="bg-slate-900 rounded-2xl p-8 border border-slate-800">
          <h2 class="text-2xl font-bold text-white mb-4">Training Blog</h2>
          <p class="text-slate-400 mb-6">
            Coming soon. Articles on endurance, nutrition, and mental resilience.
          </p>
          <UButton color="primary" variant="outline" disabled>Read Articles</UButton>
        </div>
      </div>

      <h2 class="font-athletic text-4xl font-bold uppercase text-white mb-8">Instagram</h2>
      <div
        class="bg-slate-900 rounded-2xl p-8 border border-slate-800 flex items-center justify-center min-h-[300px]"
      >
        <p class="text-slate-400 text-lg">Instagram feed integration coming soon.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'home',
    auth: false
  })
  useSeoMeta({ title: 'Media - Journey Endurance' })
</script>
