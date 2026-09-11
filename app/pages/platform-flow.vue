<script setup lang="ts">
  // Platform Flow / SOP for New Athletes
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-200">
    <!-- Header -->
    <div class="pt-24 pb-12 text-center px-4 max-w-4xl mx-auto">
      <h1
        class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-6"
      >
        Platform Flow: How to Use Journey Endurance
      </h1>
      <p class="text-lg text-slate-400">
        Welcome to your endurance coaching platform! Follow this Standard Operating Procedure (SOP)
        to get the most out of your training and our AI coaching tools.
      </p>
    </div>

    <!-- Steps -->
    <div class="max-w-3xl mx-auto px-4 pb-24 space-y-12">
      <!-- Step 1 -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
        <div
          class="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"
        ></div>
        <div class="flex items-center gap-4 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg border border-cyan-500/30"
          >
            1
          </div>
          <h2 class="text-2xl font-bold text-white">Connect Your Devices</h2>
        </div>
        <p class="text-slate-400 leading-relaxed mb-4">
          The platform works best when we have your training data. Connect your wearable devices to
          start syncing telemetry.
        </p>
        <ul class="list-disc list-inside text-slate-300 space-y-2 ml-4">
          <li>Navigate to your <strong>Profile Settings > Integrations</strong>.</li>
          <li>
            Connect <strong>Intervals.icu</strong> to sync your Garmin, Wahoo, or Strava data.
          </li>
          <li>Ensure your metrics (Heart Rate, Power, Pace) are correctly mapped.</li>
        </ul>
      </div>

      <!-- Step 2 -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
        <div class="flex items-center gap-4 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-lg border border-pink-500/30"
          >
            2
          </div>
          <h2 class="text-2xl font-bold text-white">The Daily Check-In</h2>
        </div>
        <p class="text-slate-400 leading-relaxed mb-4">
          Every morning, your first step is to tell the AI how you are feeling. This informs your
          workout modifications and recovery protocols.
        </p>
        <ul class="list-disc list-inside text-slate-300 space-y-2 ml-4">
          <li>Log in and complete your <strong>Daily Check-In</strong>.</li>
          <li>Report your sleep quality, muscle soreness, and overall readiness.</li>
          <li>
            Our AI will instantly evaluate your recovery and suggest modifications if you are
            under-recovered.
          </li>
        </ul>
      </div>

      <!-- Step 3 -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
        <div
          class="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full translate-x-1/2 translate-y-1/2"
        ></div>
        <div class="flex items-center gap-4 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg border border-purple-500/30"
          >
            3
          </div>
          <h2 class="text-2xl font-bold text-white">Execute Your Workouts</h2>
        </div>
        <p class="text-slate-400 leading-relaxed mb-4">
          Your training plan is dynamically synced to your calendar.
        </p>
        <ul class="list-disc list-inside text-slate-300 space-y-2 ml-4">
          <li>View your prescribed workout for the day on your dashboard.</li>
          <li>
            Execute the workout on your preferred device (it automatically pushes to your head unit
            or watch).
          </li>
          <li>
            Post-workout, data syncs back to Journey Endurance for analysis against your planned
            targets.
          </li>
        </ul>
      </div>

      <!-- Step 4 -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
        <div class="flex items-center gap-4 mb-4">
          <div
            class="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30"
          >
            4
          </div>
          <h2 class="text-2xl font-bold text-white">Weekly Review</h2>
        </div>
        <p class="text-slate-400 leading-relaxed mb-4">
          At the end of each week, the platform generates a comprehensive review of your progress.
        </p>
        <ul class="list-disc list-inside text-slate-300 space-y-2 ml-4">
          <li>
            Complete your <strong>Weekly Check-In</strong> to reflect on your physical and mental
            state.
          </li>
          <li>
            The AI reviews your week's compliance and adjusts your upcoming training block
            automatically.
          </li>
        </ul>
      </div>

      <!-- CTA -->
      <div class="text-center pt-8">
        <UButton
          to="/auth/register"
          size="xl"
          class="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 shadow-[0_0_15px_rgba(34,211,238,0.4)]"
        >
          Get Started Now
        </UButton>
      </div>
    </div>
  </div>
</template>
