<template>
  <div>
    <LandingPathsForged />
  </div>
</template>

<script setup lang="ts">
  definePageMeta({
    layout: 'home',
    auth: false
  })

  useHead({
    title: 'Training Programs',
    meta: [
      {
        name: 'description',
        content:
          'Scientifically backed, field-tested plans for your next race. Browse our library of Training Peaks programs designed by our elite coaches.'
      }
    ]
  })
</script>
