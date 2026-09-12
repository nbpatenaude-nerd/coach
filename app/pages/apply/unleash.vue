<template>
  <div class="min-h-screen relative selection:bg-purple-500/30">
    <!-- Fixed Parallax Backgrounds -->
    <div
      class="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
      :class="activeSection === 'personal' ? 'opacity-100' : 'opacity-0'"
    >
      <div class="absolute inset-0 bg-slate-950"></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(124,58,237,0.15),_transparent_50%)]"
      ></div>
      <div
        class="absolute inset-0"
        style="
          background-image: radial-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        "
      ></div>
    </div>

    <div
      class="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
      :class="activeSection === 'sport' ? 'opacity-100' : 'opacity-0'"
    >
      <div class="absolute inset-0 bg-slate-950"></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(56,189,248,0.15),_transparent_50%)]"
      ></div>
      <div
        class="absolute inset-0"
        style="
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 64px 64px;
        "
      ></div>
    </div>

    <div
      class="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
      :class="activeSection === 'experience' ? 'opacity-100' : 'opacity-0'"
    >
      <div class="absolute inset-0 bg-slate-950"></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(236,72,153,0.15),_transparent_50%)]"
      ></div>
      <div
        class="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500/20 to-transparent transform -translate-y-1/2 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
      ></div>
    </div>

    <div
      class="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
      :class="activeSection === 'goals' ? 'opacity-100' : 'opacity-0'"
    >
      <div class="absolute inset-0 bg-slate-950"></div>
      <div
        class="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,_rgba(139,92,246,0.1)_0deg,_transparent_180deg,_rgba(139,92,246,0.1)_360deg)]"
      ></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,_rgba(168,85,247,0.15),_transparent_60%)]"
      ></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 pt-32 pb-24 px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-12">
          <h1 class="font-athletic text-5xl font-bold uppercase text-white mb-4">
            Apply for <span class="text-purple-400">UNLEASH</span>
          </h1>
          <p class="text-xl text-slate-400 max-w-2xl">
            This tier is for athletes pushing the absolute limits. Please provide detailed insights
            into your physiological and psychological goals.
          </p>
        </div>

        <div class="flex flex-col lg:flex-row gap-12 relative items-start">
          <!-- Left Sidebar (Sticky Melius Style) -->
          <div class="lg:w-1/3 sticky top-32 z-20">
            <div
              class="bg-[#1a1a1a] rounded-xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden"
            >
              <!-- Horizontal Navigation Tabs -->
              <div
                class="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide border-b border-slate-800/50"
              >
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  class="px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300"
                  :class="
                    activeSection === tab.id
                      ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  "
                  @click="scrollTo(tab.id)"
                >
                  {{ tab.label }}
                </button>
              </div>

              <!-- Dynamic Description -->
              <div class="pt-4 min-h-[100px] flex items-center justify-between">
                <p class="text-slate-300 text-lg leading-snug pr-4">
                  {{ activeTabDescription }}
                </p>
                <div
                  class="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-red-500/40 transition-colors"
                  @click="scrollToNext"
                >
                  <UIcon name="i-heroicons-arrow-down" class="w-5 h-5 text-red-500" />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Content (Scrolling Forms) -->
          <div class="lg:w-2/3">
            <form class="space-y-32 pb-16" @submit.prevent="submitForm">
              <!-- Personal Info -->
              <section id="personal" class="scroll-mt-40">
                <div
                  class="bg-[#131313]/90 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl"
                >
                  <h3
                    class="font-athletic text-2xl font-bold text-white mb-8 uppercase tracking-wide"
                  >
                    Personal Info
                  </h3>
                  <div class="space-y-6">
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
              <section id="sport" class="scroll-mt-40">
                <div
                  class="bg-[#131313]/90 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl"
                >
                  <h3
                    class="font-athletic text-2xl font-bold text-white mb-8 uppercase tracking-wide"
                  >
                    Sport & Results
                  </h3>
                  <div class="space-y-6">
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
              <section id="experience" class="scroll-mt-40">
                <div
                  class="bg-[#131313]/90 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl"
                >
                  <h3
                    class="font-athletic text-2xl font-bold text-white mb-8 uppercase tracking-wide"
                  >
                    Identity & Strategy
                  </h3>
                  <div class="space-y-8">
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
              <section id="goals" class="scroll-mt-40">
                <div
                  class="bg-[#131313]/90 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl"
                >
                  <h3
                    class="font-athletic text-2xl font-bold text-white mb-8 uppercase tracking-wide"
                  >
                    Telemetry & Goals
                  </h3>
                  <div class="space-y-8">
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
                  class="w-full justify-center text-white font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all hover:scale-[1.02] bg-red-600 hover:bg-red-500"
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
      // If at the end, just focus the submit button
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  }

  let observer: IntersectionObserver | null = null

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        // Sort entries by intersection ratio to find the most visible one
        const visibleEntries = entries.filter((e) => e.isIntersecting)
        if (visibleEntries.length > 0) {
          // If multiple are visible, pick the one taking up the most space
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
