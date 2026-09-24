<template>
  <UDashboardPanel id="workout-share-composer">
    <template #header>
      <UDashboardNavbar :title="pageTitle">
        <template #leading>
          <UButton
            icon="i-heroicons-arrow-left"
            color="neutral"
            variant="ghost"
            @click="() => void navigateTo(`/workouts/${workoutId}`)"
          >
            Back
          </UButton>
        </template>

        <template #right>
          <div class="flex flex-wrap items-center gap-2">
            <UButton
              icon="i-heroicons-link"
              color="neutral"
              variant="outline"
              :disabled="!shareLink"
              @click="() => void copyShareLink()"
            >
              Copy link
            </UButton>
            <UButton
              icon="i-heroicons-arrow-down-tray"
              color="neutral"
              variant="outline"
              :disabled="!previewUrl"
              :loading="downloading"
              @click="() => void downloadImage()"
            >
              Save PNG
            </UButton>
            <UButton
              icon="i-heroicons-share"
              color="primary"
              variant="solid"
              :disabled="!previewUrl"
              :loading="sharing"
              @click="() => void shareNative()"
            >
              Share
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-[1400px] flex-col gap-6 p-4 sm:p-6">
        <div v-if="loading" class="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <USkeleton class="h-[520px] w-full rounded-2xl" />
          <USkeleton class="aspect-[9/16] w-full max-w-md rounded-2xl justify-self-center" />
        </div>

        <UAlert
          v-else-if="error"
          color="error"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          title="Failed to load share composer"
          :description="error"
        />

        <template v-else>
          <div class="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)] lg:items-start">
            <div class="space-y-4">
              <UCard :ui="{ body: 'space-y-5 p-5' }">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary-500">
                    Share composer
                  </p>
                  <h1 class="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                    {{ workout?.title || 'Workout' }}
                  </h1>
                  <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Toggle stats, pick a Journey Endurance mark, then save or share.
                  </p>
                </div>

                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Layout</p>
                  <div class="flex flex-wrap gap-2">
                    <UButton
                      v-for="option in ratioOptions"
                      :key="option.value"
                      size="sm"
                      :color="selectedRatio === option.value ? 'primary' : 'neutral'"
                      :variant="selectedRatio === option.value ? 'solid' : 'outline'"
                      @click="selectedRatio = option.value"
                    >
                      {{ option.label }}
                    </UButton>
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Style</p>
                  <div class="flex flex-wrap gap-2">
                    <UButton
                      v-for="option in styleOptions"
                      :key="option.value"
                      size="sm"
                      :color="selectedStyle === option.value ? 'primary' : 'neutral'"
                      :variant="selectedStyle === option.value ? 'solid' : 'outline'"
                      @click="selectedStyle = option.value"
                    >
                      {{ option.label }}
                    </UButton>
                  </div>
                </div>

                <div class="space-y-2">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Background
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <UButton
                      v-for="option in variantOptions"
                      :key="option.value"
                      size="sm"
                      :color="selectedVariant === option.value ? 'primary' : 'neutral'"
                      :variant="selectedVariant === option.value ? 'solid' : 'outline'"
                      @click="selectedVariant = option.value"
                    >
                      {{ option.label }}
                    </UButton>
                  </div>
                  <p
                    v-if="selectedVariant === 'transparent'"
                    class="text-xs text-gray-500 dark:text-gray-400"
                  >
                    Transparent PNG for Stories / Reels overlays.
                  </p>
                </div>

                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">Show title</p>
                    <p class="text-xs text-gray-500">Workout name + sport on the card</p>
                  </div>
                  <USwitch v-model="showTitle" />
                </div>
              </UCard>

              <UCard :ui="{ body: 'space-y-4 p-5' }">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">Stats</p>
                    <p class="text-xs text-gray-500">
                      Up to {{ maxMetrics }} · first hero-capable metric becomes the large number
                    </p>
                  </div>
                  <UButton size="xs" color="neutral" variant="ghost" @click="resetMetrics">
                    Sport defaults
                  </UButton>
                </div>

                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="metric in metricOptions"
                    :key="metric.id"
                    type="button"
                    class="rounded-xl border px-3 py-2.5 text-left transition"
                    :class="metricToggleClass(metric.id)"
                    :disabled="!metricAvailable(metric.id) && !selectedMetrics.includes(metric.id)"
                    @click="toggleMetric(metric.id)"
                  >
                    <p class="text-sm font-semibold">{{ metric.label }}</p>
                    <p class="mt-0.5 text-xs opacity-70">
                      {{ metricPreview(metric.id) || 'No data' }}
                    </p>
                  </button>
                </div>
              </UCard>

              <UCard :ui="{ body: 'space-y-4 p-5' }">
                <div>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">Brand mark</p>
                  <p class="text-xs text-gray-500">Journey Endurance logos from your media kit</p>
                </div>

                <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <button
                    v-for="logo in logoOptions"
                    :key="logo.id"
                    type="button"
                    class="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border p-3 transition"
                    :class="
                      selectedLogo === logo.id
                        ? 'border-primary-500 bg-primary-500/10 ring-1 ring-primary-500'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-white/10 dark:bg-white/5'
                    "
                    @click="selectedLogo = logo.id"
                  >
                    <img
                      v-if="logo.publicPath"
                      :src="logo.publicPath"
                      :alt="logo.label"
                      class="h-10 w-auto max-w-full object-contain"
                    />
                    <span
                      v-else-if="logo.id === 'wordmark'"
                      class="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-700 dark:text-gray-200"
                    >
                      Journey Endurance
                    </span>
                    <span v-else class="text-xs font-medium text-gray-400"> None </span>
                    <span class="text-[11px] font-medium text-gray-500">{{ logo.label }}</span>
                  </button>
                </div>
              </UCard>
            </div>

            <div class="space-y-4">
              <div
                class="mx-auto w-full overflow-hidden rounded-3xl border border-gray-200 shadow-xl dark:border-white/10"
                :class="[
                  previewAspectClass,
                  selectedVariant === 'transparent' ? checkerboardClass : 'bg-gray-950',
                  previewMaxWidthClass
                ]"
              >
                <img
                  v-if="previewUrl"
                  :key="previewUrl"
                  :src="previewUrl"
                  alt="Share preview"
                  class="block h-full w-full object-contain"
                  @error="previewError = 'Preview failed to render'"
                  @load="previewError = null"
                />
                <div
                  v-else
                  class="flex h-full min-h-[320px] items-center justify-center p-8 text-sm text-gray-400"
                >
                  Generating preview…
                </div>
              </div>

              <UAlert
                v-if="previewError"
                color="warning"
                variant="soft"
                :title="previewError"
                description="Try another style or fewer metrics."
              />

              <div class="flex flex-wrap items-center justify-center gap-2">
                <UButton
                  color="neutral"
                  variant="soft"
                  :to="shareLink || undefined"
                  :disabled="!shareLink"
                  target="_blank"
                >
                  Open public page
                </UButton>
                <UButton
                  color="neutral"
                  variant="soft"
                  :to="previewUrl || undefined"
                  :disabled="!previewUrl"
                  target="_blank"
                >
                  Open image
                </UButton>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
  import {
    DEFAULT_SHARE_LOGO,
    MAX_SHARE_METRICS,
    SHARE_LOGO_OPTIONS,
    SHARE_METRIC_OPTIONS,
    sportDefaultMetrics,
    type ShareLogoId,
    type ShareMetricId
  } from '~~/shared/workout-share-composer'

  definePageMeta({
    middleware: 'auth'
  })

  useHead({
    title: 'Share Workout'
  })

  type ShareRatio = 'story' | 'square' | 'post'
  type ShareStyle = 'map' | 'poster' | 'crest' | 'pulse'
  type ShareVariant = 'default' | 'flat' | 'transparent'

  const route = useRoute()
  const toast = useToast()
  const config = useRuntimeConfig()

  const workoutId = computed(() => route.params.id as string)
  const workout = ref<any>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const previewError = ref<string | null>(null)
  const downloading = ref(false)
  const sharing = ref(false)

  const selectedRatio = ref<ShareRatio>('story')
  const selectedStyle = ref<ShareStyle>('map')
  const selectedVariant = ref<ShareVariant>('default')
  const selectedLogo = ref<ShareLogoId>(DEFAULT_SHARE_LOGO)
  const selectedMetrics = ref<ShareMetricId[]>([])
  const showTitle = ref(true)
  const imageRenderVersion = '2026-09-22-composer'

  const maxMetrics = MAX_SHARE_METRICS
  const metricOptions = SHARE_METRIC_OPTIONS
  const logoOptions = SHARE_LOGO_OPTIONS

  const ratioOptions = [
    { label: 'Story 9:16', value: 'story' as const },
    { label: 'Square 1:1', value: 'square' as const },
    { label: 'Post 4:5', value: 'post' as const }
  ]

  const styleOptions = [
    { label: 'Map', value: 'map' as const },
    { label: 'Poster', value: 'poster' as const },
    { label: 'Crest', value: 'crest' as const },
    { label: 'Pulse', value: 'pulse' as const }
  ]

  const variantOptions = [
    { label: 'Card', value: 'default' as const },
    { label: 'Flat', value: 'flat' as const },
    { label: 'Transparent', value: 'transparent' as const }
  ]

  const { shareLink, generateShareLink } = useResourceShare('WORKOUT', workoutId)

  const checkerboardClass =
    'bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb),linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%,#e5e7eb)] bg-[length:24px_24px] bg-[position:0_0,12px_12px] dark:bg-[linear-gradient(45deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.08)_75%,rgba(255,255,255,0.08)),linear-gradient(45deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_75%,rgba(255,255,255,0.08)_75%,rgba(255,255,255,0.08))]'

  const pageTitle = computed(() =>
    workout.value?.title ? `Share: ${workout.value.title}` : 'Share Workout'
  )

  const shareToken = computed(() => {
    if (!shareLink.value) return ''
    const parts = shareLink.value.split('/').filter(Boolean)
    return parts[parts.length - 1] || ''
  })

  const previewAspectClass = computed(() =>
    selectedRatio.value === 'story'
      ? 'aspect-[9/16]'
      : selectedRatio.value === 'square'
        ? 'aspect-square'
        : 'aspect-[4/5]'
  )

  const previewMaxWidthClass = computed(() =>
    selectedRatio.value === 'story' ? 'max-w-[420px]' : 'max-w-[520px]'
  )

  const previewUrl = computed(() => {
    if (!shareToken.value || selectedMetrics.value.length === 0) return ''
    const params = new URLSearchParams()
    if (selectedStyle.value !== 'map') params.set('style', selectedStyle.value)
    if (selectedVariant.value !== 'default') params.set('variant', selectedVariant.value)
    if (selectedRatio.value !== 'story') params.set('ratio', selectedRatio.value)
    if (selectedLogo.value !== DEFAULT_SHARE_LOGO) params.set('logo', selectedLogo.value)
    if (!showTitle.value) params.set('showTitle', '0')
    params.set('metrics', selectedMetrics.value.join(','))
    params.set('v', imageRenderVersion)
    return `/api/share/workouts/${shareToken.value}/image?${params.toString()}`
  })

  function metricAvailable(id: ShareMetricId) {
    const w = workout.value
    if (!w) return false
    switch (id) {
      case 'distance':
        return !!w.distanceMeters
      case 'duration':
        return !!w.durationSec
      case 'avgPace':
        return !!(w.averageSpeed || (w.durationSec && w.distanceMeters))
      case 'avgSpeed':
        return !!w.averageSpeed
      case 'avgPower':
        return !!w.averageWatts
      case 'maxPower':
        return !!w.maxWatts
      case 'normalizedPower':
        return !!w.normalizedPower
      case 'avgHr':
        return !!w.averageHr
      case 'maxHr':
        return !!w.maxHr
      case 'elevation':
        return !!w.elevationGain
      case 'tss':
        return w.tss != null
      case 'kj':
        return !!w.kilojoules
      default:
        return false
    }
  }

  function metricPreview(id: ShareMetricId) {
    const w = workout.value
    if (!w || !metricAvailable(id)) return ''
    switch (id) {
      case 'distance':
        return `${(w.distanceMeters / 1000).toFixed(1)} km`
      case 'duration': {
        const h = Math.floor(w.durationSec / 3600)
        const m = Math.floor((w.durationSec % 3600) / 60)
        return h > 0 ? `${h}h ${m}m` : `${m}m`
      }
      case 'avgPower':
        return `${Math.round(w.averageWatts)} W`
      case 'maxPower':
        return `${Math.round(w.maxWatts)} W`
      case 'avgHr':
        return `${Math.round(w.averageHr)} bpm`
      case 'maxHr':
        return `${Math.round(w.maxHr)} bpm`
      case 'elevation':
        return `${Math.round(w.elevationGain)} m`
      case 'tss':
        return `${Math.round(w.tss)}`
      case 'kj':
        return `${Math.round(w.kilojoules)} kJ`
      case 'avgSpeed':
        return `${(w.averageSpeed * 3.6).toFixed(1)} km/h`
      case 'normalizedPower':
        return `${Math.round(w.normalizedPower)} W`
      case 'avgPace':
        return 'pace'
      default:
        return ''
    }
  }

  function metricToggleClass(id: ShareMetricId) {
    const selected = selectedMetrics.value.includes(id)
    const available = metricAvailable(id)
    if (selected) {
      return 'border-primary-500 bg-primary-500/10 text-gray-900 ring-1 ring-primary-500 dark:text-white'
    }
    if (!available) {
      return 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400 opacity-60 dark:border-white/5 dark:bg-white/[0.02]'
    }
    return 'border-gray-200 bg-white text-gray-800 hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:text-gray-100'
  }

  function toggleMetric(id: ShareMetricId) {
    const index = selectedMetrics.value.indexOf(id)
    if (index >= 0) {
      if (selectedMetrics.value.length <= 1) return
      selectedMetrics.value = selectedMetrics.value.filter((item) => item !== id)
      return
    }
    if (!metricAvailable(id)) return
    if (selectedMetrics.value.length >= maxMetrics) {
      toast.add({
        title: 'Limit reached',
        description: `Choose up to ${maxMetrics} stats.`,
        color: 'warning'
      })
      return
    }
    selectedMetrics.value = [...selectedMetrics.value, id]
  }

  function resetMetrics() {
    const defaults = sportDefaultMetrics(workout.value?.type).filter(metricAvailable)
    selectedMetrics.value =
      defaults.length > 0
        ? defaults
        : SHARE_METRIC_OPTIONS.map((m) => m.id)
            .filter(metricAvailable)
            .slice(0, 4)
  }

  async function copyShareLink() {
    if (!shareLink.value || !import.meta.client) return
    await navigator.clipboard.writeText(shareLink.value)
    toast.add({ title: 'Copied', description: 'Share link copied.', color: 'success' })
  }

  async function downloadImage() {
    if (!previewUrl.value || !import.meta.client) return
    downloading.value = true
    try {
      const response = await fetch(previewUrl.value)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = `${slugify(workout.value?.title || 'workout')}-${selectedRatio.value}.png`
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      toast.add({ title: 'Download failed', color: 'error' })
    } finally {
      downloading.value = false
    }
  }

  async function shareNative() {
    if (!previewUrl.value || !import.meta.client) return
    sharing.value = true
    try {
      const response = await fetch(previewUrl.value)
      const blob = await response.blob()
      const file = new File([blob], `${slugify(workout.value?.title || 'workout')}.png`, {
        type: 'image/png'
      })
      const siteUrl = config.public.siteUrl || ''
      const text = workout.value?.title
        ? `${workout.value.title} — Journey Endurance`
        : 'Shared from Journey Endurance'

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: workout.value?.title || 'Workout',
          text,
          url: shareLink.value || siteUrl
        })
      } else if (navigator.share) {
        await navigator.share({
          title: workout.value?.title || 'Workout',
          text,
          url: shareLink.value || absoluteUrl(previewUrl.value)
        })
      } else {
        await downloadImage()
        toast.add({
          title: 'Saved image',
          description: 'Native share is unavailable — PNG downloaded instead.',
          color: 'info'
        })
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        toast.add({ title: 'Share failed', color: 'error' })
      }
    } finally {
      sharing.value = false
    }
  }

  function absoluteUrl(path: string) {
    const siteUrl = config.public.siteUrl || 'http://localhost:3000'
    return `${siteUrl}${path}`
  }

  function slugify(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function fetchWorkout() {
    loading.value = true
    error.value = null
    try {
      workout.value = await $fetch(`/api/workouts/${workoutId.value}`)
      await generateShareLink({ expiresIn: null, forceNew: false })
      resetMetrics()
    } catch (e: any) {
      error.value = e.data?.message || e.message || 'Failed to load workout.'
    } finally {
      loading.value = false
    }
  }

  await fetchWorkout()
</script>
