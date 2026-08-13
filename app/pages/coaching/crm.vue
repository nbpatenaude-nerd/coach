<template>
  <div class="flex h-[calc(100vh-4rem)]">
    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <div class="p-6">
        <h1 class="text-3xl font-bold tracking-tight text-foreground mb-6">CRM</h1>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div class="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 class="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
              Total Athletes
            </h3>
            <div class="flex items-end gap-3">
              <span class="text-4xl font-black text-foreground">{{ athletes.length }}</span>
            </div>
          </div>
          <!-- More metric cards can go here -->
        </div>

        <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div class="p-4 border-b border-border bg-muted/20">
            <h2 class="font-semibold text-lg text-foreground">Athletes List</h2>
          </div>
          <div v-if="pending" class="p-8 text-center text-muted-foreground">
            <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Loading athletes...</p>
          </div>
          <div v-else-if="error" class="p-8 text-center text-destructive">
            <p>Error loading athletes: {{ error.message }}</p>
          </div>
          <table v-else class="w-full text-sm text-left">
            <thead class="text-xs text-muted-foreground uppercase bg-muted/40">
              <tr>
                <th class="px-6 py-4 font-semibold">Athlete</th>
                <th class="px-6 py-4 font-semibold">Stage</th>
                <th class="px-6 py-4 font-semibold">Tags</th>
                <th class="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="athlete in athletes"
                :key="athlete.id"
                class="border-b border-border hover:bg-muted/10 transition-colors cursor-pointer"
                @click="selectedAthlete = athlete"
              >
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner"
                    >
                      {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
                    </div>
                    <div>
                      <div class="font-semibold text-foreground">
                        {{ athlete.name || 'Unnamed Athlete' }}
                      </div>
                      <div class="text-xs text-muted-foreground">{{ athlete.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
                  >
                    {{ athlete.pipelineStage || 'Lead' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="tag in athlete.crmTags || []"
                      :key="tag"
                      class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border"
                    >
                      #{{ tag }}
                    </span>
                    <span
                      v-if="!athlete.crmTags || athlete.crmTags.length === 0"
                      class="text-xs text-muted-foreground italic"
                      >None</span
                    >
                  </div>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    class="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                    @click.stop="selectedAthlete = athlete"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
              <tr v-if="athletes.length === 0">
                <td colspan="4" class="px-6 py-12 text-center text-muted-foreground">
                  <div class="flex flex-col items-center justify-center">
                    <Icon name="lucide:users" class="w-12 h-12 mb-3 text-muted-foreground/50" />
                    <p>No athletes found.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Slide-over panel for athlete profile -->
    <CrmAthleteProfileDrawer
      :is-open="!!selectedAthlete"
      :athlete="selectedAthlete"
      @close="selectedAthlete = null"
      @refresh="refreshAthletes"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const {
    data: athletes,
    pending: pendingAthletes,
    error,
    refresh: refreshAthletes
  } = await useFetch<any[]>('/api/coaching/crm/athletes')
  const selectedAthlete = ref<any | null>(null)

  definePageMeta({
    middleware: ['auth', 'coach'] as any
  })
</script>
