<template>
  <section class="py-24 bg-transparent relative overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="font-athletic text-4xl sm:text-5xl font-bold uppercase text-white mb-6">
          Choose Your
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
            >Quest</span
          >
        </h2>
        <p class="text-lg text-slate-400">
          We specialize in turning athletic potential into podium reality. Select your path and
          let's start the journey.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8">
        <!-- Triathlon -->
        <div
          class="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-800/80 group"
        >
          <div
            class="w-16 h-16 bg-cyan-900/30 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform"
          >
            <UIcon name="i-heroicons-bolt" class="w-8 h-8" />
          </div>
          <h3 class="font-athletic text-2xl font-bold text-white mb-4 uppercase">Triathlon</h3>
          <p class="text-slate-400 mb-8 flex-grow">
            From your first sprint to mastering the Ironman distance. Data-driven programming to
            optimize your swim, bike, and run.
          </p>
          <UButton
            variant="ghost"
            color="primary"
            class="font-bold tracking-wide uppercase text-cyan-400 hover:text-cyan-300"
            >Explore Path</UButton
          >
        </div>

        <!-- HYROX -->
        <div
          class="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-800/80 group relative overflow-hidden"
        >
          <div
            class="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          ></div>
          <div
            class="w-16 h-16 bg-cyan-900/30 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform"
          >
            <UIcon name="i-heroicons-fire" class="w-8 h-8" />
          </div>
          <h3 class="font-athletic text-2xl font-bold text-white mb-4 uppercase">HYROX</h3>
          <p class="text-slate-400 mb-8 flex-grow">
            The ultimate fitness race requires the ultimate preparation. Combine running capacity
            with raw functional strength.
          </p>
          <UButton
            variant="ghost"
            color="primary"
            class="font-bold tracking-wide uppercase text-cyan-400 hover:text-cyan-300"
            >Explore Path</UButton
          >
        </div>

        <!-- Running -->
        <div
          class="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col items-center text-center transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-800/80 group"
        >
          <div
            class="w-16 h-16 bg-cyan-900/30 rounded-xl flex items-center justify-center mb-6 text-cyan-400 group-hover:scale-110 transition-transform"
          >
            <UIcon name="i-heroicons-map" class="w-8 h-8" />
          </div>
          <h3 class="font-athletic text-2xl font-bold text-white mb-4 uppercase">Endurance Run</h3>
          <p class="text-slate-400 mb-8 flex-grow">
            5k to Ultra-Marathon. Build an unbreakable engine with sustainable volume, targeted
            intensity, and sport psychology.
          </p>
          <UButton
            variant="ghost"
            color="primary"
            class="font-bold tracking-wide uppercase text-cyan-400 hover:text-cyan-300"
            >Explore Path</UButton
          >
        </div>
      </div>
    </div>
  </section>
</template>
