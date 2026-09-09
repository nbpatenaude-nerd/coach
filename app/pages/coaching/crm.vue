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
          <div v-if="pipelines?.length" class="mt-2 flex gap-4 items-center">
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
                viewMode === 'dashboard'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
              @click="viewMode = 'dashboard'"
            >
              <Icon name="lucide:layout-dashboard" class="w-4 h-4" /> Dashboard
            </button>
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
              <Icon name="lucide:table-2" class="w-4 h-4" /> List
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

      <!-- Dashboard View -->
      <div v-else-if="viewMode === 'dashboard'" class="flex-1 overflow-auto p-6 bg-muted/20">
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column (Wider) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- SuiteCRM style Activity Stream -->
            <div
              class="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col"
            >
              <div
                class="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between"
              >
                <h3 class="font-semibold text-foreground flex items-center gap-2">
                  <Icon name="lucide:activity" class="w-4 h-4" /> My Activity Stream
                </h3>
                <button
                  class="p-1 hover:bg-muted rounded text-muted-foreground"
                  @click="refreshActivities"
                >
                  <Icon name="lucide:refresh-cw" class="w-4 h-4" />
                </button>
              </div>
              <div class="p-0 flex-1 max-h-[400px] overflow-y-auto">
                <div v-if="!activities?.length" class="p-8 text-center text-muted-foreground">
                  No recent activity.
                </div>
                <div v-else class="divide-y divide-border">
                  <div
                    v-for="act in activities"
                    :key="act.id"
                    class="p-4 hover:bg-muted/20 transition-colors flex gap-3"
                  >
                    <div
                      class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                    >
                      <span class="text-primary font-bold text-xs">{{
                        act.user?.name ? act.user.name.charAt(0) : 'U'
                      }}</span>
                    </div>
                    <div>
                      <p class="text-sm">
                        <span class="font-semibold text-foreground">{{
                          act.user?.name || 'System'
                        }}</span>
                        <span class="text-muted-foreground ml-1">
                          {{
                            act.action === 'DEAL_MOVED'
                              ? 'moved a deal'
                              : act.action === 'NOTE_ADDED'
                                ? 'added a note'
                                : act.action === 'WORKOUT_COMPLETED'
                                  ? 'completed a workout'
                                  : act.action === 'DEAL_WON'
                                    ? 'closed a deal'
                                    : act.action === 'CHECK_IN_SUBMITTED'
                                      ? 'submitted a check-in'
                                      : act.action
                          }}
                        </span>
                      </p>
                      <p
                        v-if="act.metadata"
                        class="text-xs text-muted-foreground mt-1 bg-muted/50 p-2 rounded border border-border inline-block"
                      >
                        {{ Object.values(act.metadata).join(' · ') }}
                      </p>
                      <p class="text-[10px] text-muted-foreground mt-1">
                        {{ new Date(act.createdAt).toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pipeline Distribution Chart -->
            <div class="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
              <h3 class="text-base font-semibold text-foreground mb-4">Pipeline Distribution</h3>
              <div class="flex-1 min-h-[300px]">
                <ClientOnly>
                  <Bar :data="funnelChartData" :options="funnelChartOptions" />
                </ClientOnly>
              </div>
            </div>
          </div>

          <!-- Right Column (Narrower) -->
          <div class="space-y-6">
            <!-- SuiteCRM style Tasks/Calls -->
            <div
              class="bg-card border border-border rounded-xl overflow-hidden shadow-sm flex flex-col"
            >
              <div
                class="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between"
              >
                <h3 class="font-semibold text-foreground flex items-center gap-2">
                  <Icon name="lucide:phone-call" class="w-4 h-4" /> My Calls & Tasks
                </h3>
                <div class="flex gap-1">
                  <button class="p-1 hover:bg-muted rounded text-muted-foreground">
                    <Icon name="lucide:plus" class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1 hover:bg-muted rounded text-muted-foreground"
                    @click="refreshTasks"
                  >
                    <Icon name="lucide:refresh-cw" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="p-0 flex-1 max-h-[400px] overflow-y-auto">
                <div v-if="!tasks?.length" class="p-8 text-center text-muted-foreground">
                  No upcoming tasks.
                </div>
                <div v-else class="divide-y divide-border">
                  <div
                    v-for="task in tasks"
                    :key="task.id"
                    class="p-3 hover:bg-muted/20 flex gap-3 items-start"
                    :class="{ 'opacity-50': task.isCompleted }"
                  >
                    <button
                      class="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
                      @click="completeTask(task)"
                    >
                      <Icon
                        :name="task.isCompleted ? 'lucide:check-circle-2' : 'lucide:circle'"
                        class="w-5 h-5"
                        :class="{ 'text-primary': task.isCompleted }"
                      />
                    </button>
                    <div class="min-w-0 flex-1">
                      <p
                        class="text-sm font-medium text-foreground truncate"
                        :class="{ 'line-through': task.isCompleted }"
                      >
                        {{ task.title }}
                      </p>
                      <p v-if="task.deal?.user" class="text-xs text-primary truncate mt-0.5">
                        Related to: {{ task.deal.user.name }}
                      </p>
                      <div class="flex items-center gap-2 mt-1">
                        <span
                          v-if="task.dueDate"
                          class="text-[10px] text-muted-foreground flex items-center gap-1"
                        >
                          <Icon name="lucide:calendar" class="w-3 h-3" />
                          {{ new Date(task.dueDate).toLocaleDateString() }}
                        </span>
                        <span
                          class="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border"
                        >
                          {{ task.isCompleted ? 'Completed' : 'Planned' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- KPI Summary Widget -->
            <div class="bg-card border border-border rounded-xl shadow-sm p-4 space-y-4">
              <h3 class="font-semibold text-foreground border-b border-border pb-2">Overview</h3>
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Total Pipeline Value
                </p>
                <p class="text-2xl font-bold text-foreground">
                  {{ formatCurrency(totalPipelineValue) }}
                </p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Active Athletes
                </p>
                <p class="text-2xl font-bold text-foreground">{{ athletes?.length || 0 }}</p>
              </div>
              <div>
                <p class="text-xs text-red-500 uppercase tracking-wider font-semibold">
                  High Risk Athletes
                </p>
                <p class="text-2xl font-bold text-red-500">{{ highRiskCount }}</p>
              </div>
            </div>

            <!-- Lead Sources -->
            <div class="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col">
              <h3 class="text-base font-semibold text-foreground mb-4">Lead Sources</h3>
              <div class="flex-1 min-h-[200px] flex items-center justify-center">
                <ClientOnly>
                  <Doughnut :data="leadSourceChartData" :options="doughnutChartOptions" />
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kanban View -->
      <div
        v-else-if="viewMode === 'kanban'"
        class="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-6 bg-muted/20"
      >
        <div
          v-for="stage in activePipeline?.stages || []"
          :key="stage.id"
          class="flex flex-col w-[320px] min-w-[320px] max-w-[320px] shrink-0 bg-transparent overflow-hidden"
          @dragover.prevent
          @dragenter.prevent
          @drop="onDrop($event, stage.id)"
        >
          <div
            class="px-2 py-3 flex items-center justify-between shrink-0 border-b-2"
            :style="{ borderColor: stage.color || '#3b82f6' }"
          >
            <h3
              class="font-semibold text-sm text-foreground flex items-center gap-2 uppercase tracking-wider"
            >
              {{ stage.name }}
              <span
                class="text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-full text-xs leading-none"
              >
                {{ athletesByStage[stage.id]?.length || 0 }}
              </span>
            </h3>
            <span class="text-xs font-medium text-muted-foreground">{{
              formatCurrency(getStageValue(stage.id))
            }}</span>
          </div>

          <div
            class="flex-1 overflow-y-auto p-1 py-3 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 transition-colors"
          >
            <div
              v-for="athlete in athletesByStage[stage.id]"
              :key="athlete.id"
              draggable="true"
              class="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group flex flex-col gap-3 relative"
              @dragstart="onDragStart($event, athlete)"
              @click="selectedAthlete = athlete"
            >
              <div
                class="absolute top-0 left-0 w-1 h-full rounded-l-lg opacity-50 group-hover:opacity-100 transition-opacity"
                :style="{ backgroundColor: stage.color || '#3b82f6' }"
              ></div>

              <div class="flex items-start justify-between gap-2 pl-1">
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0"
                  >
                    {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="font-semibold text-sm leading-tight text-foreground truncate group-hover:text-primary transition-colors"
                    >
                      {{ athlete.name || 'Unnamed Athlete' }}
                    </p>
                    <p class="text-xs text-muted-foreground truncate mt-0.5">{{ athlete.email }}</p>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between pl-1">
                <span
                  class="text-xs font-medium"
                  :class="athlete.lifetimeValue ? 'text-emerald-500' : 'text-muted-foreground'"
                >
                  {{ formatCurrency(athlete.lifetimeValue || 0) }}
                </span>
                <span
                  v-if="athlete.lastLoginAt"
                  class="text-[10px] text-muted-foreground flex items-center gap-1"
                >
                  <Icon name="lucide:clock" class="w-3 h-3" />
                  {{ new Date(athlete.lastLoginAt).toLocaleDateString() }}
                </span>
              </div>

              <div class="flex flex-wrap gap-1 mt-1 pl-1">
                <span
                  v-if="athlete.churnRisk === 'HIGH'"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-500 border border-red-500/20"
                >
                  HIGH RISK
                </span>
                <span
                  v-for="tag in (athlete.crmTags || []).slice(0, 3)"
                  :key="tag"
                  class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="(athlete.crmTags || []).length > 3"
                  class="text-[10px] text-muted-foreground"
                  >+{{ athlete.crmTags.length - 3 }}</span
                >
              </div>
            </div>

            <div
              v-if="!athletesByStage[stage.id]?.length"
              class="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-xs font-medium"
            >
              Drag & Drop Here
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else-if="activePipeline" class="flex-1 overflow-auto p-6 bg-muted/20">
        <div class="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <table class="w-full text-sm text-left whitespace-nowrap">
            <thead
              class="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border"
            >
              <tr>
                <th class="px-6 py-4 font-semibold tracking-wider">Athlete</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Stage</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Value</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Lead Source</th>
                <th class="px-6 py-4 font-semibold tracking-wider">Tags</th>
                <th class="px-6 py-4 font-semibold tracking-wider text-right">Last Login</th>
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
                      class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner text-sm shrink-0"
                    >
                      {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
                    </div>
                    <div class="flex flex-col">
                      <span
                        class="font-semibold text-foreground group-hover:text-primary transition-colors"
                        >{{ athlete.name || 'Unnamed Athlete' }}</span
                      >
                      <span class="text-xs text-muted-foreground mt-0.5">{{ athlete.email }}</span>
                    </div>
                    <div
                      v-if="athlete.churnRisk === 'HIGH'"
                      class="ml-2 w-2 h-2 rounded-full bg-red-500"
                      title="High Churn Risk"
                    ></div>
                  </div>
                </td>
                <td class="px-6 py-3">
                  <span
                    class="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-foreground border border-border"
                  >
                    {{ getAthleteStageName(athlete) }}
                  </span>
                </td>
                <td class="px-6 py-3">
                  <span
                    class="font-medium"
                    :class="athlete.lifetimeValue ? 'text-emerald-500' : 'text-muted-foreground'"
                  >
                    {{ formatCurrency(athlete.lifetimeValue || 0) }}
                  </span>
                </td>
                <td class="px-6 py-3">
                  <span class="text-muted-foreground text-xs font-medium">{{
                    athlete.leadSource || '-'
                  }}</span>
                </td>
                <td class="px-6 py-3">
                  <div class="flex flex-wrap gap-1 max-w-50">
                    <span
                      v-for="tag in (athlete.crmTags || []).slice(0, 2)"
                      :key="tag"
                      class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border"
                    >
                      {{ tag }}
                    </span>
                    <span
                      v-if="(athlete.crmTags || []).length > 2"
                      class="text-[10px] text-muted-foreground font-medium"
                      >+{{ athlete.crmTags.length - 2 }}</span
                    >
                  </div>
                </td>
                <td class="px-6 py-3 text-right text-muted-foreground text-xs font-medium">
                  {{
                    athlete.lastLoginAt
                      ? new Date(athlete.lastLoginAt).toLocaleDateString()
                      : 'Never'
                  }}
                </td>
              </tr>
              <tr v-if="(athletes?.length || 0) === 0">
                <td colspan="6" class="px-6 py-12 text-center text-muted-foreground">
                  No athletes found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Slide-over panel for athlete profile -->
    <CoachingCrmAthleteProfileDrawer
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
  import { Bar, Doughnut } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    ArcElement
  } from 'chart.js'

  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

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

  const { data: tasks, refresh: refreshTasks } = await useFetch<any[]>('/api/coaching/crm/tasks')
  const { data: activities, refresh: refreshActivities } = await useFetch<any[]>(
    '/api/coaching/crm/activity'
  )

  const completeTask = async (task: any) => {
    task.isCompleted = true
    await $fetch('/api/coaching/crm/tasks', {
      method: 'PATCH',
      body: { id: task.id, isCompleted: true }
    })
    refreshTasks()
  }

  const activePipelineId = ref<string | null>(null)

  watch(
    () => pipelines.value,
    (newPipelines) => {
      if (newPipelines && newPipelines.length > 0 && !activePipelineId.value) {
        activePipelineId.value = newPipelines[0]?.id || null
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

  const viewMode = ref<'dashboard' | 'kanban' | 'table'>('dashboard')

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val)
  }

  const athletesByStage = computed<Record<string, CrmAthlete[]>>(() => {
    const grouped: Record<string, CrmAthlete[]> = {}

    if (activePipeline.value) {
      activePipeline.value.stages.forEach((s) => {
        grouped[s.id] = []
      })
    }

    if (athletes.value && activePipeline.value) {
      athletes.value.forEach((a: CrmAthlete) => {
        const pipeline = activePipeline.value
        if (!pipeline) return

        const deal = a.crmDeals.find((d) => d.pipelineId === pipeline.id)
        if (deal && grouped[deal.stageId]) {
          grouped[deal.stageId].push(a)
        } else if (pipeline.stages && pipeline.stages.length > 0) {
          const defaultStageId = pipeline.stages[0].id
          if (grouped[defaultStageId]) {
            grouped[defaultStageId].push(a)
          }
        }
      })
    }
    return grouped
  })

  const getStageValue = (stageId: string) => {
    const group = athletesByStage.value[stageId]
    if (!group) return 0
    return group.reduce((sum, a) => sum + (a.lifetimeValue || 0), 0)
  }

  const totalPipelineValue = computed(() => {
    if (!athletes.value) return 0
    return athletes.value.reduce((sum, a) => sum + (a.lifetimeValue || 0), 0)
  })

  const highRiskCount = computed(() => {
    if (!athletes.value) return 0
    return athletes.value.filter((a) => a.churnRisk === 'HIGH').length
  })

  // Chart Data Computations
  const funnelChartData = computed(() => {
    const pipeline = activePipeline.value
    if (!pipeline) return { labels: [], datasets: [] }
    const labels = pipeline.stages.map((s) => s.name)
    const data = pipeline.stages.map((s) => getStageValue(s.id))
    const colors = pipeline.stages.map((s) => s.color || '#3b82f6')
    return {
      labels,
      datasets: [
        {
          label: 'Stage Value ($)',
          data,
          backgroundColor: colors,
          borderRadius: 6
        }
      ]
    }
  })

  const funnelChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }

  const leadSourceChartData = computed(() => {
    if (!athletes.value) return { labels: [], datasets: [] }

    const sources: Record<string, number> = {}
    athletes.value.forEach((a) => {
      const source = a.leadSource || 'Unknown'
      sources[source] = (sources[source] || 0) + 1
    })

    const bgColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']

    return {
      labels: Object.keys(sources),
      datasets: [
        {
          data: Object.values(sources),
          backgroundColor: bgColors.slice(0, Object.keys(sources).length),
          borderWidth: 0
        }
      ]
    }
  })

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: { position: 'right' as const }
    }
  }

  const getAthleteStageName = (athlete: CrmAthlete) => {
    const pipeline = activePipeline.value
    if (!pipeline) return 'Unknown'
    const deal = athlete.crmDeals.find((d) => d.pipelineId === pipeline.id)
    if (deal) return deal.stage.name
    return pipeline.stages[0]?.name || 'Unknown'
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
    const pipeline = activePipeline.value
    if (!athleteId || !pipeline) return

    const athlete = athletes.value?.find((a: CrmAthlete) => a.id === athleteId)
    if (!athlete) return

    const deal = athlete.crmDeals.find((d) => d.pipelineId === pipeline.id)
    if (deal && deal.stageId === stageId) return

    const oldDeals = [...athlete.crmDeals]
    if (deal) {
      deal.stageId = stageId
      deal.stage = pipeline.stages.find((s) => s.id === stageId)!
    } else {
      athlete.crmDeals.push({
        id: 'temp',
        pipelineId: pipeline.id,
        stageId: stageId,
        stage: pipeline.stages.find((s) => s.id === stageId)!
      })
    }

    isUpdating.value = true
    try {
      await $fetch('/api/coaching/crm/update-athlete', {
        method: 'PATCH',
        body: { athleteId, pipelineId: pipeline.id, stageId: stageId }
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
