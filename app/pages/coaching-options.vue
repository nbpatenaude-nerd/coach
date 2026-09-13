<template>
  <div>
    <LandingPricingJourney />
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'home',
    auth: false
  })

  useHead({
    title: 'Coaching Options',
    meta: [
      {
        name: 'description',
        content:
          'Explore our coaching options from community support to elite telemetry and performance analysis.'
      }
    ]
  })
</script>
