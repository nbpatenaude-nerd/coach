<template>
  <div class="min-h-screen bg-slate-950 pt-32 pb-24 px-6 lg:px-8">
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

      <div class="flex flex-col md:flex-row gap-12 relative items-start">
        <!-- Left Sidebar (Sticky) -->
        <div class="md:w-1/3 sticky top-32">
          <div
            class="bg-[rgba(15,20,30,0.6)] backdrop-blur-2xl rounded-2xl p-8 border border-slate-800 shadow-xl relative overflow-hidden"
          >
            <div
              class="absolute inset-0 pointer-events-none opacity-20"
              style="
                background: radial-gradient(
                  circle at top right,
                  rgba(34, 211, 238, 0.3),
                  transparent 60%
                );
              "
            ></div>

            <h2 class="text-xl font-bold text-white mb-8 tracking-wider uppercase">
              Application Progress
            </h2>
            <ul class="space-y-6 relative z-10">
              <li
                class="flex items-center gap-4 cursor-pointer transition-colors"
                :class="
                  activeSection === 'personal'
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                "
                @click="scrollTo('personal')"
              >
                <div
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="activeSection === 'personal' ? 'bg-cyan-400' : 'bg-slate-700'"
                ></div>
                Personal Info
              </li>
              <li
                class="flex items-center gap-4 cursor-pointer transition-colors"
                :class="
                  activeSection === 'sport'
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                "
                @click="scrollTo('sport')"
              >
                <div
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="activeSection === 'sport' ? 'bg-cyan-400' : 'bg-slate-700'"
                ></div>
                Sport
              </li>
              <li
                class="flex items-center gap-4 cursor-pointer transition-colors"
                :class="
                  activeSection === 'experience'
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                "
                @click="scrollTo('experience')"
              >
                <div
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="activeSection === 'experience' ? 'bg-cyan-400' : 'bg-slate-700'"
                ></div>
                Experience
              </li>
              <li
                class="flex items-center gap-4 cursor-pointer transition-colors"
                :class="
                  activeSection === 'goals'
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                "
                @click="scrollTo('goals')"
              >
                <div
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="activeSection === 'goals' ? 'bg-cyan-400' : 'bg-slate-700'"
                ></div>
                Goals
              </li>
            </ul>
          </div>
        </div>

        <!-- Right Content (Scrolling Forms) -->
        <div class="md:w-2/3">
          <form class="space-y-24 pb-16" @submit.prevent="submitForm">
            <!-- Personal Info -->
            <section id="personal" class="scroll-mt-40">
              <div class="mb-8">
                <h3
                  class="font-athletic text-3xl font-bold text-white mb-2 uppercase tracking-wide"
                >
                  Personal Info
                </h3>
                <div class="h-1 w-12 bg-cyan-500 rounded"></div>
              </div>
              <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UFormGroup label="Full Name" name="name" required>
                    <UInput
                      v-model="form.name"
                      placeholder="John Doe"
                      size="lg"
                      class="bg-slate-900/50"
                    />
                  </UFormGroup>
                  <UFormGroup label="Email Address" name="email" required>
                    <UInput
                      v-model="form.email"
                      type="email"
                      placeholder="john@example.com"
                      size="lg"
                      class="bg-slate-900/50"
                    />
                  </UFormGroup>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UFormGroup label="Phone Number" name="phone">
                    <UInput
                      v-model="form.phone"
                      placeholder="+1 (555) 000-0000"
                      size="lg"
                      class="bg-slate-900/50"
                    />
                  </UFormGroup>
                  <UFormGroup label="Location / Country" name="location">
                    <UInput
                      v-model="form.location"
                      placeholder="e.g. Victoria, BC"
                      size="lg"
                      class="bg-slate-900/50"
                    />
                  </UFormGroup>
                </div>
              </div>
            </section>

            <!-- Sport -->
            <section id="sport" class="scroll-mt-40">
              <div class="mb-8">
                <h3
                  class="font-athletic text-3xl font-bold text-white mb-2 uppercase tracking-wide"
                >
                  Sport Profile
                </h3>
                <div class="h-1 w-12 bg-cyan-500 rounded"></div>
              </div>
              <div class="space-y-6">
                <UFormGroup label="Primary Sport" name="primarySport" required>
                  <USelectMenu
                    v-model="form.primarySport"
                    :options="['Triathlon', 'Running', 'Cycling', 'Hyrox', 'Strength', 'Other']"
                    size="lg"
                    class="bg-slate-900/50"
                  />
                </UFormGroup>
                <UFormGroup label="Secondary Sports / Cross-training" name="secondarySports">
                  <UInput
                    v-model="form.secondarySports"
                    placeholder="e.g. Swimming, Weightlifting"
                    size="lg"
                    class="bg-slate-900/50"
                  />
                </UFormGroup>
              </div>
            </section>

            <!-- Experience -->
            <section id="experience" class="scroll-mt-40">
              <div class="mb-8">
                <h3
                  class="font-athletic text-3xl font-bold text-white mb-2 uppercase tracking-wide"
                >
                  Experience
                </h3>
                <div class="h-1 w-12 bg-cyan-500 rounded"></div>
              </div>
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
                      class="bg-slate-900/50"
                    />
                  </UFormGroup>
                  <UFormGroup label="Current Weekly Volume (Hours)" name="volume">
                    <UInput
                      v-model="form.volume"
                      type="number"
                      placeholder="e.g. 8"
                      size="lg"
                      class="bg-slate-900/50"
                    />
                  </UFormGroup>
                </div>

                <UFormGroup label="What do you struggle with most?" name="limiters">
                  <UTextarea
                    v-model="form.limiters"
                    placeholder="Nutrition, consistency, injuries, etc."
                    autoresize
                    size="lg"
                    class="bg-slate-900/50"
                  />
                </UFormGroup>
              </div>
            </section>

            <!-- Goals -->
            <section id="goals" class="scroll-mt-40">
              <div class="mb-8">
                <h3
                  class="font-athletic text-3xl font-bold text-white mb-2 uppercase tracking-wide"
                >
                  Goals
                </h3>
                <div class="h-1 w-12 bg-cyan-500 rounded"></div>
              </div>
              <div class="space-y-8">
                <UFormGroup label="A-Race / Main Goal for the Season" name="mainGoal" required>
                  <UTextarea
                    v-model="form.mainGoal"
                    placeholder="Describe your primary objective..."
                    autoresize
                    size="lg"
                    class="bg-slate-900/50"
                  />
                </UFormGroup>

                <UFormGroup label="Commitment Level (1-10)" name="commitment">
                  <div class="mt-4 px-2">
                    <URange v-model="form.commitment" :min="1" :max="10" />
                    <div class="flex justify-between text-xs text-slate-500 mt-2">
                      <span>Casual</span>
                      <span>Dedicated</span>
                    </div>
                  </div>
                </UFormGroup>
              </div>
            </section>

            <div class="pt-8 border-t border-slate-800">
              <UButton
                type="submit"
                size="xl"
                color="primary"
                class="w-full justify-center text-slate-950 font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all hover:scale-[1.02]"
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
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'

  definePageMeta({
    layout: 'home',
    auth: false
  })

  useSeoMeta({ title: 'Apply for Unlock - Journey Endurance' })

  const activeSection = ref('personal')
  const loading = ref(false)
  const toast = useToast()

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
      { rootMargin: '-20% 0px -75% 0px' }
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
