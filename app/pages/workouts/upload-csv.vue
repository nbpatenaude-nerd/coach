<template>
  <UDashboardPanel id="upload-csv">
    <template #header>
      <UDashboardNavbar title="Upload CSV Data">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton to="/data" color="neutral" variant="ghost" icon="i-heroicons-arrow-left">
            Back to Data
          </UButton>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-3xl mx-auto p-4 sm:p-8 space-y-8 pb-24">
        <div class="text-center space-y-4">
          <div
            class="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto border border-primary-100 dark:border-primary-800"
          >
            <UIcon name="i-heroicons-table-cells" class="w-8 h-8 text-primary-500" />
          </div>
          <div class="space-y-1">
            <h1 class="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              CSV Ingestion
            </h1>
            <p
              class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest"
            >
              Integrity Center • Advanced Metric Upload
            </p>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Upload CSV data from external sensors (Moxy, EIR, etc.). Map the columns to your Journey
            Endurance timeline to merge them into your workouts.
          </p>
        </div>

        <UCard
          :ui="{ root: 'rounded-xl shadow-lg border-gray-100 dark:border-gray-800', body: 'p-6' }"
        >
          <!-- Step 1: Select File -->
          <div v-if="!fileParsed" class="space-y-4">
            <UFormGroup
              label="Select CSV File"
              description="Must contain a header row with column names."
            >
              <input
                ref="fileInput"
                type="file"
                accept=".csv"
                class="hidden"
                @change="handleFileSelect"
              />
              <div class="flex gap-4 items-center">
                <UButton
                  color="primary"
                  variant="outline"
                  icon="i-heroicons-document-arrow-up"
                  @click="() => fileInput?.click()"
                >
                  Choose File
                </UButton>
                <span class="text-sm font-medium text-gray-500">{{
                  selectedFile?.name || 'No file selected'
                }}</span>
              </div>
            </UFormGroup>
          </div>

          <!-- Step 2: Mapping -->
          <div v-else class="space-y-6">
            <div
              class="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-800"
            >
              <h3 class="font-black uppercase tracking-widest text-sm">Column Mapping</h3>
              <UButton size="xs" color="neutral" variant="ghost" @click="reset">Start Over</UButton>
            </div>

            <p class="text-sm text-gray-500 mb-4">
              Select which CSV columns correspond to our tracked metrics. Time is required.
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <UFormGroup
                v-for="field in standardFields"
                :key="field.id"
                :label="field.label"
                :required="field.required"
              >
                <USelect
                  v-model="mapping[field.id]"
                  :options="[
                    { label: 'Ignore (None)', value: '' },
                    ...csvColumns.map((c) => ({ label: c, value: c }))
                  ]"
                />
              </UFormGroup>
            </div>

            <div class="pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <UButton
                :loading="uploading"
                color="primary"
                class="font-black uppercase tracking-widest text-xs px-6 py-2"
                @click="uploadMappedFile"
              >
                Merge Data
              </UButton>
            </div>
          </div>
        </UCard>

        <UAlert
          v-if="errorMsg"
          color="red"
          variant="soft"
          icon="i-heroicons-x-circle"
          :title="errorMsg"
        />
        <UAlert
          v-if="successMsg"
          color="green"
          variant="soft"
          icon="i-heroicons-check-circle"
          :title="successMsg"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import Papa from 'papaparse'

  definePageMeta({
    middleware: 'auth'
  })

  const fileInput = ref<HTMLInputElement | null>(null)
  const selectedFile = ref<File | null>(null)
  const fileParsed = ref(false)
  const csvColumns = ref<string[]>([])
  const mapping = ref<Record<string, string>>({})
  const uploading = ref(false)
  const errorMsg = ref('')
  const successMsg = ref('')

  const standardFields = [
    { id: 'time', label: 'Timestamp (Time)', required: true },
    { id: 'smO2', label: 'Muscle Oxygen (SmO2)' },
    { id: 'vo2', label: 'VO2' },
    { id: 'thb', label: 'Total Hemoglobin (tHb)' },
    { id: 'heartrate', label: 'Heart Rate' },
    { id: 'watts', label: 'Power (Watts)' },
    { id: 'respiration', label: 'Respiration Rate' }
  ]

  const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (!target.files || target.files.length === 0) return

    selectedFile.value = target.files[0] || null
    errorMsg.value = ''

    // Parse just the first few lines to get headers
    if (!selectedFile.value) return
    Papa.parse(selectedFile.value as any, {
      header: true,
      preview: 1, // Only need header, but let's parse 1 line to ensure it has data
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta && results.meta.fields) {
          csvColumns.value = results.meta.fields
          fileParsed.value = true

          // Auto-guess mapping
          mapping.value = {}
          for (const field of standardFields) {
            const guess = csvColumns.value.find(
              (c) =>
                c.toLowerCase().includes(field.id.toLowerCase()) ||
                field.label.toLowerCase().includes(c.toLowerCase())
            )
            mapping.value[field.id] = guess || ''
          }
        } else {
          errorMsg.value = 'Could not read CSV headers.'
        }
      },
      error: (err) => {
        errorMsg.value = err.message
      }
    })
  }

  const reset = () => {
    selectedFile.value = null
    fileParsed.value = false
    csvColumns.value = []
    mapping.value = {}
    errorMsg.value = ''
    successMsg.value = ''
    if (fileInput.value) fileInput.value.value = ''
  }

  const uploadMappedFile = async () => {
    if (!selectedFile.value) return
    if (!mapping.value['time']) {
      errorMsg.value = 'You must map a column for Time/Timestamp.'
      return
    }

    uploading.value = true
    errorMsg.value = ''
    successMsg.value = ''

    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('mapping', JSON.stringify(mapping.value))

      const response = await $fetch<{ success: boolean; workoutId?: string }>(
        '/api/workouts/upload-csv',
        {
          method: 'POST',
          body: formData
        }
      )

      if (response.success) {
        successMsg.value =
          'CSV successfully ingested! If this overlaps with an existing Garmin/Strava workout, the metrics will be merged automatically in the background.'
        setTimeout(() => {
          reset()
        }, 4000)
      }
    } catch (e: any) {
      errorMsg.value = e.data?.statusMessage || e.message || 'An error occurred during upload'
    } finally {
      uploading.value = false
    }
  }
</script>
