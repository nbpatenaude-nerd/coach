<script setup lang="ts">
  definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'admin']
  })

  useHead({
    title: 'Import Legacy Users',
    meta: [
      {
        name: 'description',
        content: 'Import Firebase Auth export users into PostgreSQL (create-only).'
      }
    ]
  })

  const toast = useToast()
  const fileInput = ref<HTMLInputElement | null>(null)
  const fileName = ref('')
  const rawJson = ref('')
  const dryRun = ref(true)
  const loading = ref(false)
  const result = ref<{
    dryRun: boolean
    total: number
    imported: number
    existing: number
    skipped: number
    errors: Array<{ email?: string; localId?: string; message: string }>
    importedEmails: string[]
  } | null>(null)

  const userCount = computed(() => {
    try {
      const parsed = JSON.parse(rawJson.value || '{}')
      const users = Array.isArray(parsed?.users)
        ? parsed.users
        : Array.isArray(parsed)
          ? parsed
          : []
      return users.length
    } catch {
      return null
    }
  })

  async function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    fileName.value = file.name
    rawJson.value = await file.text()
    result.value = null
  }

  async function runImport() {
    loading.value = true
    result.value = null
    try {
      let payload: Record<string, unknown>
      try {
        payload = JSON.parse(rawJson.value)
      } catch {
        toast.add({
          title: 'Invalid JSON',
          description: 'Could not parse the pasted / uploaded file.',
          color: 'error'
        })
        return
      }
      if (Array.isArray(payload)) {
        payload = { users: payload }
      }
      const res = await $fetch('/api/admin/legacy-users/import', {
        method: 'POST',
        body: { ...payload, dryRun: dryRun.value }
      })
      result.value = res as typeof result.value
      toast.add({
        title: dryRun.value ? 'Dry run complete' : 'Import complete',
        description: `${(res as any).imported} created, ${(res as any).existing} already existed, ${(res as any).skipped} skipped`,
        color: 'success'
      })
    } catch (error: any) {
      toast.add({
        title: 'Import failed',
        description: error.data?.statusMessage || error.message || 'Unknown error',
        color: 'error'
      })
    } finally {
      loading.value = false
    }
  }
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Import Legacy Users">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="mx-auto max-w-3xl space-y-6 p-6">
        <UAlert
          color="warning"
          variant="subtle"
          title="Create-only import"
          description="Uploads a Firebase Auth export ({ users: [...] }). Existing emails are skipped. Password hashes are not migrated — athletes sign in via email magic link or claim/reset password."
        />

        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold">legacy_users.json</h2>
                <p class="text-sm text-muted">
                  Same format as
                  <code class="text-xs">scripts/import-legacy-users.ts</code>
                </p>
              </div>
              <UButton
                color="neutral"
                variant="outline"
                icon="i-heroicons-folder-open"
                @click="fileInput?.click()"
              >
                Choose file
              </UButton>
              <input
                ref="fileInput"
                type="file"
                accept="application/json,.json"
                class="hidden"
                @change="onFileChange"
              />
            </div>
          </template>

          <div class="space-y-4">
            <p v-if="fileName" class="text-sm text-muted">
              Loaded: <span class="font-medium text-highlighted">{{ fileName }}</span>
              <span v-if="userCount != null"> · {{ userCount }} users</span>
            </p>

            <UTextarea
              v-model="rawJson"
              :rows="14"
              autoresize
              class="font-mono text-xs"
              placeholder='{ "users": [ { "localId": "...", "email": "...", "displayName": "..." } ] }'
            />

            <div class="flex flex-wrap items-center justify-between gap-4">
              <UCheckbox v-model="dryRun" label="Dry run (count only — do not write)" />
              <UButton
                color="primary"
                icon="i-heroicons-arrow-up-tray"
                :loading="loading"
                :disabled="!rawJson.trim()"
                @click="runImport"
              >
                {{ dryRun ? 'Preview import' : 'Run import' }}
              </UButton>
            </div>
          </div>
        </UCard>

        <UCard v-if="result">
          <template #header>
            <h2 class="text-base font-semibold">
              {{ result.dryRun ? 'Dry-run summary' : 'Import summary' }}
            </h2>
          </template>
          <dl class="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt class="text-xs uppercase tracking-wide text-muted">Total</dt>
              <dd class="text-2xl font-bold">{{ result.total }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-muted">
                {{ result.dryRun ? 'Would create' : 'Imported' }}
              </dt>
              <dd class="text-2xl font-bold text-primary">{{ result.imported }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-muted">Already existed</dt>
              <dd class="text-2xl font-bold">{{ result.existing }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-muted">Skipped / errors</dt>
              <dd class="text-2xl font-bold">
                {{ result.skipped + result.errors.length }}
              </dd>
            </div>
          </dl>

          <div v-if="result.importedEmails.length" class="mt-6">
            <h3 class="mb-2 text-sm font-semibold">
              {{ result.dryRun ? 'Would create' : 'Created' }} (first
              {{ Math.min(result.importedEmails.length, 50) }})
            </h3>
            <ul
              class="max-h-48 overflow-auto rounded-lg border border-default p-3 text-sm font-mono"
            >
              <li v-for="email in result.importedEmails.slice(0, 50)" :key="email">
                {{ email }}
              </li>
            </ul>
          </div>

          <div v-if="result.errors.length" class="mt-6">
            <h3 class="mb-2 text-sm font-semibold text-error">Errors</h3>
            <ul
              class="max-h-48 space-y-2 overflow-auto rounded-lg border border-error/30 p-3 text-sm"
            >
              <li v-for="(err, i) in result.errors.slice(0, 50)" :key="i">
                <span class="font-mono">{{ err.email || err.localId || '?' }}</span>
                — {{ err.message }}
              </li>
            </ul>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
