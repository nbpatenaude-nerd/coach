import { defineStore, skipHydrate } from 'pinia'

const ACT_AS_COOKIE_NAME = 'coach_wattz_act_as_user'
const ACT_AS_DASHBOARD_PATH = '/dashboard'
const CALENDAR_PATH = '/calendar'

function persistActAsCookie(userId: string | null) {
  if (!import.meta.client) return
  if (!userId) {
    document.cookie = `${ACT_AS_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`
    return
  }
  document.cookie = `${ACT_AS_COOKIE_NAME}=${encodeURIComponent(userId)}; path=/; SameSite=Lax`
}

function hardResetForIdentityChange(path?: string) {
  if (!import.meta.client) return
  if (path) {
    window.location.assign(path)
    return
  }
  window.location.reload()
}

export const useCoachingStore = defineStore('coaching', () => {
  const actingAsUserId = ref<string | null>(null)
  const actingAsUserName = ref<string | null>(null)
  const isProgramMode = ref<boolean>(false)

  // Load from localStorage on init
  if (import.meta.client) {
    const savedId = localStorage.getItem('coaching_act_as_id')
    const savedName = localStorage.getItem('coaching_act_as_name')
    const savedProgramMode = localStorage.getItem('coaching_is_program_mode')
    if (savedId) {
      actingAsUserId.value = savedId
      actingAsUserName.value = savedName
      isProgramMode.value = savedProgramMode === 'true'
      persistActAsCookie(savedId)
    }
  }

  const isCoachingMode = computed(() => !!actingAsUserId.value)

  function startActingAs(userId: string, userName: string) {
    actingAsUserId.value = userId
    actingAsUserName.value = userName
    isProgramMode.value = false
    if (import.meta.client) {
      localStorage.setItem('coaching_act_as_id', userId)
      localStorage.setItem('coaching_act_as_name', userName)
      localStorage.removeItem('coaching_is_program_mode')
      persistActAsCookie(userId)
      hardResetForIdentityChange(ACT_AS_DASHBOARD_PATH)
    }
  }

  function startEditingProgram(programId: string, programName: string) {
    actingAsUserId.value = programId
    actingAsUserName.value = programName
    isProgramMode.value = true
    if (import.meta.client) {
      localStorage.setItem('coaching_act_as_id', programId)
      localStorage.setItem('coaching_act_as_name', programName)
      localStorage.setItem('coaching_is_program_mode', 'true')
      persistActAsCookie(programId)
      hardResetForIdentityChange(CALENDAR_PATH)
    }
  }

  function clearActingAs() {
    actingAsUserId.value = null
    actingAsUserName.value = null
    isProgramMode.value = false
    if (import.meta.client) {
      localStorage.removeItem('coaching_act_as_id')
      localStorage.removeItem('coaching_act_as_name')
      localStorage.removeItem('coaching_is_program_mode')
      persistActAsCookie(null)
    }
  }

  function stopActingAs() {
    clearActingAs()
    hardResetForIdentityChange()
  }

  return {
    actingAsUserId: skipHydrate(actingAsUserId),
    actingAsUserName: skipHydrate(actingAsUserName),
    isProgramMode: skipHydrate(isProgramMode),
    isCoachingMode,
    startActingAs,
    startEditingProgram,
    clearActingAs,
    stopActingAs
  }
})
