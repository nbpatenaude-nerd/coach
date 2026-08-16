<script setup lang="ts">
  import { computed } from 'vue'
  import { useNavigation } from '~/composables/useNavigation'

  const { isCoach } = useNavigation()

  const links = computed(() => {
    const baseLinks = [
      {
        label: 'My Coaches',
        icon: 'i-lucide-building-2',
        to: '/coaching/team'
      }
    ]

    if (isCoach.value) {
      return [
        {
          label: 'Overview',
          icon: 'i-lucide-layout-dashboard',
          to: '/coaching',
          exact: true
        },
        {
          label: 'Calendar',
          icon: 'i-lucide-calendar-days',
          to: '/coaching/calendar'
        },
        {
          label: 'Athletes',
          icon: 'i-lucide-users-round',
          to: '/coaching/athletes'
        },
        {
          label: 'Analytics',
          icon: 'i-lucide-bar-chart-3',
          to: '/analytics'
        },
        ...baseLinks
      ]
    }

    return baseLinks
  })
</script>

<template>
  <div
    class="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2 h-full pointer-events-none"
  >
    <div class="pointer-events-auto">
      <UNavigationMenu :items="links" orientation="horizontal" />
    </div>
  </div>
</template>
