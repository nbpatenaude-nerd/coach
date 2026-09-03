import { defineEventHandler, readMultipartFormData, createError } from 'h3'
import { requireAuth } from '../../utils/auth-guard'
import { prisma } from '../../utils/db'
import Papa from 'papaparse'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event, ['workout:write'])

  const body = await readMultipartFormData(event)
  if (!body || body.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const filePart = body.find((part) => part.name === 'file')
  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: 'File field missing' })
  }

  const mappingPart = body.find((part) => part.name === 'mapping')
  if (!mappingPart) {
    throw createError({ statusCode: 400, statusMessage: 'Mapping field missing' })
  }

  const namePart = body.find((part) => part.name === 'name')
  const workoutName = namePart ? namePart.data.toString('utf-8') : filePart.filename || 'CSV Upload'

  let mapping: Record<string, string>
  try {
    mapping = JSON.parse(mappingPart.data.toString('utf-8'))
  } catch (e) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mapping JSON' })
  }

  const csvString = filePart.data.toString('utf-8')

  const parsed = Papa.parse(csvString, { header: true, skipEmptyLines: true })

  if (parsed.errors.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to parse CSV',
      data: parsed.errors
    })
  }

  // arrays
  const time: number[] = []
  const distance: number[] = []
  const velocity: number[] = []
  const heartrate: number[] = []
  const cadence: number[] = []
  const watts: number[] = []
  const altitude: number[] = []
  const lat: number[] = []
  const lng: number[] = []
  const smO2: number[] = []
  const thb: number[] = []
  const vo2: number[] = []
  const respiration: number[] = []

  let maxWatts = 0
  let maxHr = 0

  let totalTime = 0

  // We expect time to be strictly increasing, often starting at 0 or a timestamp.
  // We'll normalize time to start at 0 and represent seconds if possible.
  let startTime = -1

  for (const row of parsed.data as any[]) {
    // extract mapped fields
    const tStr = row[mapping['time'] || '']
    const wStr = row[mapping['watts'] || '']
    const hrStr = row[mapping['heartrate'] || '']
    const smo2Str = row[mapping['smO2'] || '']
    const thbStr = row[mapping['thb'] || '']
    const vo2Str = row[mapping['vo2'] || '']

    // time parsing: could be seconds, or a Date string
    let t = parseFloat(tStr)
    if (isNaN(t)) {
      t = new Date(tStr).getTime() / 1000
    }
    if (isNaN(t)) t = 0

    if (startTime === -1) startTime = t
    const elapsed = Math.round(t - startTime)
    time.push(elapsed)
    totalTime = elapsed

    const w = parseFloat(wStr) || 0
    watts.push(w)
    if (w > maxWatts) maxWatts = w

    const hr = parseFloat(hrStr) || 0
    heartrate.push(hr)
    if (hr > maxHr) maxHr = hr

    smO2.push(parseFloat(smo2Str) || 0)
    thb.push(parseFloat(thbStr) || 0)
    vo2.push(parseFloat(vo2Str) || 0)
  }

  // Create workout and streams
  const dbWorkout = await prisma.workout.create({
    data: {
      userId: user.id,
      title: workoutName,
      date: new Date(),
      source: 'CSV',
      externalId: `csv-${Date.now()}`,
      durationSec: totalTime,
      distanceMeters: 0,
      type: 'OTHER',
      maxWatts: maxWatts,
      maxHr: maxHr,
      streamsV2: {
        create: {
          time,
          watts,
          heartrate,

          distance: [],
          velocity: [],
          cadence: [],
          altitude: [],
          lat: [],
          lng: [],
          moving: [],
          temp: [],
          torque: [],
          leftRightBalance: [],
          hrv: [],
          respiration: [],
          targetPower: []
        }
      }
    }
  })

  return { success: true, workoutId: dbWorkout.id }
})
