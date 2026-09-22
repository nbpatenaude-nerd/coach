import { readFileSync } from 'node:fs'
import { globSync } from 'glob'
import { describe, expect, it } from 'vitest'
import {
  ensureTaskHandlersRegistered,
  getLoadedTaskDefinitions
} from '../../../../cli/worker/task-handler-loader'
import taskManifest from '../../../../server/utils/task-manifest.json' with { type: 'json' }
import {
  executeRegisteredTask,
  getRegisteredTaskIds,
  hasTaskHandler
} from '../../../../server/utils/task-registry'

const taskDefinitionPattern = /(?:\btask|schedules\.task)\(\{\s*id:\s*['"]([^'"]+)['"]/g
const directTriggerPattern =
  /\b(?:tasks|[A-Za-z_$][\w$]*Task)\.(?:trigger|triggerAndWait|batchTrigger|batchTriggerAndWait|triggerAndSubscribe)\s*\(/

describe('Redis task parity', () => {
  it('loads and registers every Trigger task definition', async () => {
    await ensureTaskHandlersRegistered()

    const sourceIds = globSync('trigger/*.ts')
      .flatMap((file) =>
        Array.from(readFileSync(file, 'utf8').matchAll(taskDefinitionPattern), (match) => match[1])
      )
      .sort()
    const loadedIds = getLoadedTaskDefinitions()
      .map((definition) => definition.id)
      .sort()
    const manifestIds = taskManifest.map((definition) => definition.id).sort()

    // Redis worker parity: every manifest entry must load, and every loaded task
    // must be declared in the manifest. Source may contain extra unpublished tasks.
    expect(new Set(sourceIds).size).toBe(sourceIds.length)
    expect(loadedIds).toEqual(manifestIds)
    expect(manifestIds.every((id) => sourceIds.includes(id))).toBe(true)
    expect(
      JSON.parse(
        JSON.stringify(getLoadedTaskDefinitions().sort((a, b) => a.id.localeCompare(b.id)))
      )
    ).toEqual([...taskManifest].sort((a, b) => a.id.localeCompare(b.id)))
    expect(getRegisteredTaskIds()).toEqual(manifestIds)
    expect(manifestIds.every(hasTaskHandler)).toBe(true)
  })

  it('preserves every declarative schedule', async () => {
    await ensureTaskHandlersRegistered()

    expect(
      Object.fromEntries(
        getLoadedTaskDefinitions()
          .filter((definition) => definition.schedule)
          .map((definition) => [definition.id, definition.schedule?.cron])
      )
    ).toEqual({
      'finalize-daily-nutrition-cron': '10 2 * * *',
      'poll-ultrahuman': '5 * * * *',
      'trial-ending-reminder-cron': '0 9 * * *',
      'weekly-check-in-reminder-cron': '0 15 * * 1,2'
    })
  })

  it('executes a canonical task through the shared registry', async () => {
    await ensureTaskHandlersRegistered()
    await expect(executeRegisteredTask('hello-world', { message: 'Redis' })).resolves.toEqual({
      message: 'Hello, Redis!'
    })
  })

  it('does not bypass the dispatcher from task or server producers', () => {
    const allowed = new Set([
      'server/utils/task-dispatcher.ts',
      'server/utils/trigger-check.ts',
      'trigger/queues.ts',
      // Pre-existing direct triggers outside the Redis dispatcher path.
      'server/api/booking/[slug]/confirm.post.ts',
      'trigger/book-appointment.ts'
    ])
    const bypasses = globSync(['cli/**/*.ts', 'server/**/*.ts', 'trigger/**/*.ts'])
      .map((file) => file.replace(/\\/g, '/'))
      .filter((file) => !allowed.has(file))
      .filter((file) => directTriggerPattern.test(readFileSync(file, 'utf8')))

    expect(bypasses).toEqual([])
  })
})
