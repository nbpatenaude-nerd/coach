import { getChatTurnRunner } from '../utils/chat/turn-runner'
import {
  isRealtimeBusEnabled,
  startRealtimeSubscription,
  stopRealtimeSubscription
} from '../utils/realtime-bus'
import { sendToUserLocal } from '../utils/ws-state'

export default defineNitroPlugin((nitroApp) => {
  const isBuild = process.argv.some(arg => arg.endsWith('build') || arg.endsWith('generate')) || process.env.npm_lifecycle_event === 'build'
  if (
    process.env.NITRO_BUILD ||
    import.meta.prerender ||
    isBuild
  ) {
    return
  }

  const runnerEnabled = process.env.CHAT_TURN_RUNNER_ENABLED !== 'false'
  const runner = runnerEnabled ? getChatTurnRunner() : null

  if (runnerEnabled) {
    runner?.start()
  }
  if (isRealtimeBusEnabled()) {
    void startRealtimeSubscription(({ userId, data }) => {
      sendToUserLocal(userId, data)
    })
  }

  nitroApp.hooks.hookOnce('close', () => {
    runner?.stop()
    if (isRealtimeBusEnabled()) {
      void stopRealtimeSubscription()
    }
  })
})
