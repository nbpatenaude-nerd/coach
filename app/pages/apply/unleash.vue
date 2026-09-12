<template>
  <div class="min-h-screen bg-slate-950 pt-32 pb-24 px-6 lg:px-8">
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
                  rgba(168, 85, 247, 0.3),
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
                    ? 'text-purple-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                "
                @click="scrollTo('personal')"
              >
                <div
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="activeSection === 'personal' ? 'bg-purple-400' : 'bg-slate-700'"
                ></div>
                Personal Info
              </li>
              <li
                class="flex items-center gap-4 cursor-pointer transition-colors"
                :class="
                  activeSection === 'sport'
                    ? 'text-purple-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                "
                @click="scrollTo('sport')"
              >
                <div
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="activeSection === 'sport' ? 'bg-purple-400' : 'bg-slate-700'"
                ></div>
                Sport & Results
              </li>
              <li
                class="flex items-center gap-4 cursor-pointer transition-colors"
                :class="
                  activeSection === 'experience'
                    ? 'text-purple-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                "
                @click="scrollTo('experience')"
              >
                <div
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="activeSection === 'experience' ? 'bg-purple-400' : 'bg-slate-700'"
                ></div>
                Identity & Strategy
              </li>
              <li
                class="flex items-center gap-4 cursor-pointer transition-colors"
                :class="
                  activeSection === 'goals'
                    ? 'text-purple-400 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                "
                @click="scrollTo('goals')"
              >
                <div
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="activeSection === 'goals' ? 'bg-purple-400' : 'bg-slate-700'"
                ></div>
                Telemetry & Goals
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
                <div class="h-1 w-12 bg-purple-500 rounded"></div>
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

            <!-- Sport & Results -->
            <section id="sport" class="scroll-mt-40">
              <div class="mb-8">
                <h3
                  class="font-athletic text-3xl font-bold text-white mb-2 uppercase tracking-wide"
                >
                  Sport & Results
                </h3>
                <div class="h-1 w-12 bg-purple-500 rounded"></div>
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
                <UFormGroup label="Current PRs / Notable Results" name="prs" required>
                  <UTextarea
                    v-model="form.prs"
                    placeholder="List your most relevant results..."
                    autoresize
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
                  Identity & Strategy
                </h3>
                <div class="h-1 w-12 bg-purple-500 rounded"></div>
              </div>
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
                    class="bg-slate-900/50"
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
                      class="bg-slate-900/50"
                    />
                  </UFormGroup>
                  <UFormGroup label="Describe your current fueling strategy." name="fueling">
                    <UTextarea
                      v-model="form.fueling"
                      placeholder="Pre, intra, and post-training..."
                      autoresize
                      size="lg"
                      class="bg-slate-900/50"
                    />
                  </UFormGroup>
                </div>
              </div>
            </section>

            <!-- Goals -->
            <section id="goals" class="scroll-mt-40">
              <div class="mb-8">
                <h3
                  class="font-athletic text-3xl font-bold text-white mb-2 uppercase tracking-wide"
                >
                  Telemetry & Goals
                </h3>
                <div class="h-1 w-12 bg-purple-500 rounded"></div>
              </div>
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
                    class="bg-slate-900/50"
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
                    class="bg-slate-900/50"
                  />
                </UFormGroup>
              </div>
            </section>

            <div class="pt-8 border-t border-slate-800">
              <UButton
                type="submit"
                size="xl"
                color="primary"
                class="w-full justify-center text-slate-950 font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all hover:scale-[1.02] bg-purple-500 hover:bg-purple-400"
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
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'

  definePageMeta({
    layout: 'home',
    auth: false
  })

  useSeoMeta({ title: 'Apply for Unleash - Journey Endurance' })

  const activeSection = ref('personal')
  const loading = ref(false)
  const toast = useToast()

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
