<template>
  <div class="min-h-screen relative selection:bg-purple-500/30">
    <LandingCosmicBackground />

    <!-- Main Content -->
    <div class="relative z-10 pt-32 pb-24 px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-16">
          <h1
            class="font-athletic text-5xl font-bold uppercase text-white mb-4 font-stretch-expanded tracking-wider"
          >
            Apply for <span class="text-purple-400">UNLEASH</span>
          </h1>
          <p class="text-xl text-slate-300 max-w-2xl">
            This tier is for athletes pushing the absolute limits. Please provide detailed insights
            into your physiological and psychological goals.
          </p>
        </div>

        <div class="flex flex-col lg:flex-row gap-12 relative items-start">
          <!-- Left Sidebar (Sticky Melius Style) -->
          <div class="lg:w-1/3 sticky top-32 z-20">
            <div
              class="bg-slate-950/80 backdrop-blur-md rounded-none border-l-4 border-l-purple-500 p-6 shadow-2xl relative overflow-hidden"
            >
              <!-- Horizontal Navigation Tabs -->
              <div
                class="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide border-b border-slate-800/50"
              >
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  class="px-4 py-1.5 rounded-none text-sm font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300"
                  :class="
                    activeSection === tab.id
                      ? 'bg-purple-500 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-900'
                  "
                  @click="scrollTo(tab.id)"
                >
                  {{ tab.label }}
                </button>
              </div>

              <!-- Dynamic Description -->
              <div class="pt-4 min-h-[100px] flex items-center justify-between">
                <p class="text-slate-300 text-lg pr-4">
                  {{ activeTabDescription }}
                </p>
                <div
                  class="w-10 h-10 bg-purple-500/20 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-purple-500/40 transition-colors"
                  @click="scrollToNext"
                >
                  <UIcon name="i-heroicons-arrow-down" class="w-5 h-5 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Content (Scrolling Forms) -->
          <div class="lg:w-2/3">
            <form class="space-y-32 pb-16" @submit.prevent="submitForm">
              <!-- Personal Info -->
              <section id="personal" class="scroll-mt-40 relative">
                <div class="absolute -top-4 -left-4 z-10">
                  <span
                    class="bg-purple-500 text-black px-3 py-1 text-xs font-bold tracking-widest uppercase shadow-md"
                  >
                    01 // Personal Info
                  </span>
                </div>
                <div
                  class="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-none p-8 pt-12 shadow-2xl relative overflow-hidden"
                >
                  <div
                    class="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none"
                  ></div>

                  <div class="space-y-6 relative z-10">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <UFormGroup label="Full Name" name="name" required>
                        <UInput
                          v-model="form.name"
                          placeholder="John Doe"
                          size="lg"
                          class="bg-black/50"
                        />
                      </UFormGroup>
                      <UFormGroup label="Email Address" name="email" required>
                        <UInput
                          v-model="form.email"
                          type="email"
                          placeholder="john@example.com"
                          size="lg"
                          class="bg-black/50"
                        />
                      </UFormGroup>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <UFormGroup label="Phone Number" name="phone">
                        <UInput
                          v-model="form.phone"
                          placeholder="+1 (555) 000-0000"
                          size="lg"
                          class="bg-black/50"
                        />
                      </UFormGroup>
                      <UFormGroup label="Location / Country" name="location">
                        <UInput
                          v-model="form.location"
                          placeholder="e.g. Victoria, BC"
                          size="lg"
                          class="bg-black/50"
                        />
                      </UFormGroup>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Sport & Results -->
              <section id="sport" class="scroll-mt-40 relative">
                <div class="absolute -top-4 -left-4 z-10">
                  <span
                    class="bg-purple-500 text-black px-3 py-1 text-xs font-bold tracking-widest uppercase shadow-md"
                  >
                    02 // Sport & Results
                  </span>
                </div>
                <div
                  class="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-none p-8 pt-12 shadow-2xl relative overflow-hidden"
                >
                  <div class="space-y-6 relative z-10">
                    <UFormGroup label="Primary Sport" name="primarySport" required>
                      <USelectMenu
                        v-model="form.primarySport"
                        :options="['Triathlon', 'Running', 'Cycling', 'Hyrox', 'Strength', 'Other']"
                        size="lg"
                        class="bg-black/50"
                      />
                    </UFormGroup>
                    <UFormGroup label="Current PRs / Notable Results" name="prs" required>
                      <UTextarea
                        v-model="form.prs"
                        placeholder="List your most relevant results..."
                        autoresize
                        size="lg"
                        class="bg-black/50"
                      />
                    </UFormGroup>
                  </div>
                </div>
              </section>

              <!-- Experience -->
              <section id="experience" class="scroll-mt-40 relative">
                <div class="absolute -top-4 -left-4 z-10">
                  <span
                    class="bg-purple-500 text-black px-3 py-1 text-xs font-bold tracking-widest uppercase shadow-md"
                  >
                    03 // Identity & Strategy
                  </span>
                </div>
                <div
                  class="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-none p-8 pt-12 shadow-2xl relative overflow-hidden"
                >
                  <div class="space-y-8 relative z-10">
                    <UFormGroup
                      label="How do you want to shape your identity as an athlete?"
                      name="identity"
                      required
                    >
                      <UTextarea
                        v-model="form.identity"
                        placeholder="Share your deeper motivations..."
                        autoresize
                        size="lg"
                        class="bg-black/50"
                      />
                    </UFormGroup>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <UFormGroup
                        label="What holds you back? What are you best at?"
                        name="strengthsWeaknesses"
                      >
                        <UTextarea
                          v-model="form.strengthsWeaknesses"
                          placeholder="Self-assessment..."
                          autoresize
                          size="lg"
                          class="bg-black/50"
                        />
                      </UFormGroup>
                      <UFormGroup label="Describe your current fueling strategy." name="fueling">
                        <UTextarea
                          v-model="form.fueling"
                          placeholder="Pre, intra, and post-training..."
                          autoresize
                          size="lg"
                          class="bg-black/50"
                        />
                      </UFormGroup>
                    </div>
                  </div>
                </div>
              </section>

              <!-- Goals -->
              <section id="goals" class="scroll-mt-40 relative">
                <div class="absolute -top-4 -left-4 z-10">
                  <span
                    class="bg-purple-500 text-black px-3 py-1 text-xs font-bold tracking-widest uppercase shadow-md"
                  >
                    04 // Telemetry & Goals
                  </span>
                </div>
                <div
                  class="bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-none p-8 pt-12 shadow-2xl relative overflow-hidden"
                >
                  <div class="space-y-8 relative z-10">
                    <UFormGroup
                      label="What metrics or telemetry do you currently track?"
                      name="telemetry"
                    >
                      <UTextarea
                        v-model="form.telemetry"
                        placeholder="e.g. HRV, Core Temp, Lactate, Power..."
                        autoresize
                        size="lg"
                        class="bg-black/50"
                      />
                    </UFormGroup>

                    <UFormGroup
                      label="Why are you applying for UNLEASH specifically?"
                      name="whyUnleash"
                      required
                    >
                      <UTextarea
                        v-model="form.whyUnleash"
                        placeholder="Tell us why this tier is right for you..."
                        autoresize
                        size="lg"
                        class="bg-black/50"
                      />
                    </UFormGroup>
                  </div>
                </div>
              </section>

              <div class="pt-8">
                <UButton
                  type="submit"
                  size="xl"
                  class="w-full justify-center text-white font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02] bg-purple-600 hover:bg-purple-500 rounded-none"
                  :loading="loading"
                >
                  Submit UNLEASH Application
                </UButton>
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

  useSeoMeta({ title: 'Apply for Unleash - Journey Endurance' })

  const tabs = [
    {
      id: 'personal',
      label: 'Personal',
      desc: 'Tell us about yourself and where you are located to build your profile.'
    },
    {
      id: 'sport',
      label: 'Sport',
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
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToNext = () => {
    const currentIndex = tabs.findIndex((t) => t.id === activeSection.value)
    if (currentIndex < tabs.length - 1) {
      scrollTo(tabs[currentIndex + 1].id)
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  }

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((e) => e.isIntersecting)
        if (visibleEntries.length > 0) {
          const mostVisible = visibleEntries.reduce((prev, current) =>
            prev.intersectionRatio > current.intersectionRatio ? prev : current
          )
          activeSection.value = mostVisible.target.id
        }
      },
      { rootMargin: '-10% 0px -40% 0px', threshold: [0, 0.2, 0.5, 0.8, 1] }
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
<style scoped>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
