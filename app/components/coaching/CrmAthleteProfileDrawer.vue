<template>
  <div>
    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Drawer -->
    <div
      class="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="isOpen && athlete ? 'translate-x-0' : 'translate-x-full'"
    >
      <div v-if="athlete && pipeline" class="h-full flex flex-col">
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-border bg-muted/30 shrink-0"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold"
            >
              {{ athlete.name ? athlete.name.charAt(0).toUpperCase() : 'U' }}
            </div>
            <div>
              <h2 class="font-bold text-base text-foreground leading-tight flex items-center gap-2">
                {{ athlete.name || 'Unnamed Athlete' }}
              </h2>
              <div class="flex items-center gap-2 mt-1">
                <select
                  v-model="editStageId"
                  class="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border border-primary/20 rounded px-1.5 py-0.5 outline-none cursor-pointer hover:bg-primary/20 transition-colors"
                  @change="updateAthleteStage"
                >
                  <option v-for="stage in pipeline.stages" :key="stage.id" :value="stage.id">
                    {{ stage.name }}
                  </option>
                </select>
                <p class="text-xs text-muted-foreground">{{ athlete.email }}</p>
              </div>
            </div>
          </div>
          <button
            class="p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors"
            @click="$emit('close')"
          >
            <Icon name="lucide:x" class="w-5 h-5" />
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex border-b border-border">
          <button
            class="flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'overview'"
          >
            <Icon name="lucide:user" class="w-4 h-4" /> Overview
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="
              activeTab === 'crm'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'crm'"
          >
            <Icon name="lucide:clipboard" class="w-4 h-4" /> CRM
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="
              activeTab === 'automations'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'automations'"
          >
            <Icon name="lucide:sparkles" class="w-4 h-4" /> AI Drafts
          </button>
          <button
            class="flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'settings'"
          >
            <Icon name="lucide:settings" class="w-4 h-4" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- Overview Tab -->
          <div v-if="activeTab === 'overview'" class="space-y-6">
            <div class="bg-card border border-border rounded-xl p-4 flex flex-col gap-4 shadow-sm">
              <h3 class="font-bold text-foreground">Coach Notes</h3>
              <div class="flex flex-col gap-3">
                <textarea
                  v-model="newNote"
                  placeholder="Add private observation..."
                  rows="3"
                  class="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                ></textarea>
                <div class="flex justify-end gap-2">
                  <button
                    :disabled="isSavingNote || !newNote.trim()"
                    class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    @click="saveNote"
                  >
                    <Icon v-if="isSavingNote" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                    <Icon v-else name="lucide:save" class="w-4 h-4" />
                    Save Note
                  </button>
                </div>
              </div>

              <div class="flex-1 space-y-3 mt-4">
                <div
                  v-if="pendingNotes"
                  class="text-sm text-muted-foreground italic text-center py-6"
                >
                  Loading notes...
                </div>
                <div
                  v-else-if="notes.length === 0"
                  class="text-sm text-muted-foreground italic text-center py-6"
                >
                  No notes yet.
                </div>
                <div
                  v-for="note in notes"
                  v-else
                  :key="note.id"
                  class="p-4 rounded-xl bg-muted/30 border border-border group relative"
                >
                  <p class="text-sm text-foreground whitespace-pre-wrap leading-relaxed pr-6">
                    {{ note.text }}
                  </p>
                  <div class="flex items-center justify-between mt-3">
                    <p
                      class="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1.5"
                    >
                      <Icon name="lucide:clock" class="w-3 h-3" />
                      {{ new Date(note.createdAt).toLocaleString() }}
                    </p>
                    <button
                      class="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete note"
                      @click="deleteNote(note.id)"
                    >
                      <Icon name="lucide:trash-2" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- CRM Tab -->
          <div v-if="activeTab === 'crm'" class="space-y-6">
            <div>
              <label
                class="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider"
                >Google Drive Folder ID</label
              >
              <div class="flex gap-2">
                <input
                  v-model="editDriveFolderId"
                  type="text"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex-1"
                  placeholder="Enter Google Drive Folder ID..."
                />
                <button
                  :disabled="isUpdating"
                  class="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2"
                  @click="updateAthlete({ driveFolderId: editDriveFolderId })"
                >
                  <Icon v-if="isUpdating" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
                  <Icon v-else name="lucide:save" class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- New Tracking Fields -->
            <div>
              <label
                class="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider"
                >Lead Source</label
              >
              <select
                v-model="editLeadSource"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                @change="updateAthlete({ leadSource: editLeadSource })"
              >
                <option :value="null">Unknown</option>
                <option value="Organic">Organic Search</option>
                <option value="Social">Social Media</option>
                <option value="Referral">Referral</option>
                <option value="Ads">Paid Ads</option>
              </select>
            </div>

            <div>
              <label
                class="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider"
                >Churn Risk</label
              >
              <select
                v-model="editChurnRisk"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                @change="updateAthlete({ churnRisk: editChurnRisk })"
              >
                <option :value="null">Normal</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label
                class="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider"
                >Metatags</label
              >
              <div class="flex gap-2 mb-3">
                <input
                  v-model="newTag"
                  type="text"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm flex-1"
                  placeholder="Add a tag..."
                  @keyup.enter="addTag"
                />
                <button
                  :disabled="isUpdating || !newTag.trim()"
                  class="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2 text-sm font-medium"
                  @click="addTag"
                >
                  Add
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in editTags"
                  :key="tag"
                  class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted border border-border text-xs font-medium text-foreground"
                >
                  #{{ tag }}
                  <button
                    type="button"
                    class="text-muted-foreground hover:text-destructive transition-colors ml-1 focus:outline-none"
                    @click="removeTag(tag)"
                  >
                    <Icon name="lucide:x" class="w-3 h-3" />
                  </button>
                </span>
                <span v-if="editTags.length === 0" class="text-xs text-muted-foreground italic"
                  >No tags added yet.</span
                >
              </div>
            </div>
          </div>

          <!-- Automations Tab -->
          <div v-if="activeTab === 'automations'" class="space-y-6">
            <div class="flex items-center justify-between mb-2">
              <h3 class="font-bold text-foreground">AI Email Drafts</h3>
              <button class="text-xs text-primary hover:underline" @click="fetchDrafts">
                Refresh
              </button>
            </div>

            <div v-if="pendingDrafts" class="text-sm text-muted-foreground italic text-center py-6">
              Loading drafts...
            </div>
            <div
              v-else-if="drafts.length === 0"
              class="text-sm text-muted-foreground italic text-center py-6"
            >
              No email drafts available.
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="draft in drafts"
                :key="draft.id"
                class="bg-card border border-border rounded-xl p-4 shadow-sm"
              >
                <div class="flex justify-between items-start mb-2">
                  <span
                    class="text-xs font-bold uppercase px-2 py-0.5 rounded-full"
                    :class="{
                      'bg-amber-500/10 text-amber-500': draft.status === 'PENDING',
                      'bg-green-500/10 text-green-500':
                        draft.status === 'APPROVED' || draft.status === 'SENT',
                      'bg-red-500/10 text-red-500': draft.status === 'REJECTED'
                    }"
                  >
                    {{ draft.status }}
                  </span>
                  <span class="text-xs text-muted-foreground">{{
                    new Date(draft.createdAt).toLocaleDateString()
                  }}</span>
                </div>

                <div v-if="draft.status === 'PENDING'">
                  <div class="mb-3">
                    <label class="block text-xs font-bold text-muted-foreground mb-1"
                      >Subject</label
                    >
                    <input
                      v-model="draft.subject"
                      type="text"
                      class="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div class="mb-3">
                    <label class="block text-xs font-bold text-muted-foreground mb-1">Body</label>
                    <textarea
                      v-model="draft.body"
                      rows="6"
                      class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    ></textarea>
                  </div>

                  <div class="flex gap-2 justify-end mt-4">
                    <button
                      class="bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                      :disabled="isUpdatingDraft === draft.id"
                      @click="updateDraft(draft.id, 'REJECTED')"
                    >
                      Reject
                    </button>
                    <button
                      class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                      :disabled="isUpdatingDraft === draft.id"
                      @click="updateDraft(draft.id, 'APPROVED', draft.subject, draft.body)"
                    >
                      Approve & Send
                    </button>
                  </div>
                </div>
                <div v-else>
                  <p class="font-bold text-sm mb-1">{{ draft.subject }}</p>
                  <p class="text-sm text-muted-foreground whitespace-pre-wrap">{{ draft.body }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="space-y-6">
            <!-- Simplified Settings -->
            <div class="border-t border-dashed border-destructive/30 pt-6">
              <h3 class="text-sm font-bold text-destructive uppercase tracking-wider mb-4">
                Danger Zone
              </h3>

              <div class="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
                <h4 class="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
                  <Icon name="lucide:list" class="w-4 h-4" /> Archive Account
                </h4>
                <p class="text-xs text-muted-foreground mb-3">
                  Move this athlete to an inactive stage.
                </p>
                <button
                  class="bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 rounded-md px-4 py-2 text-sm font-medium transition-colors w-full"
                  @click="archiveAthlete"
                >
                  Archive Athlete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  const props = defineProps<{
    isOpen: boolean
    athlete: any | null
    pipeline: any | null
  }>()

  const emit = defineEmits(['close', 'refresh'])

  const activeTab = ref('overview')
  const newNote = ref('')
  const isSavingNote = ref(false)
  const notes = ref<any[]>([])
  const pendingNotes = ref(false)

  const drafts = ref<any[]>([])
  const pendingDrafts = ref(false)
  const isUpdatingDraft = ref<string | null>(null)

  const editStageId = ref('')
  const editDriveFolderId = ref('')
  const editLeadSource = ref<string | null>(null)
  const editChurnRisk = ref<string | null>(null)
  const editTags = ref<string[]>([])
  const newTag = ref('')
  const isUpdating = ref(false)

  watch(
    () => props.athlete,
    (newAthlete) => {
      if (newAthlete && props.pipeline) {
        activeTab.value = 'overview'
        const deal = newAthlete.crmDeals?.find((d: any) => d.pipelineId === props.pipeline.id)
        editStageId.value = deal ? deal.stageId : props.pipeline.stages[0]?.id || ''
        editDriveFolderId.value = newAthlete.driveFolderId || ''
        editLeadSource.value = newAthlete.leadSource || null
        editChurnRisk.value = newAthlete.churnRisk || null
        editTags.value = [...(newAthlete.crmTags || [])]
        fetchNotes()
        fetchDrafts()
      }
    }
  )

  const fetchDrafts = async () => {
    if (!props.athlete) return
    pendingDrafts.value = true
    try {
      const res = await ($fetch as any)(`/api/coaching/crm/athletes/${props.athlete.id}/drafts`)
      drafts.value = res
    } catch (error) {
      console.error('Failed to fetch drafts:', error)
    } finally {
      pendingDrafts.value = false
    }
  }

  const updateDraft = async (draftId: string, status: string, subject?: string, body?: string) => {
    isUpdatingDraft.value = draftId
    try {
      await ($fetch as any)(`/api/coaching/crm/drafts/${draftId}`, {
        method: 'PATCH',
        body: { status, subject, body }
      })
      await fetchDrafts()
    } catch (error) {
      console.error('Failed to update draft:', error)
    } finally {
      isUpdatingDraft.value = null
    }
  }

  const fetchNotes = async () => {
    if (!props.athlete) return
    pendingNotes.value = true
    try {
      const res = await ($fetch as any)(`/api/coaching/crm/athletes/${props.athlete.id}/notes`)
      notes.value = res
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      pendingNotes.value = false
    }
  }

  const saveNote = async () => {
    if (!props.athlete || !newNote.value.trim()) return
    isSavingNote.value = true
    try {
      const res = await ($fetch as any)(`/api/coaching/crm/athletes/${props.athlete.id}/notes`, {
        method: 'POST',
        body: { text: newNote.value }
      })
      notes.value.unshift(res)
      newNote.value = ''
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      isSavingNote.value = false
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!props.athlete || !confirm('Are you sure you want to delete this note?')) return
    try {
      await ($fetch as any)(`/api/coaching/crm/athletes/${props.athlete.id}/notes/${noteId}`, {
        method: 'DELETE'
      })
      notes.value = notes.value.filter((n) => n.id !== noteId)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const updateAthlete = async (updates: any) => {
    if (!props.athlete) return
    isUpdating.value = true
    try {
      await ($fetch as any)(`/api/coaching/crm/athletes/${props.athlete.id}`, {
        method: 'PATCH',
        body: updates
      })
      emit('refresh')
    } catch (error) {
      console.error('Failed to update athlete:', error)
    } finally {
      isUpdating.value = false
    }
  }

  const updateAthleteStage = async () => {
    if (!props.athlete || !props.pipeline || !editStageId.value) return
    isUpdating.value = true
    try {
      await ($fetch as any)(`/api/coaching/crm/athletes/${props.athlete.id}`, {
        method: 'PATCH',
        body: {
          pipelineId: props.pipeline.id,
          stageId: editStageId.value
        }
      })
      emit('refresh')
    } catch (error) {
      console.error('Failed to update athlete stage:', error)
    } finally {
      isUpdating.value = false
    }
  }

  const archiveAthlete = async () => {
    if (!props.pipeline) return
    const lastStage = props.pipeline.stages[props.pipeline.stages.length - 1]
    if (lastStage) {
      editStageId.value = lastStage.id
      await updateAthleteStage()
    }
  }

  const addTag = async () => {
    if (!newTag.value.trim() || !props.athlete) return
    const tag = newTag.value.trim().toLowerCase()
    if (!editTags.value.includes(tag)) {
      editTags.value.push(tag)
      await updateAthlete({ crmTags: editTags.value })
    }
    newTag.value = ''
  }

  const removeTag = async (tag: string) => {
    editTags.value = editTags.value.filter((t) => t !== tag)
    await updateAthlete({ crmTags: editTags.value })
  }
</script>
