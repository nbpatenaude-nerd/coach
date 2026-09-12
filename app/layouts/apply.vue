<template>
  <div class="min-h-screen flex flex-col font-sans bg-transparent text-gray-100 overflow-x-clip">
    <header
      class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      :class="[
        y > 50
          ? 'bg-slate-950/80 backdrop-blur-lg border-b border-white/10 shadow-lg'
          : 'bg-slate-950/20 backdrop-blur-sm'
      ]"
    >
      <div
        class="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 transition-all duration-300"
        :class="y > 50 ? 'h-20' : 'h-24 pt-2'"
      >
        <NuxtLink
          to="/"
          class="flex shrink-0 items-center transition-opacity hover:opacity-90 relative z-50"
        >
          <img
            src="/media/logo.webp"
            alt="Journey Endurance"
            class="w-auto object-contain drop-shadow-lg transition-all duration-300"
            :class="y > 50 ? 'h-12 sm:h-16' : 'h-16 sm:h-20'"
          />
        </NuxtLink>

        <nav
          class="hidden items-center gap-8 text-sm font-bold lg:flex text-gray-300"
          aria-label="Primary"
        >
          <NuxtLink
            to="/"
            class="uppercase tracking-widest whitespace-nowrap hover:text-white transition-colors"
            >Home</NuxtLink
          >
          <NuxtLink
            to="/about"
            class="uppercase tracking-widest whitespace-nowrap hover:text-white transition-colors"
            >About</NuxtLink
          >
        </nav>

        <div class="flex items-center gap-2 mt-2">
          <UButton
            to="/login"
            color="white"
            class="!bg-white/10 backdrop-blur-sm text-white hover:!bg-white/20 uppercase tracking-widest text-xs font-bold whitespace-nowrap px-8 py-2.5 rounded-sm shadow-md transition-all"
            >SIGN IN</UButton
          >
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>
  </div>
</template>

<script setup>
  import { useWindowScroll } from '@vueuse/core'

  const { y } = useWindowScroll()
</script>
