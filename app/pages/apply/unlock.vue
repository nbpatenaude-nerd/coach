<template>
  <div class="min-h-screen relative selection:bg-cyan-500/30">
    <!-- Fixed Parallax Backgrounds -->
    <div
      class="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
      :class="activeSection === 'personal' ? 'opacity-100' : 'opacity-0'"
    >
      <div class="absolute inset-0 bg-slate-950"></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(6,182,212,0.15),_transparent_50%)]"
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
        class="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(59,130,246,0.15),_transparent_50%)]"
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
        class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.15),_transparent_50%)]"
      ></div>
      <div
        class="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent transform -translate-y-1/2 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
      ></div>
    </div>

    <div
      class="fixed inset-0 z-0 pointer-events-none transition-opacity duration-1000"
      :class="activeSection === 'goals' ? 'opacity-100' : 'opacity-0'"
    >
      <div class="absolute inset-0 bg-slate-950"></div>
      <div
        class="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_rgba(14,165,233,0.1)_0deg,_transparent_180deg,_rgba(14,165,233,0.1)_360deg)]"
      ></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,_rgba(6,182,212,0.15),_transparent_60%)]"
      ></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 pt-32 pb-24 px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="mb-12">
          <h1 class="font-athletic text-5xl font-bold uppercase text-white mb-4">
            Apply for <span class="text-cyan-400">UNLOCK</span>
          </h1>
          <p class="text-xl text-slate-400 max-w-2xl">
            Comprehensive daily coaching, deep data analysis, and direct access to your dedicated AI
            and human coach.
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
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
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
                  class="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 cursor-pointer hover:bg-cyan-500/40 transition-colors"
                  @click="scrollToNext"
                >
                  <UIcon name="i-heroicons-arrow-down" class="w-5 h-5 text-cyan-500" />
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

              <!-- Sport -->
              <section id="sport" class="scroll-mt-40">
                <div
                  class="bg-[#131313]/90 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl"
                >
                  <h3
                    class="font-athletic text-2xl font-bold text-white mb-8 uppercase tracking-wide"
                  >
                    Sport Profile
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
                    <UFormGroup label="Secondary Sports / Cross-training" name="secondarySports">
                      <UInput
                        v-model="form.secondarySports"
                        placeholder="e.g. Swimming, Weightlifting"
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
                    Experience
                  </h3>
                  <div class="space-y-8">
                    <UFormGroup label="Current Experience Level" name="experienceLevel" required>
                      <URadioGroup
                        v-model="form.experienceLevel"
                        :options="['Beginner', 'Intermediate', 'Advanced']"
                        class="mt-2"
                      />
                    </UFormGroup>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <UFormGroup label="Years in sport" name="years">
                        <UInput
                          v-model="form.years"
                          type="number"
                          placeholder="e.g. 3"
                          size="lg"
                          class="bg-black/50"
                        />
                      </UFormGroup>
                      <UFormGroup label="Current Weekly Volume (Hours)" name="volume">
                        <UInput
                          v-model="form.volume"
                          type="number"
                          placeholder="e.g. 8"
                          size="lg"
                          class="bg-black/50"
                        />
                      </UFormGroup>
                    </div>

                    <UFormGroup label="What do you struggle with most?" name="limiters">
                      <UTextarea
                        v-model="form.limiters"
                        placeholder="Nutrition, consistency, injuries, etc."
                        autoresize
                        size="lg"
                        class="bg-black/50"
                      />
                    </UFormGroup>
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
                    Goals
                  </h3>
                  <div class="space-y-8">
                    <UFormGroup label="A-Race / Main Goal for the Season" name="mainGoal" required>
                      <UTextarea
                        v-model="form.mainGoal"
                        placeholder="Describe your primary objective..."
                        autoresize
                        size="lg"
                        class="bg-black/50"
                      />
                    </UFormGroup>

                    <UFormGroup label="Commitment Level (1-10)" name="commitment">
                      <div class="mt-4 px-2">
                        <URange v-model="form.commitment" :min="1" :max="10" color="cyan" />
                        <div class="flex justify-between text-xs text-slate-500 mt-2">
                          <span>Casual</span>
                          <span>Dedicated</span>
                        </div>
                      </div>
                    </UFormGroup>
                  </div>
                </div>
              </section>

              <div class="pt-8">
                <UButton
                  type="submit"
                  size="xl"
                  class="w-full justify-center text-slate-950 font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all hover:scale-[1.02] bg-cyan-500 hover:bg-cyan-400"
                  :loading="loading"
                >
                  Submit UNLOCK Application
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

  useSeoMeta({ title: 'Apply for Unlock - Journey Endurance' })

  const tabs = [
    {
      id: 'personal',
      label: 'Personal Info',
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
    commitment: 7
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
<style scoped>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
</style>
