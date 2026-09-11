<template>
  <section class="py-24 relative overflow-hidden z-10">
    <div class="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
      <div class="text-center max-w-3xl mx-auto mb-20">
        <h2
          class="font-athletic text-4xl sm:text-6xl font-bold uppercase text-white mb-6 tracking-wide drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          Choose Your
          <span
            class="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
            >Quest</span
          >
        </h2>
        <p class="text-lg text-slate-300 max-w-2xl mx-auto">
          We specialize in turning athletic potential into podium reality. Select your path and
          let's start the journey.
        </p>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <!-- Triathlon -->
        <div
          class="bg-[rgba(10,15,30,0.6)] backdrop-blur-xl rounded-[2rem] border border-cyan-500/20 p-8 flex flex-col items-center text-center transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] shadow-[0_4px_20px_rgba(0,0,0,0.5)] group relative overflow-hidden"
        >
          <div
            class="w-16 h-16 bg-cyan-900/30 rounded-2xl flex items-center justify-center mb-8 text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-500 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]"
          >
            <UIcon name="i-heroicons-bolt" class="w-8 h-8" />
          </div>
          <h3
            class="text-2xl font-bold text-white mb-4 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] uppercase transition-all duration-300"
          >
            Triathlon
          </h3>
          <p class="text-sm text-slate-300 leading-relaxed mb-8 flex-grow">
            From your first sprint to mastering the Ironman distance. Data-driven programming to
            optimize your swim, bike, and run.
          </p>
          <UButton
            variant="ghost"
            class="rounded-full font-bold tracking-widest uppercase text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-300 px-6 py-2"
            >Explore Path &rarr;</UButton
          >
        </div>

        <!-- HYROX -->
        <div
          class="bg-[rgba(10,15,30,0.6)] backdrop-blur-xl rounded-[2rem] border border-pink-500/30 p-8 flex flex-col items-center text-center transition-all duration-500 shadow-[0_0_30px_rgba(236,72,153,0.1)] hover:shadow-[0_0_50px_rgba(236,72,153,0.25)] hover:border-pink-400/60 group relative overflow-hidden md:-translate-y-4"
        >
          <div
            class="absolute inset-0 opacity-100 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style="
              background: radial-gradient(
                600px circle at 50% 0%,
                rgba(236, 72, 153, 0.15),
                transparent 60%
              );
            "
          ></div>
          <div
            class="w-16 h-16 bg-pink-900/30 rounded-2xl flex items-center justify-center mb-8 text-pink-400 group-hover:scale-110 group-hover:text-pink-300 group-hover:drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] transition-all duration-500 shadow-[inset_0_0_20px_rgba(236,72,153,0.1)] relative z-10"
          >
            <UIcon name="i-heroicons-fire" class="w-8 h-8" />
          </div>
          <h3
            class="text-2xl font-bold text-white mb-4 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] uppercase transition-all duration-300 relative z-10"
          >
            HYROX
          </h3>
          <p class="text-sm text-slate-300 leading-relaxed mb-8 flex-grow relative z-10">
            Combine functional strength with raw aerobic engine. Specific race-simulation workouts
            to dominate the Roxzone.
          </p>
          <UButton
            variant="ghost"
            class="rounded-full font-bold tracking-widest uppercase text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] transition-all duration-300 px-6 py-2 relative z-10"
            >Explore Path &rarr;</UButton
          >
        </div>

        <!-- Running -->
        <div
          class="bg-[rgba(10,15,30,0.6)] backdrop-blur-xl rounded-[2rem] border border-cyan-500/20 p-8 flex flex-col items-center text-center transition-all duration-500 hover:border-cyan-400/50 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)] shadow-[0_4px_20px_rgba(0,0,0,0.5)] group relative overflow-hidden"
        >
          <div
            class="w-16 h-16 bg-cyan-900/30 rounded-2xl flex items-center justify-center mb-8 text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 group-hover:drop-shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-500 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]"
          >
            <UIcon name="i-lucide-footprints" class="w-8 h-8" />
          </div>
          <h3
            class="text-2xl font-bold text-white mb-4 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] uppercase transition-all duration-300"
          >
            Endurance Running
          </h3>
          <p class="text-sm text-slate-300 leading-relaxed mb-8 flex-grow">
            5K to Ultramarathon. Smart volume progression and polarized training to build your
            aerobic base without breaking down.
          </p>
          <UButton
            variant="ghost"
            class="rounded-full font-bold tracking-widest uppercase text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all duration-300 px-6 py-2"
            >Explore Path &rarr;</UButton
          >
        </div>
      </div>
    </div>
  </section>
</template>
