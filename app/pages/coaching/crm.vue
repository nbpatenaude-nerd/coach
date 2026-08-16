<template>
  <div class="flex h-[calc(100vh-4rem)] bg-background">
    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header Area -->
      <div
        class="px-8 py-6 border-b border-border shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            CRM
            <span class="text-muted-foreground text-lg font-normal ml-2"
              >{{ athletes?.length || 0 }} Athletes</span
            >
          </h1>
          <div v-if="pipelines?.length" class="mt-2">
            <select
              v-model="activePipelineId"
              class="bg-background border border-border rounded-md px-2 py-1 text-sm text-foreground focus:ring-primary focus:border-primary"
            >
              <option v-for="p in pipelines" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Toggle -->
          <div class="flex items-center p-1 bg-muted/50 rounded-lg border border-border/50">
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2"
              :class="
                viewMode === 'kanban'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="viewMode = 'kanban'"
            >
              <Icon name="lucide:kanban" class="w-4 h-4" /> Kanban
            </button>
            <button
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2"
              :class="
                viewMode === 'table'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="viewMode = 'table'"
            >
              <Icon name="lucide:table-2" class="w-4 h-4" /> Table
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="pendingAthletes || pendingPipelines"
        class="flex-1 flex items-center justify-center text-muted-foreground"
      >
        <div class="flex flex-col items-center gap-2">
          <Icon name="lucide:loader-2" class="w-6 h-6 animate-spin" />
          <p>Loading CRM...</p>
        </div>
      </div>

      <div v-else-if="error" class="flex-1 p-8 text-center text-destructive">
        <p>Error loading athletes: {{ error?.message || 'Unknown error' }}</p>
      </div>
      <div v-else-if="!activePipeline" class="flex-1 p-8 text-center text-muted-foreground">
        <p>No active pipelines found.</p>
      </div>

      <!-- Kanban View -->
      <div
        v-else-if="viewMode === 'kanban'"
        class="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-6 bg-muted/10"
      >
        <div
          v-for="stage in activePipeline.stages"
          :key="stage.id"
          class="flex flex-col min-w-[320px] max-w-[320px] bg-muted/20 rounded-xl border border-border/50 overflow-hidden"
          @dragover.prevent
          @dragenter.prevent
          @drop="onDrop($event, stage.id)"
        >
          <div
            class="px-4 py-3 border-b border-border/50 bg-background/50 flex items-center justify-between shrink-0"
          >
            <h3
              class="font-semibold text-sm text-foreground flex items-center gap-2 uppercase tracking-wide"
            >
              {{ stage.name }}
              <span
                class="text-muted-foreground font-normal bg-muted px-2 py-0.5 rounded-full text-xs"
              >
                {{ athletesByStage[stage.id]?.length || 0 }}
              </span>
            </h3>
          </div>

          <div class="flex-1 overflow-y-auto p-3 space-y-3">
            <div
              v-for="athlete in athletesByStage[stage.id]"
              :key="athlete.id"
              draggable="true"
              class="bg-background border border-border rounded-lg p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col gap-3"
              @dragstart="onDragStart($event, athlete)"
              @click="selectedAthlete = athlete"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0"
                  >
                    {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-sm text-foreground truncate">
                      {{ athlete.name || 'Unnamed Athlete' }}
                    </p>
                    <p class="text-xs text-muted-foreground truncate">{{ athlete.email }}</p>
                  </div>
                </div>
              </div>

              <div class="flex flex-wrap gap-1 mt-1">
                <span
                  v-if="athlete.churnRisk === 'HIGH'"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-500 border border-red-500/20"
                >
                  High Churn Risk
                </span>
                <span
                  v-for="tag in (athlete.crmTags || []).slice(0, 3)"
                  :key="tag"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border"
                >
                  #{{ tag }}
                </span>
                <span
                  v-if="(athlete.crmTags || []).length > 3"
                  class="text-[10px] text-muted-foreground"
                  >+{{ athlete.crmTags.length - 3 }}</span
                >
                <span
                  v-if="!athlete.crmTags || athlete.crmTags.length === 0"
                  class="text-[10px] text-muted-foreground italic"
                  >No tags</span
                >
              </div>
            </div>

            <div
              v-if="!athletesByStage[stage.id]?.length"
              class="h-24 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center text-muted-foreground text-sm opacity-50"
            >
              Drop here
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else-if="activePipeline" class="flex-1 overflow-auto p-6">
        <div class="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
          <table class="w-full text-sm text-left whitespace-nowrap">
            <thead
              class="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border"
            >
              <tr>
                <th class="px-6 py-3.5 font-medium tracking-wider">Athlete</th>
                <th class="px-6 py-3.5 font-medium tracking-wider">Stage</th>
                <th class="px-6 py-3.5 font-medium tracking-wider">Lead Source</th>
                <th class="px-6 py-3.5 font-medium tracking-wider">Tags</th>
                <th class="px-6 py-3.5 font-medium tracking-wider text-right">Last Login</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr
                v-for="athlete in athletes"
                :key="athlete.id"
                class="hover:bg-muted/30 transition-colors cursor-pointer group"
                @click="selectedAthlete = athlete"
              >
                <td class="px-6 py-3">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner text-xs shrink-0"
                    >
                      {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
                    </div>
                    <div class="flex flex-col">
                      <span
                        class="font-medium text-foreground group-hover:text-primary transition-colors"
                        >{{ athlete.name || 'Unnamed Athlete' }}</span
                      >
                      <span class="text-xs text-muted-foreground">{{ athlete.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-3">
                  <span
                    class="inline-flex items-center rounded bg-muted px-2 py-1 text-xs font-medium text-foreground border border-border"
                  >
                    {{ getAthleteStageName(athlete) }}
                  </span>
                </td>
                <td class="px-6 py-3">
                  <span class="text-muted-foreground text-xs">{{ athlete.leadSource || '-' }}</span>
                </td>
                <td class="px-6 py-3">
                  <div class="flex flex-wrap gap-1 max-w-50">
                    <span
                      v-for="tag in (athlete.crmTags || []).slice(0, 2)"
                      :key="tag"
                      class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border"
                    >
                      #{{ tag }}
                    </span>
                    <span
                      v-if="(athlete.crmTags || []).length > 2"
                      class="text-[10px] text-muted-foreground"
                      >+{{ athlete.crmTags.length - 2 }}</span
                    >
                    <span
                      v-if="!athlete.crmTags || athlete.crmTags.length === 0"
                      class="text-[10px] text-muted-foreground italic"
                      >None</span
                    >
                  </div>
                </td>
                <td class="px-6 py-3 text-right text-muted-foreground text-xs">
                  {{
                    athlete.lastLoginAt
                      ? new Date(athlete.lastLoginAt).toLocaleDateString()
                      : 'Never'
                  }}
                </td>
              </tr>
              <tr v-if="(athletes?.length || 0) === 0">
                <td colspan="5" class="px-6 py-12 text-center text-muted-foreground">
                  No athletes found.
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
      :pipeline="activePipeline"
      @close="selectedAthlete = null"
      @refresh="refreshAthletes"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue'

  type CrmPipelineStage = {
    id: string
    name: string
    order: number
    color: string | null
  }

  type CrmPipeline = {
    id: string
    name: string
    stages: CrmPipelineStage[]
  }

  type CrmDeal = {
    id: string
    pipelineId: string
    stageId: string
    stage: CrmPipelineStage
  }

  type CrmAthlete = {
    id: string
    name: string | null
    email: string
    crmDeals: CrmDeal[]
    crmTags: string[]
    leadSource: string | null
    churnRisk: string | null
    lifetimeValue: number | null
    lastLoginAt: string | null
  }

  const { data: pipelines, pending: pendingPipelines } = await useFetch<CrmPipeline[]>(
    '/api/coaching/crm/pipelines',
    {
      default: () => []
    }
  )

  const activePipelineId = ref<string | null>(null)

  watch(
    () => pipelines.value,
    (newPipelines) => {
      if (newPipelines && newPipelines.length > 0 && !activePipelineId.value) {
        activePipelineId.value = newPipelines[0].id
      }
    },
    { immediate: true }
  )

  const activePipeline = computed(() => {
    if (!pipelines.value || !activePipelineId.value) return null
    return pipelines.value.find((p) => p.id === activePipelineId.value) || pipelines.value[0]
  })

  const {
    data: athletes,
    pending: pendingAthletes,
    error,
    refresh: refreshAthletes
  } = await useFetch<CrmAthlete[]>(
    () => `/api/coaching/crm/athletes?pipelineId=${activePipelineId.value || ''}`,
    {
      default: () => []
    }
  )

  const selectedAthlete = ref<CrmAthlete | null>(null)

  definePageMeta({
    middleware: ['auth', 'coach'] as any
  })

  const viewMode = ref<'kanban' | 'table'>('kanban')

  const athletesByStage = computed<Record<string, CrmAthlete[]>>(() => {
    const grouped: Record<string, CrmAthlete[]> = {}

    if (activePipeline.value) {
      activePipeline.value.stages.forEach((s) => {
        grouped[s.id] = []
      })
    }

    if (athletes.value && activePipeline.value) {
      athletes.value.forEach((a: CrmAthlete) => {
        const deal = a.crmDeals.find((d) => d.pipelineId === activePipeline.value!.id)
        if (deal && grouped[deal.stageId]) {
          grouped[deal.stageId].push(a)
        } else if (activePipeline.value!.stages.length > 0) {
          grouped[activePipeline.value!.stages[0].id].push(a)
        }
      })
    }
    return grouped
  })

  const getAthleteStageName = (athlete: CrmAthlete) => {
    if (!activePipeline.value) return 'Unknown'
    const deal = athlete.crmDeals.find((d) => d.pipelineId === activePipeline.value!.id)
    if (deal) return deal.stage.name
    return activePipeline.value.stages[0]?.name || 'Unknown'
  }

  const isUpdating = ref(false)

  const onDragStart = (e: DragEvent, athlete: CrmAthlete) => {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', athlete.id)
      e.dataTransfer.effectAllowed = 'move'
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = '0.5'
        setTimeout(() => {
          if (e.target instanceof HTMLElement) e.target.style.opacity = '1'
        }, 0)
      }
    }
  }

  const onDrop = async (e: DragEvent, stageId: string) => {
    const athleteId = e.dataTransfer?.getData('text/plain')
    if (!athleteId || !activePipeline.value) return

    const athlete = athletes.value.find((a: CrmAthlete) => a.id === athleteId)
    if (!athlete) return

    const deal = athlete.crmDeals.find((d) => d.pipelineId === activePipeline.value!.id)
    if (deal && deal.stageId === stageId) return

    const oldDeals = [...athlete.crmDeals]
    if (deal) {
      deal.stageId = stageId
      deal.stage = activePipeline.value.stages.find((s) => s.id === stageId)!
    } else {
      athlete.crmDeals.push({
        id: 'temp',
        pipelineId: activePipeline.value.id,
        stageId: stageId,
        stage: activePipeline.value.stages.find((s) => s.id === stageId)!
      })
    }

    isUpdating.value = true
    try {
      await $fetch('/api/coaching/crm/update-athlete', {
        method: 'PATCH',
        body: { athleteId, pipelineId: activePipeline.value.id, stageId: stageId }
      })
      await refreshAthletes()
    } catch (err) {
      athlete.crmDeals = oldDeals
      console.error('Failed to update stage:', err)
    } finally {
      isUpdating.value = false
    }
  }
</script>
