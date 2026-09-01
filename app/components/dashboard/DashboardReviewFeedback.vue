<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 h-full">
    <!-- Weekly Review (1/3) -->
    <div class="col-span-1 h-full">
      <DashboardCheckIn class="h-full" />
    </div>

    <!-- Coach Feedback (2/3) -->
    <div class="col-span-1 lg:col-span-2 h-full">
      <DashboardCoachFeedback class="h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
  // Combined widget for Dashboard layout
</script>
