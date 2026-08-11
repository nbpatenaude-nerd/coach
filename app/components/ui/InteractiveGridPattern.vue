<template>
  <svg
    :width="width * squares[0]"
    :height="height * squares[1]"
    class="absolute inset-0 h-full w-full"
    :class="className"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        :id="patternId"
        :width="width"
        :height="height"
        patternUnits="userSpaceOnUse"
        x="0"
        y="0"
      >
        <path
          :d="`M.5 ${height}V.5H${width}`"
          fill="none"
          stroke="currentColor"
          stroke-dasharray="0"
          class="text-slate-800/30"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" stroke-width="0" :fill="`url(#${patternId})`" />
    <svg :x="0" :y="0" class="overflow-visible">
      <rect
        v-for="i in squares[0] * squares[1]"
        :key="i"
        :width="width - 1"
        :height="height - 1"
        :x="((i - 1) % squares[0]) * width + 1"
        :y="Math.floor((i - 1) / squares[0]) * height + 1"
        fill="currentColor"
        class="transition-opacity duration-1000 ease-out opacity-0 hover:opacity-100 hover:duration-0"
        :class="squaresClassName"
      />
    </svg>
  </svg>
</template>

<script setup lang="ts">
  import { useId } from '#imports'
  import type { PropType } from 'vue'

  const props = defineProps({
    width: {
      type: Number,
      default: 40
    },
    height: {
      type: Number,
      default: 40
    },
    squares: {
      type: Array as PropType<number[]>,
      default: () => [40, 40]
    },
    className: {
      type: String,
      default: ''
    },
    squaresClassName: {
      type: String,
      default: ''
    }
  })

  const patternId = useId()
</script>
