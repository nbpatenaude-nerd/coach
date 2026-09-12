<template>
  <div class="min-h-screen relative selection:bg-cyan-500/30 font-sans bg-transparent">
    <LandingCosmicBackground />

    <!-- Main Content -->
    <div class="relative z-10 pt-32 pb-24 px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-16">
          <h1
            class="font-athletic text-6xl font-bold uppercase text-white mb-6 font-stretch-expanded tracking-widest drop-shadow-2xl"
          >
            Apply for
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400"
              >UNLOCK</span
            >
          </h1>
          <p class="text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
            Comprehensive daily coaching, deep data analysis, and direct access to your dedicated AI
            and human coach.
          </p>
        </div>

        <div class="flex flex-col lg:flex-row gap-16 relative items-start">
          <!-- Left Sidebar -->
          <div class="lg:w-1/3 sticky top-32 z-20">
            <div
              class="bg-slate-950/40 backdrop-blur-2xl border-l border-t border-white/5 p-8 shadow-2xl relative"
            >
              <!-- Corner accents -->
              <div
                class="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500"
              ></div>

              <div class="flex flex-col gap-6">
                <button
                  v-for="(tab, index) in tabs"
                  :key="tab.id"
                  class="flex items-center gap-4 text-left transition-all duration-300 group"
                  @click="scrollTo(tab.id)"
                >
                  <span
                    class="font-athletic text-xl tracking-widest transition-colors duration-300"
                    :class="
                      activeSection === tab.id
                        ? 'text-cyan-400'
                        : 'text-slate-600 group-hover:text-slate-400'
                    "
                  >
                    0{{ index + 1 }}
                  </span>
                  <span
                    class="font-bold uppercase tracking-widest text-sm transition-colors duration-300"
                    :class="
                      activeSection === tab.id
                        ? 'text-white'
                        : 'text-slate-500 group-hover:text-slate-300'
                    "
                  >
                    {{ tab.label }}
                  </span>
                </button>
              </div>

              <div class="mt-12 pt-8 border-t border-white/5">
                <p class="text-slate-400 text-sm font-light leading-relaxed">
                  {{ activeTabDescription }}
                </p>
              </div>
            </div>
          </div>

          <!-- Right Content (Forms) -->
          <div class="lg:w-2/3">
            <form class="space-y-16 pb-16" @submit.prevent="submitForm">
              <!-- Personal Info -->
              <section id="personal" class="scroll-mt-40 relative group">
                <div
                  class="bg-slate-950/60 backdrop-blur-xl border border-white/5 p-10 shadow-2xl relative overflow-hidden"
                >
                  <div
                    class="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full"
                  ></div>

                  <div class="space-y-12 relative z-10">
                    <h3
                      class="font-athletic text-3xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4"
                    >
                      Personal Info
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                          >Full Name</label
                        >
                        <input
                          v-model="form.name"
                          required
                          type="text"
                          placeholder="John Doe"
                          class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                        />
                      </div>
                      <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                          >Email Address</label
                        >
                        <input
                          v-model="form.email"
                          required
                          type="email"
                          placeholder="john@example.com"
                          class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                          >Phone Number</label
                        >
                        <input
                          v-model="form.phone"
                          required
                          type="text"
                          placeholder="+1 (555) 000-0000"
                          class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                        />
                      </div>
                      <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                          >Location / Country</label
                        >
                        <input
                          v-model="form.location"
                          required
                          type="text"
                          placeholder="Victoria, BC"
                          class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Sport -->
              <section id="sport" class="scroll-mt-40 relative group">
                <div
                  class="bg-slate-950/60 backdrop-blur-xl border border-white/5 p-10 shadow-2xl relative overflow-hidden"
                >
                  <div
                    class="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full"
                  ></div>

                  <div class="space-y-12 relative z-10">
                    <h3
                      class="font-athletic text-3xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4"
                    >
                      Sport Profile
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                          >Primary Sport</label
                        >
                        <select
                          v-model="form.primarySport"
                          required
                          class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white focus:ring-0 focus:border-cyan-400 transition-colors appearance-none cursor-pointer"
                        >
                          <option value="Triathlon" class="bg-slate-900 text-white">
                            Triathlon
                          </option>
                          <option value="Running" class="bg-slate-900 text-white">Running</option>
                          <option value="Cycling" class="bg-slate-900 text-white">Cycling</option>
                          <option value="Hyrox" class="bg-slate-900 text-white">Hyrox</option>
                          <option value="Strength" class="bg-slate-900 text-white">Strength</option>
                          <option value="Other" class="bg-slate-900 text-white">Other</option>
                        </select>
                      </div>
                      <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                          >Secondary Sports</label
                        >
                        <input
                          v-model="form.secondarySports"
                          required
                          type="text"
                          placeholder="e.g. Swimming, Weightlifting"
                          class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Experience -->
              <section id="experience" class="scroll-mt-40 relative group">
                <div
                  class="bg-slate-950/60 backdrop-blur-xl border border-white/5 p-10 shadow-2xl relative overflow-hidden"
                >
                  <div
                    class="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full"
                  ></div>

                  <div class="space-y-12 relative z-10">
                    <h3
                      class="font-athletic text-3xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4"
                    >
                      Experience
                    </h3>

                    <div class="flex flex-col gap-4">
                      <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                        >Current Experience Level</label
                      >
                      <div class="flex gap-6">
                        <label
                          v-for="lvl in ['Beginner', 'Intermediate', 'Advanced']"
                          :key="lvl"
                          class="flex items-center gap-3 cursor-pointer group/radio"
                        >
                          <div
                            class="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center transition-colors group-hover/radio:border-cyan-400"
                            :class="form.experienceLevel === lvl ? 'border-cyan-400' : ''"
                          >
                            <div
                              class="w-2.5 h-2.5 rounded-full bg-cyan-400 transition-transform"
                              :class="form.experienceLevel === lvl ? 'scale-100' : 'scale-0'"
                            ></div>
                          </div>
                          <span
                            class="text-slate-300 group-hover/radio:text-white transition-colors"
                          >
                            <input
                              v-model="form.experienceLevel"
                              type="radio"
                              :value="lvl"
                              required
                              class="sr-only"
                            />
                            {{ lvl }}
                          </span>
                        </label>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                          >Years in sport</label
                        >
                        <input
                          v-model="form.years"
                          required
                          type="number"
                          min="0"
                          placeholder="e.g. 3"
                          class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                        />
                      </div>
                      <div class="flex flex-col gap-2">
                        <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                          >Current Weekly Volume (Hours)</label
                        >
                        <input
                          v-model="form.volume"
                          required
                          type="number"
                          min="0"
                          placeholder="e.g. 8"
                          class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col gap-2">
                      <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                        >What do you struggle with most?</label
                      >
                      <textarea
                        v-model="form.limiters"
                        required
                        rows="2"
                        placeholder="Nutrition, consistency, injuries, etc."
                        class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Goals -->
              <section id="goals" class="scroll-mt-40 relative group">
                <div
                  class="bg-slate-950/60 backdrop-blur-xl border border-white/5 p-10 shadow-2xl relative overflow-hidden"
                >
                  <div
                    class="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full"
                  ></div>

                  <div class="space-y-12 relative z-10">
                    <h3
                      class="font-athletic text-3xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4"
                    >
                      Goals
                    </h3>

                    <div class="flex flex-col gap-2">
                      <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                        >A-Race / Main Goal for the Season</label
                      >
                      <textarea
                        v-model="form.mainGoal"
                        required
                        rows="2"
                        placeholder="Describe your primary objective..."
                        class="w-full bg-transparent border-0 border-b border-slate-700 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-600 focus:ring-0 focus:border-cyan-400 transition-colors resize-none"
                      ></textarea>
                    </div>

                    <div class="flex flex-col gap-4">
                      <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                        >Commitment Level (1-10)</label
                      >
                      <div class="px-2 pt-2">
                        <input
                          v-model="form.commitment"
                          type="range"
                          min="1"
                          max="10"
                          required
                          class="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />
                        <div
                          class="flex justify-between text-xs text-slate-500 mt-4 font-bold uppercase tracking-widest"
                        >
                          <span>Casual</span>
                          <span class="text-cyan-400 text-lg">{{ form.commitment }}</span>
                          <span>Dedicated</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <div class="pt-8 pb-32">
                <button
                  type="submit"
                  :disabled="loading"
                  class="group relative flex w-full md:w-auto md:min-w-[300px] mx-auto items-center justify-center gap-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 py-4 px-8 text-xl font-bold text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(6,182,212,0.8)] disabled:opacity-50"
                >
                  <span class="tracking-widest uppercase">{{
                    loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'
                  }}</span>
                  <span class="transition-transform group-hover:translate-x-2 text-2xl leading-none"
                    >&rarr;</span
                  >
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'

  definePageMeta({
    layout: 'home',
    auth: false
  })

  useSeoMeta({ title: 'Apply for Unlock - Journey Endurance' })

  const tabs = [
    {
      id: 'personal',
      label: 'Personal',
      desc: 'Start by providing your basic contact details and location.'
    },
    {
      id: 'sport',
      label: 'Sport Profile',
      desc: 'Select your primary discipline and secondary activities.'
    },
    {
      id: 'experience',
      label: 'Experience',
      desc: 'Detail your current training volume, level, and biggest hurdles.'
    },
    {
      id: 'goals',
      label: 'Goals',
      desc: 'Identify your main A-Race and define your training commitment level.'
    }
  ]

  const activeSection = ref('personal')
  const loading = ref(false)
  const toast = useToast()

  const activeTabDescription = computed(() => {
    return tabs.find((t) => t.id === activeSection.value)?.desc || tabs[0].desc
  })

  const form = ref({
    name: '',
    email: '',
    phone: '',
    location: '',
    primarySport: 'Triathlon',
    secondarySports: '',
    experienceLevel: 'Intermediate',
    years: '',
    volume: '',
    limiters: '',
    mainGoal: '',
    commitment: '7'
  })

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 150
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeSection.value = entry.target.id
          }
        })
      },
      { rootMargin: '-30% 0px -65% 0px', threshold: 0 }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer?.observe(section))
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  const submitForm = async () => {
    loading.value = true
    try {
      await ('/api/apply/submit',
      {
        method: 'POST',
        body: {
          ...form.value,
          tier: 'UNLOCK',
          goals: form.value.mainGoal,
          experience: form.value.experienceLevel
        }
      })
      toast.add({
        title: 'Application Submitted',
        description: 'We will review your application and contact you soon.',
        color: 'green'
      })
      navigateTo('/')
    } catch (err) {
      toast.add({
        title: 'Submission Failed',
        description: 'An error occurred. Please try again.',
        color: 'red'
      })
    } finally {
      loading.value = false
    }
  }
</script>
