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
      <div v-if="athlete" class="h-full flex flex-col">
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
              <h2 class="font-bold text-base text-foreground leading-tight">
                {{ athlete.name || 'Unnamed Athlete' }}
              </h2>
              <p class="text-xs text-muted-foreground">{{ athlete.email }}</p>
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
              activeTab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            "
            @click="activeTab = 'settings'"
          >
            <Icon name="lucide:settings" class="w-4 h-4" /> Settings
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
                >Pipeline Stage</label
              >
              <select
                v-model="editStage"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                @change="updateAthlete({ pipelineStage: editStage })"
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
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
                  Move this athlete to the Alumni stage.
                </p>
                <button
                  class="bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20 rounded-md px-4 py-2 text-sm font-medium transition-colors w-full"
                  @click="updateAthlete({ pipelineStage: 'Alumni' })"
                >
                  Archive to Alumni
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
  }>()

  const emit = defineEmits(['close', 'refresh'])

  const activeTab = ref('overview')
  const newNote = ref('')
  const isSavingNote = ref(false)
  const notes = ref<any[]>([])
  const pendingNotes = ref(false)

  const editStage = ref('Lead')
  const editDriveFolderId = ref('')
  const editTags = ref<string[]>([])
  const newTag = ref('')
  const isUpdating = ref(false)

  watch(
    () => props.athlete,
    (newAthlete) => {
      if (newAthlete) {
        activeTab.value = 'overview'
        editStage.value = newAthlete.pipelineStage || 'Lead'
        editDriveFolderId.value = newAthlete.driveFolderId || ''
        editTags.value = [...(newAthlete.crmTags || [])]
        fetchNotes()
      }
    }
  )

  const fetchNotes = async () => {
    if (!props.athlete) return
    pendingNotes.value = true
    try {
      const res = await $fetch(`/api/coaching/crm/athletes/${props.athlete.id}/notes` as string)
      notes.value = res as any[]
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
      const res = await $fetch(`/api/coaching/crm/athletes/${props.athlete.id}/notes` as string, {
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
      await $fetch(`/api/coaching/crm/athletes/${props.athlete.id}/notes/${noteId}`, {
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
      await $fetch(`/api/coaching/crm/athletes/${props.athlete.id}`, {
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
