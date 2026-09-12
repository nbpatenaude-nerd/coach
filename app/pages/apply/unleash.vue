<template>
  <div class="min-h-screen relative selection:bg-purple-500/30 font-sans bg-transparent">
    <LandingCosmicBackground />

    <!-- Main Content -->
    <div class="relative z-10 pt-32 pb-24 px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-16">
          <h1
            class="font-athletic text-6xl font-bold uppercase text-white mb-6 font-stretch-expanded tracking-widest drop-shadow-2xl"
          >
            Apply for
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400"
              >UNLEASH</span
            >
          </h1>
          <p class="text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
            This tier is for athletes pushing the absolute limits. Please provide detailed insights
            into your physiological and psychological goals.
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
                class="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-purple-500"
              ></div>
              <div
                class="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-purple-500"
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
                        ? 'text-purple-400'
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
            <form class="space-y-32 pb-16" @submit.prevent="submitForm">
              <!-- Personal Info -->
              <section id="personal" class="scroll-mt-40 relative group">
                <div
                  class="absolute -left-8 top-0 h-full w-[1px] bg-gradient-to-b from-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <div class="space-y-12">
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
                        class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors"
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
                        class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors"
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
                        type="text"
                        placeholder="+1 (555) 000-0000"
                        class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors"
                      />
                    </div>
                    <div class="flex flex-col gap-2">
                      <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                        >Location / Country</label
                      >
                      <input
                        v-model="form.location"
                        type="text"
                        placeholder="Victoria, BC"
                        class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <!-- Sport & Results -->
              <section id="sport" class="scroll-mt-40 relative group">
                <div
                  class="absolute -left-8 top-0 h-full w-[1px] bg-gradient-to-b from-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <div class="space-y-12">
                  <h3
                    class="font-athletic text-3xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4"
                  >
                    Sport & Results
                  </h3>

                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                      >Primary Sport</label
                    >
                    <select
                      v-model="form.primarySport"
                      required
                      class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white focus:ring-0 focus:border-purple-400 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Triathlon" class="bg-slate-900 text-white">Triathlon</option>
                      <option value="Running" class="bg-slate-900 text-white">Running</option>
                      <option value="Cycling" class="bg-slate-900 text-white">Cycling</option>
                      <option value="Hyrox" class="bg-slate-900 text-white">Hyrox</option>
                      <option value="Strength" class="bg-slate-900 text-white">Strength</option>
                      <option value="Other" class="bg-slate-900 text-white">Other</option>
                    </select>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                      >Current PRs / Notable Results</label
                    >
                    <textarea
                      v-model="form.prs"
                      required
                      rows="2"
                      placeholder="List your most relevant results..."
                      class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors resize-none"
                    ></textarea>
                  </div>
                </div>
              </section>

              <!-- Experience -->
              <section id="experience" class="scroll-mt-40 relative group">
                <div
                  class="absolute -left-8 top-0 h-full w-[1px] bg-gradient-to-b from-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <div class="space-y-12">
                  <h3
                    class="font-athletic text-3xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4"
                  >
                    Identity & Strategy
                  </h3>

                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                      >How do you want to shape your identity?</label
                    >
                    <textarea
                      v-model="form.identity"
                      required
                      rows="2"
                      placeholder="Share your deeper motivations..."
                      class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors resize-none"
                    ></textarea>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div class="flex flex-col gap-2">
                      <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                        >Strengths & Weaknesses</label
                      >
                      <textarea
                        v-model="form.strengthsWeaknesses"
                        rows="3"
                        placeholder="Self-assessment..."
                        class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors resize-none"
                      ></textarea>
                    </div>
                    <div class="flex flex-col gap-2">
                      <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                        >Current Fueling Strategy</label
                      >
                      <textarea
                        v-model="form.fueling"
                        rows="3"
                        placeholder="Pre, intra, and post-training..."
                        class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Goals -->
              <section id="goals" class="scroll-mt-40 relative group">
                <div
                  class="absolute -left-8 top-0 h-full w-[1px] bg-gradient-to-b from-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                ></div>
                <div class="space-y-12">
                  <h3
                    class="font-athletic text-3xl font-bold text-white uppercase tracking-widest border-b border-white/10 pb-4"
                  >
                    Telemetry & Goals
                  </h3>

                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                      >Current Telemetry Tracking</label
                    >
                    <textarea
                      v-model="form.telemetry"
                      rows="2"
                      placeholder="e.g. HRV, Core Temp, Lactate, Power..."
                      class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors resize-none"
                    ></textarea>
                  </div>

                  <div class="flex flex-col gap-2">
                    <label class="text-xs font-bold uppercase tracking-widest text-slate-500"
                      >Why UNLEASH specifically?</label
                    >
                    <textarea
                      v-model="form.whyUnleash"
                      required
                      rows="2"
                      placeholder="Tell us why this tier is right for you..."
                      class="w-full bg-transparent border-0 border-b border-slate-800 rounded-none px-0 py-2 text-lg font-light text-white placeholder-slate-700 focus:ring-0 focus:border-purple-400 transition-colors resize-none"
                    ></textarea>
                  </div>
                </div>
              </section>

              <div class="pt-8">
                <button
                  type="submit"
                  :disabled="loading"
                  class="group relative flex w-full md:w-auto md:min-w-[300px] mx-auto items-center justify-center gap-4 rounded-full bg-gradient-to-r from-[#b4f07a] to-[#ffda7c] py-4 px-8 text-xl font-bold text-slate-950 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_40px_-10px_#b4f07a] disabled:opacity-50"
                >
                  <span class="tracking-widest">{{
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
    layout: 'apply',
    auth: false
  })

  useSeoMeta({ title: 'Apply for Unleash - Journey Endurance' })

  const tabs = [
    {
      id: 'personal',
      label: 'Personal',
      desc: 'Tell us about yourself and where you are located to build your profile.'
    },
    {
      id: 'sport',
      label: 'Sport & Results',
      desc: 'Detail your primary discipline and most notable racing results to date.'
    },
    {
      id: 'experience',
      label: 'Identity',
      desc: 'Dive into the psychology of your training and your specific fueling strategies.'
    },
    {
      id: 'goals',
      label: 'Goals',
      desc: 'Outline your advanced telemetry usage and your ultimate objective for Unleash.'
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
    prs: '',
    identity: '',
    strengthsWeaknesses: '',
    fueling: '',
    telemetry: '',
    whyUnleash: ''
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
        // Only care about entries coming into view
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
          tier: 'UNLEASH',
          goals: form.value.whyUnleash,
          limiters: form.value.strengthsWeaknesses,
          nutrition: form.value.fueling
        }
      })
      toast.add({
        title: 'Application Submitted',
        description: 'We will review your elite application and contact you soon.',
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
