import 'dotenv/config'
import { prisma } from '../server/utils/db'
import { applyStrengthLibraryDefaultsToWorkout } from '../server/utils/strength-exercise-matching'

// Helper to format unique IDs
function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

type SetRowDef = {
  value: string
  loadValue?: string
  restOverride?: string
}

type StepDef = {
  name: string
  notes?: string
  movementPattern?: string
  intent?: string
  prescriptionMode: 'reps' | 'reps_per_side' | 'duration' | 'distance_meters'
  loadMode: 'none' | 'generic' | 'weight_lb' | 'weight_kg' | 'weight_per_side_lb' | 'weight_per_side_kg' | 'rir' | 'percent_1rm'
  defaultRest?: string
  setCount?: number
  value?: string
  loadValue?: string
  setRows?: SetRowDef[]
}

type BlockDef = {
  type: 'warmup' | 'single_exercise' | 'superset' | 'circuit' | 'cooldown'
  title: string
  notes?: string
  durationSec?: number
  steps: StepDef[]
}

function buildStructuredWorkout(blocks: BlockDef[], totalDurationSec = 3600) {
  const structuredBlocks = blocks.map((b, bIdx) => {
    return {
      id: `block-${bIdx + 1}`,
      type: b.type,
      title: b.title,
      notes: b.notes || '',
      durationSec: b.durationSec,
      steps: b.steps.map((s, sIdx) => {
        const setCount = s.setCount || (s.setRows ? s.setRows.length : 3)
        const setRows = s.setRows || Array.from({ length: setCount }, (_, rIdx) => ({
          id: makeId('set'),
          index: rIdx + 1,
          value: s.value || '10',
          loadValue: s.loadValue || '',
          restOverride: ''
        }))

        return {
          id: `step-${bIdx + 1}-${sIdx + 1}`,
          name: s.name,
          videoUrl: '',
          notes: s.notes || '',
          movementPattern: s.movementPattern || '',
          intent: s.intent || '',
          prescriptionMode: s.prescriptionMode,
          loadMode: s.loadMode,
          defaultRest: s.defaultRest || '',
          showRestColumn: false,
          setRows: setRows.map((r, rIdx) => ({
            id: r.id || makeId('set'),
            index: rIdx + 1,
            value: String(r.value || ''),
            loadValue: String(r.loadValue || ''),
            restOverride: String(r.restOverride || '')
          }))
        }
      })
    }
  })

  // Flatten exercises for backward compatibility and quick views
  const flattenedExercises: any[] = []
  for (const block of structuredBlocks) {
    for (const step of block.steps) {
      const setCount = step.setRows.length || 1
      const firstVal = step.setRows[0]?.value || ''
      const firstLoad = step.setRows[0]?.loadValue || ''
      const exerciseObj: any = {
        id: step.id,
        name: step.name,
        group: block.title,
        notes: step.notes,
        movementPattern: step.movementPattern,
        intent: step.intent,
        sets: setCount,
        prescriptionType: step.prescriptionMode,
        weight: firstLoad || undefined,
        rest: step.defaultRest || undefined
      }
      if (step.prescriptionMode === 'duration') {
        exerciseObj.duration = parseInt(firstVal, 10) || 45
      } else {
        exerciseObj.reps = step.prescriptionMode === 'reps_per_side' ? `${firstVal}/side` : firstVal
      }
      flattenedExercises.push(exerciseObj)
    }
  }

  return {
    schemaVersion: 1,
    source: 'TEMPLATE',
    targetUnits: { pace: 'm/s', duration: 'seconds', distance: 'meters' },
    zoneProfileSnapshot: {},
    steps: [],
    blocks: structuredBlocks,
    exercises: flattenedExercises,
    durationSec: totalDurationSec
  }
}

// -------------------------------------------------------------
// STANDARD COMPONENT GENERATORS (Warmup, Mobility, Cooldown)
// -------------------------------------------------------------

function getWarmupBlock(blockNumber: 1 | 2 | 3): BlockDef {
  if (blockNumber === 1) {
    return {
      type: 'warmup',
      title: 'Dynamic Warm-Up (7m)',
      notes: 'Elevate core temperature and prime neuromuscular recruitment with rhythmic movement.',
      durationSec: 420,
      steps: [
        {
          name: 'Jumping Jacks / Light Jump Rope',
          prescriptionMode: 'duration',
          loadMode: 'none',
          setCount: 1,
          value: '60',
          defaultRest: '15s',
          notes: 'Light on feet, rhythmic breathing.'
        },
        {
          name: 'Arm Circles & Shoulder Pass-Throughs',
          prescriptionMode: 'duration',
          loadMode: 'none',
          setCount: 1,
          value: '60',
          defaultRest: '15s',
          notes: 'Full range of motion, open chest and upper back.'
        },
        {
          name: 'High Knees to Butt Kicks',
          prescriptionMode: 'duration',
          loadMode: 'none',
          setCount: 1,
          value: '60',
          defaultRest: '15s',
          notes: 'Dynamic alternating foot turnover.'
        },
        {
          name: 'Inchworm to Cobra Push',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: 1,
          value: '6',
          defaultRest: '20s',
          notes: 'Walk hands forward, drop hips with control, press back up to hamstring stretch.'
        },
        {
          name: 'Bodyweight Air Squats with Reach',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: 1,
          value: '10',
          defaultRest: '30s',
          notes: 'Drive knees out, sink hips, reach arms overhead at bottom.'
        }
      ]
    }
  }

  if (blockNumber === 2) {
    return {
      type: 'warmup',
      title: 'Dynamic Warm-Up (7m)',
      notes: 'Elevate heart rate, activate multi-planar stability and prime tendon elasticity.',
      durationSec: 420,
      steps: [
        {
          name: 'Skater Jumps / Lateral Bounds',
          prescriptionMode: 'duration',
          loadMode: 'none',
          setCount: 1,
          value: '60',
          defaultRest: '15s',
          notes: 'Soft landing on outside leg, load hip and spring laterally.'
        },
        {
          name: 'Band Pull-Aparts & Dislocates',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: 1,
          value: '15',
          loadValue: 'Light Band',
          defaultRest: '15s',
          notes: 'Pinch shoulder blades, maintain neutral ribs.'
        },
        {
          name: 'Cossack Squats (Alternating Side Lunges)',
          prescriptionMode: 'reps_per_side',
          loadMode: 'none',
          setCount: 1,
          value: '6',
          defaultRest: '20s',
          notes: 'Sink deep into lateral hip while keeping trailing heel planted or toes up.'
        },
        {
          name: 'Spiderman Lunge with Hip Lift',
          prescriptionMode: 'reps_per_side',
          loadMode: 'none',
          setCount: 1,
          value: '6',
          defaultRest: '30s',
          notes: 'Deep lunge, rotate elbow to floor and arm to ceiling, extend front knee.'
        }
      ]
    }
  }

  return {
    type: 'warmup',
    title: 'Dynamic Neuromuscular Warm-Up (7m)',
    notes: 'Prime high-threshold motor units and stiffness in the Achilles/ankle complex.',
    durationSec: 420,
    steps: [
      {
        name: 'Pogo Hops & Ankle Springs',
        prescriptionMode: 'duration',
        loadMode: 'none',
        setCount: 2,
        value: '30',
        defaultRest: '15s',
        notes: 'Stiff ankles, quick ground contact, minimal knee bend.'
      },
      {
        name: 'Medicine Ball Chest Pass / Slam',
        prescriptionMode: 'reps',
        loadMode: 'generic',
        setCount: 1,
        value: '10',
        loadValue: '8-12 lb',
        defaultRest: '20s',
        notes: 'Explosive triple extension and upper body intent.'
      },
      {
        name: 'Lateral Shuffle to Deceleration Stick',
        prescriptionMode: 'reps_per_side',
        loadMode: 'none',
        setCount: 1,
        value: '5',
        defaultRest: '20s',
        notes: 'Accelerate 3 steps laterally and freeze in low athletic athletic stance.'
      },
      {
        name: 'Deep Squat Pry with Overhead Reach',
        prescriptionMode: 'reps',
        loadMode: 'none',
        setCount: 1,
        value: '8',
        defaultRest: '30s',
        notes: 'Pry knees wide with elbows, alternate arm reaches overhead.'
      }
    ]
  }
}

function getMobilityBlock(blockNumber: 1 | 2 | 3): BlockDef {
  if (blockNumber === 1) {
    return {
      type: 'warmup',
      title: 'Joint Mobility & Activation (5m)',
      notes: 'Unlock thoracic rotation and activate glute medius/maximus stabilizers.',
      durationSec: 300,
      steps: [
        {
          name: '90/90 Hip Switches',
          prescriptionMode: 'reps_per_side',
          loadMode: 'none',
          setCount: 1,
          value: '8',
          defaultRest: '15s',
          notes: 'Tall spine, rotate hips from left to right without leaning back excessively.'
        },
        {
          name: 'World’s Greatest Stretch',
          prescriptionMode: 'reps_per_side',
          loadMode: 'none',
          setCount: 1,
          value: '5',
          defaultRest: '15s',
          notes: 'Lunge, inside elbow to floor, thoracic rotation upward.'
        },
        {
          name: 'Quadruped Cat-Cow with Thoracic Reach',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: 1,
          value: '8',
          defaultRest: '15s',
          notes: 'Articulate each vertebra; add unilateral thread-the-needle reach.'
        },
        {
          name: 'Mini-Band Glute Bridges',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: 1,
          value: '15',
          loadValue: 'Mini-Band',
          defaultRest: '30s',
          notes: 'Drive through heels, squeeze glutes at top, maintain outward band tension.'
        }
      ]
    }
  }

  if (blockNumber === 2) {
    return {
      type: 'warmup',
      title: 'Joint Mobility & Activation (5m)',
      notes: 'Focus on adductor flexibility, ankle dorsiflexion, and rotary hip control.',
      durationSec: 300,
      steps: [
        {
          name: 'Quadruped Thoracic Rotations',
          prescriptionMode: 'reps_per_side',
          loadMode: 'none',
          setCount: 1,
          value: '8',
          defaultRest: '15s',
          notes: 'Hand behind head, elbow to opposite wrist, rotate open toward ceiling.'
        },
        {
          name: 'Half-Kneeling Adductor Rock-Backs',
          prescriptionMode: 'reps_per_side',
          loadMode: 'none',
          setCount: 1,
          value: '8',
          defaultRest: '15s',
          notes: 'One leg out to side, foot flat, sit hips back toward heel.'
        },
        {
          name: 'Hip 90/90 with Forward Fold',
          prescriptionMode: 'reps_per_side',
          loadMode: 'none',
          setCount: 1,
          value: '6',
          defaultRest: '15s',
          notes: 'Hinge over front lead knee with flat back for deep glute capsule stretch.'
        },
        {
          name: 'Banded Ankle Dorsiflexion Mobilization',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: 1,
          value: '10',
          loadValue: 'Band at Talus',
          defaultRest: '30s',
          notes: 'Drive knee forward over middle toes while keeping heel glued down.'
        }
      ]
    }
  }

  return {
    type: 'warmup',
    title: 'Joint Mobility & Activation (5m)',
    notes: 'Total hip and spine integration before heavy compound loading.',
    durationSec: 300,
    steps: [
      {
        name: 'Brettzel Stretch',
        prescriptionMode: 'duration',
        loadMode: 'none',
        setCount: 1,
        value: '45',
        defaultRest: '15s',
        notes: 'Simultaneously stretch quads/hip flexor and opposite thoracic rotators.'
      },
      {
        name: 'Half-Kneeling Hip Flexor Rock with Overhead Reach',
        prescriptionMode: 'reps_per_side',
        loadMode: 'none',
        setCount: 1,
        value: '8',
        defaultRest: '15s',
        notes: 'Posterior pelvic tilt, glute squeeze, gentle forward glide with side bend.'
      },
      {
        name: 'Thoracic Foam Roller Extension',
        prescriptionMode: 'reps',
        loadMode: 'none',
        setCount: 1,
        value: '10',
        defaultRest: '15s',
        notes: 'Extend back over roller across mid-back; do not flare ribs.'
      },
      {
        name: 'Banded Lateral Ankle Distraction',
        prescriptionMode: 'reps_per_side',
        loadMode: 'generic',
        setCount: 1,
        value: '10',
        loadValue: 'Medium Band',
        defaultRest: '30s',
        notes: 'Dynamic ankle knee bends with lateral traction.'
      }
    ]
  }
}

function getStretchingBlock(blockNumber: 1 | 2 | 3): BlockDef {
  return {
    type: 'cooldown',
    title: 'Stretching & Parasympathetic Downregulation (5m)',
    notes: 'Static passive stretches held for 30-45 seconds to restore resting muscle length and reduce tone.',
    durationSec: 300,
    steps: [
      {
        name: 'Kneeling Couch / Quad & Hip Flexor Stretch',
        prescriptionMode: 'duration',
        loadMode: 'none',
        setCount: 1,
        value: '45',
        defaultRest: '15s',
        notes: 'Rear foot elevated against wall or bench. Squeeze rear glute tightly.'
      },
      {
        name: 'Single-Leg Seated or Standing Hamstring Stretch',
        prescriptionMode: 'duration',
        loadMode: 'none',
        setCount: 1,
        value: '45',
        defaultRest: '15s',
        notes: 'Flat back, hinge from hips, toes pointed up.'
      },
      {
        name: 'Pigeon Pose (Piriformis & Deep Glute)',
        prescriptionMode: 'duration',
        loadMode: 'none',
        setCount: 1,
        value: '45',
        defaultRest: '15s',
        notes: 'Square hips to floor, breathe slowly through the diaphragm.'
      },
      {
        name: 'Wall-Supported Calf & Achilles Stretch (Gastroc & Soleus)',
        prescriptionMode: 'duration',
        loadMode: 'none',
        setCount: 1,
        value: '45',
        defaultRest: '15s',
        notes: 'Stretch straight leg first (Gastroc), then bend rear knee slightly (Soleus).'
      }
    ]
  }
}

// -------------------------------------------------------------
// WORKOUT BUILDERS FOR THE 3 PERIODIZED MESOCYCLES
// -------------------------------------------------------------

interface WorkoutSpec {
  title: string
  description: string
  primarySteps: StepDef[]
  accessorySteps: StepDef[]
}

// Plan 1: 2-Day Split (Full Body A & Full Body B)
function get2DayWorkoutSpecs(blockNum: 1 | 2 | 3, isDeload: boolean): { dayA: WorkoutSpec; dayB: WorkoutSpec } {
  const primarySets = isDeload ? 2 : blockNum === 1 ? 3 : blockNum === 2 ? 3 : 4
  const accessorySets = isDeload ? 2 : 3

  if (blockNum === 1) {
    return {
      dayA: {
        title: 'Full Body A: Squat & Upper Pull Foundation',
        description: 'Focus on bilateral squat mechanics, horizontal pulling strength, unilateral posterior chain control, and anti-rotational core.',
        primarySteps: [
          {
            name: 'Goblet Squat (Dumbbell/Kettlebell)',
            notes: 'Tempo 3-0-1-0. Keep chest proud, elbows tucked, knees tracking toes. RPE 7.',
            movementPattern: 'Squat',
            intent: 'Strength & Hypertrophy',
            prescriptionMode: 'reps',
            loadMode: 'generic',
            setCount: primarySets,
            value: '10',
            loadValue: 'Moderate DB',
            defaultRest: '90s'
          },
          {
            name: 'Single-Arm Dumbbell Row',
            notes: 'Controlled pull to hip crest. Squeeze lats at peak contraction. RPE 7.',
            movementPattern: 'Pull',
            intent: 'Horizontal Pull',
            prescriptionMode: 'reps_per_side',
            loadMode: 'generic',
            setCount: primarySets,
            value: '10',
            loadValue: 'Moderate DB',
            defaultRest: '90s'
          }
        ],
        accessorySteps: [
          {
            name: 'Single-Leg Romanian Deadlift',
            notes: 'Hinge from hip, soft knee on stance leg, reach heel straight back.',
            movementPattern: 'Hinge',
            intent: 'Unilateral Posterior Chain',
            prescriptionMode: 'reps_per_side',
            loadMode: 'generic',
            setCount: accessorySets,
            value: '10',
            loadValue: 'Bodyweight or Light DB',
            defaultRest: '60s'
          },
          {
            name: 'Tempo Push-Up',
            notes: '2-0-1-0 tempo. Elbows at 45 degrees, rigid plank line from head to heels.',
            movementPattern: 'Push',
            intent: 'Upper Push & Core Integration',
            prescriptionMode: 'reps',
            loadMode: 'none',
            setCount: accessorySets,
            value: '10-12',
            defaultRest: '60s'
          },
          {
            name: 'Standing Pallof Press',
            notes: 'Resist cable/band rotation. Hold each press 2 seconds at full extension.',
            movementPattern: 'Core',
            intent: 'Anti-Rotation',
            prescriptionMode: 'reps_per_side',
            loadMode: 'generic',
            setCount: accessorySets,
            value: '10',
            loadValue: 'Light/Medium Band',
            defaultRest: '45s'
          },
          {
            name: 'Forearm Plank',
            notes: 'Full active tension: squeeze glutes, pull elbows toward toes.',
            movementPattern: 'Core',
            intent: 'Anti-Extension',
            prescriptionMode: 'duration',
            loadMode: 'none',
            setCount: accessorySets,
            value: '45',
            defaultRest: '45s'
          }
        ]
      },
      dayB: {
        title: 'Full Body B: Hinge & Upper Push Foundation',
        description: 'Focus on hip hinge recruitment (hamstrings/glutes), overhead pressing stability, single-leg knee dominance, and deep core integration.',
        primarySteps: [
          {
            name: 'Dumbbell Romanian Deadlift (RDL)',
            notes: 'Push hips backward with soft knees, feel intense hamstring tension. Flat back. RPE 7.',
            movementPattern: 'Hinge',
            intent: 'Posterior Chain Hypertrophy',
            prescriptionMode: 'reps',
            loadMode: 'generic',
            setCount: primarySets,
            value: '10',
            loadValue: 'Moderate DBs',
            defaultRest: '90s'
          },
          {
            name: 'Half-Kneeling Single-Arm Dumbbell Overhead Press',
            notes: 'Rear glute engaged, neutral ribs. Press vertically without arching lower back. RPE 7.',
            movementPattern: 'Push',
            intent: 'Vertical Push & Core Control',
            prescriptionMode: 'reps_per_side',
            loadMode: 'generic',
            setCount: primarySets,
            value: '10',
            loadValue: 'Moderate DB',
            defaultRest: '90s'
          }
        ],
        accessorySteps: [
          {
            name: 'Dumbbell Reverse Lunges',
            notes: 'Step back with control, 90-degree bend in both knees, push through front heel.',
            movementPattern: 'Squat',
            intent: 'Unilateral Knee Dominance',
            prescriptionMode: 'reps_per_side',
            loadMode: 'generic',
            setCount: accessorySets,
            value: '10',
            loadValue: 'Light/Mod DBs',
            defaultRest: '60s'
          },
          {
            name: 'Lat Pulldown or Band-Assisted Pull-Up',
            notes: 'Depress scapulae, pull bar to upper chest, slow eccentric return.',
            movementPattern: 'Pull',
            intent: 'Vertical Pull Strength',
            prescriptionMode: 'reps',
            loadMode: 'generic',
            setCount: accessorySets,
            value: '10',
            loadValue: 'Moderate Load',
            defaultRest: '60s'
          },
          {
            name: 'Deadbug with Controlled Pause',
            notes: 'Opposite arm and leg extend, lower back pressed flat into floor throughout.',
            movementPattern: 'Core',
            intent: 'Anti-Extension',
            prescriptionMode: 'reps_per_side',
            loadMode: 'none',
            setCount: accessorySets,
            value: '8',
            defaultRest: '45s'
          },
          {
            name: 'Side Plank with Top Leg Lift',
            notes: 'Elevate hips, engage quadratus lumborum and glute medius.',
            movementPattern: 'Core',
            intent: 'Lateral Core & Hip Abduction',
            prescriptionMode: 'duration',
            loadMode: 'none',
            setCount: accessorySets,
            value: '30',
            defaultRest: '45s'
          }
        ]
      }
    }
  }

  if (blockNum === 2) {
    return {
      dayA: {
        title: 'Full Body A: Front Squat & Heavy Horizontal Row',
        description: 'Progressing loading on knee-dominant pattern, building functional hypertrophy in thoracic back, and challenging unilateral stability.',
        primarySteps: [
          {
            name: 'Barbell Front Squat or Dumbbell Box Squat',
            notes: 'Elbows high, vertical torso, full depth. RPE 7.5-8. Rest 120s between sets.',
            movementPattern: 'Squat',
            intent: 'Quad & Anterior Core Strength',
            prescriptionMode: 'reps',
            loadMode: 'generic',
            setCount: primarySets,
            value: '8',
            loadValue: 'Moderate-Heavy',
            defaultRest: '120s'
          },
          {
            name: 'Chest-Supported Dumbbell Row',
            notes: 'Bench at 30 degrees. Pull elbows back, 1 second isometric hold at top. RPE 7.5.',
            movementPattern: 'Pull',
            intent: 'Upper Back Hypertrophy',
            prescriptionMode: 'reps',
            loadMode: 'generic',
            setCount: primarySets,
            value: '8',
            loadValue: 'Moderate-Heavy DBs',
            defaultRest: '90s'
          }
        ],
        accessorySteps: [
          {
            name: 'Bulgarian Split Squat (Rear Foot Elevated)',
            notes: 'Front shin vertical to slightly forward, drive out of bottom with front glute/quad.',
            movementPattern: 'Squat',
            intent: 'Unilateral Force Production',
            prescriptionMode: 'reps_per_side',
            loadMode: 'generic',
            setCount: accessorySets,
            value: '8',
            loadValue: 'Moderate DBs',
            defaultRest: '75s'
          },
          {
            name: 'Flat Dumbbell Bench Press',
            notes: 'Retract scapulae, press in slight arc, controlled 2-second lowering.',
            movementPattern: 'Push',
            intent: 'Horizontal Push Hypertrophy',
            prescriptionMode: 'reps',
            loadMode: 'generic',
            setCount: accessorySets,
            value: '8',
            loadValue: 'Moderate DBs',
            defaultRest: '75s'
          },
          {
            name: 'Half-Kneeling Cable / Band Woodchopper',
            notes: 'High to low diagonal chop. Hips stay square, rotation comes from upper torso.',
            movementPattern: 'Core',
            intent: 'Rotational Strength',
            prescriptionMode: 'reps_per_side',
            loadMode: 'generic',
            setCount: accessorySets,
            value: '10',
            loadValue: 'Moderate Cable/Band',
            defaultRest: '45s'
          },
          {
            name: 'Copenhagen Side Plank',
            notes: 'Top foot supported on bench. Deep adductor and lateral core engagement.',
            movementPattern: 'Core',
            intent: 'Adductor & Pelvic Stability',
            prescriptionMode: 'duration',
            loadMode: 'none',
            setCount: accessorySets,
            value: '25',
            defaultRest: '45s'
          }
        ]
      },
      dayB: {
        title: 'Full Body B: Trap Bar Deadlift & Overhead Press',
        description: 'Progressing posterior chain power with Trap Bar, vertical shoulder strength, hamstring tendon stiffness, and asymmetric carries.',
        primarySteps: [
          {
            name: 'Trap Bar Deadlift',
            notes: 'Pack lats, wedge hips into bar, drive floor away with maximal intent. RPE 7.5-8.',
            movementPattern: 'Hinge',
            intent: 'Maximum Posterior Chain Force',
            prescriptionMode: 'reps',
            loadMode: 'generic',
            setCount: primarySets,
            value: '8',
            loadValue: 'Moderate-Heavy Trap Bar',
            defaultRest: '120s'
          },
          {
            name: 'Standing Dumbbell Overhead Press',
            notes: 'Standing tall, glutes locked, press overhead to biceps by ears. RPE 7.5.',
            movementPattern: 'Push',
            intent: 'Vertical Push & Shoulder Health',
            prescriptionMode: 'reps',
            loadMode: 'generic',
            setCount: primarySets,
            value: '8',
            loadValue: 'Moderate DBs',
            defaultRest: '90s'
          }
        ],
        accessorySteps: [
          {
            name: 'Single-Leg Romanian Deadlift (with Dumbbell)',
            notes: 'Opposite hand holds DB. Hips stay level to the floor, full glute extension at top.',
            movementPattern: 'Hinge',
            intent: 'Single-Leg Hamstring & Glute Strength',
            prescriptionMode: 'reps_per_side',
            loadMode: 'generic',
            setCount: accessorySets,
            value: '8',
            loadValue: 'Moderate DB',
            defaultRest: '75s'
          },
          {
            name: 'Neutral Grip Chin-Up or Heavy Lat Pulldown',
            notes: 'Palms facing each other. Full dead-hang to chin clearing bar.',
            movementPattern: 'Pull',
            intent: 'Vertical Pull Strength',
            prescriptionMode: 'reps',
            loadMode: 'none',
            setCount: accessorySets,
            value: '6-8',
            defaultRest: '75s'
          },
          {
            name: 'Hanging Knee Raise or Captain’s Chair Raise',
            notes: 'Roll pelvis upward at top of movement, avoid swinging momentum.',
            movementPattern: 'Core',
            intent: 'Anterior Core & Hip Flexor Control',
            prescriptionMode: 'reps',
            loadMode: 'none',
            setCount: accessorySets,
            value: '10',
            defaultRest: '45s'
          },
          {
            name: 'Suitcase Carry (Single-Arm Dumbbell Walk)',
            notes: 'Keep shoulders perfectly level, walk with smooth controlled heel-to-toe stride.',
            movementPattern: 'Core',
            intent: 'Anti-Lateral Flexion & Grip',
            prescriptionMode: 'distance_meters',
            loadMode: 'generic',
            setCount: accessorySets,
            value: '30',
            loadValue: 'Heavy DB/Kettlebell',
            defaultRest: '60s'
          }
        ]
      }
    }
  }

  // Block 3: Weeks 9-12
  return {
    dayA: {
      title: 'Full Body A: Heavy Squat & Explosive Power Transfer',
      description: 'Peak maximum strength and rate of force development for endurance athletes. Heavy low-rep squats, heavy rows, and loaded core carries.',
      primarySteps: [
        {
          name: 'Barbell Back Squat or Heavy Box Squat',
          notes: 'High bar or low bar. 4 sets of 5-6 reps at RPE 8-8.5. Rest 150s. High intent out of the hole.',
          movementPattern: 'Squat',
          intent: 'Maximum Leg Strength',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '6',
          loadValue: 'Heavy Barbell',
          defaultRest: '150s'
        },
        {
          name: 'Barbell Bent-Over Row (Pendlay Row)',
          notes: 'Torso parallel to floor, explode bar to lower ribcage, reset on floor between reps. RPE 8.',
          movementPattern: 'Pull',
          intent: 'Maximum Horizontal Pull & Posterior Chain',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '6',
          loadValue: 'Heavy Barbell',
          defaultRest: '120s'
        }
      ],
      accessorySteps: [
        {
          name: 'Dumbbell Step-Up (to 16-18” Box)',
          notes: 'Drive through lead foot only; do not bounce off rear toe. Explosive step up.',
          movementPattern: 'Squat',
          intent: 'Unilateral Power & Running Stride Drive',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '6',
          loadValue: 'Heavy DBs',
          defaultRest: '75s'
        },
        {
          name: 'Incline Dumbbell Bench Press',
          notes: '30-degree incline, full stretch at bottom, press up and slightly back.',
          movementPattern: 'Push',
          intent: 'Upper Body Force Transfer',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '6-8',
          loadValue: 'Heavy DBs',
          defaultRest: '75s'
        },
        {
          name: 'Heavy Farmer’s Carry (Trap Bar or Two Dumbbells)',
          notes: 'Stand tall, retracted scapulae, quick deliberate footsteps. Core locked.',
          movementPattern: 'Core',
          intent: 'Full Body Work Capacity & Postural Stiffness',
          prescriptionMode: 'distance_meters',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '40',
          loadValue: 'Heavy Load',
          defaultRest: '90s'
        },
        {
          name: 'Ab Wheel Rollout or Barbell Rollout',
          notes: 'Full hollow body position, roll out as far as lower back stability allows, pull back with lats.',
          movementPattern: 'Core',
          intent: 'High-Level Anti-Extension',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: accessorySets,
          value: '8',
          defaultRest: '60s'
        }
      ]
    },
    dayB: {
      title: 'Full Body B: Heavy Deadlift & Push Press',
      description: 'Maximum hip extension power, overhead kinetic chain transfer, and dynamic rotational trunk stability.',
      primarySteps: [
        {
          name: 'Conventional Barbell Deadlift or Heavy Trap Bar Deadlift',
          notes: '4 sets of 5 reps at RPE 8-8.5. Rest 150s. Explosive hip drive, controlled lowering.',
          movementPattern: 'Hinge',
          intent: 'Maximal Posterior Chain Power',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '5',
          loadValue: 'Heavy Barbell',
          defaultRest: '150s'
        },
        {
          name: 'Barbell Push Press (Triple Extension Drive)',
          notes: 'Dip 2-3 inches, explode through legs and drive bar overhead. Lower with control.',
          movementPattern: 'Push',
          intent: 'Kinetic Chain Power Transfer',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '5',
          loadValue: 'Heavy Barbell',
          defaultRest: '120s'
        }
      ],
      accessorySteps: [
        {
          name: 'Heavy Barbell Romanian Deadlift (RDL)',
          notes: '3 sets of 6 reps, deep eccentric hamstring load with 3-second lowering.',
          movementPattern: 'Hinge',
          intent: 'Hamstring Stiffness & Resilience',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '6',
          loadValue: 'Heavy Barbell',
          defaultRest: '90s'
        },
        {
          name: 'Weighted Pull-Up or Strict Chin-Up',
          notes: 'Add weight plate or dumbbell between feet. Full range of motion.',
          movementPattern: 'Pull',
          intent: 'Vertical Pull Strength',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '5-6',
          loadValue: 'Bodyweight + Load',
          defaultRest: '90s'
        },
        {
          name: 'Half-Kneeling Pallof Hold with Band Pulse',
          notes: 'Hold press at full extension, add 10 small rapid micro-pulses per rep.',
          movementPattern: 'Core',
          intent: 'High-Demand Anti-Rotation Stability',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '6',
          loadValue: 'Heavy Band',
          defaultRest: '45s'
        },
        {
          name: 'Strict Hanging Toes-to-Bar or Leg Raise',
          notes: 'No swing. Pike hips and bring toes cleanly to bar or ninety degrees.',
          movementPattern: 'Core',
          intent: 'Hip Flexor & Anterior Core Strength',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: accessorySets,
          value: '8-10',
          defaultRest: '60s'
        }
      ]
    }
  }
}

// Plan 2: 3-Day Split (Day 1: Squat/Push, Day 2: Hinge/Pull, Day 3: Unilateral & Core Power)
function get3DayWorkoutSpecs(blockNum: 1 | 2 | 3, isDeload: boolean): { day1: WorkoutSpec; day2: WorkoutSpec; day3: WorkoutSpec } {
  const base2 = get2DayWorkoutSpecs(blockNum, isDeload)
  const primarySets = isDeload ? 2 : blockNum === 1 ? 3 : blockNum === 2 ? 3 : 4
  const accessorySets = isDeload ? 2 : 3

  let day3: WorkoutSpec
  if (blockNum === 1) {
    day3 = {
      title: 'Full Body 3: Unilateral Stability & Functional Core',
      description: 'Dedicated single-leg strength, multi-planar core endurance, and injury-prevention stabilizers for endurance athletes.',
      primarySteps: [
        {
          name: 'Bulgarian Split Squat',
          notes: 'Elevate rear foot on bench. Controlled descent, driving through front foot heel and midfoot.',
          movementPattern: 'Squat',
          intent: 'Unilateral Knee Dominance',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: primarySets,
          value: '10',
          loadValue: 'Light/Mod DBs',
          defaultRest: '90s'
        },
        {
          name: 'Inverted Bodyweight Row (TRX or Barbell)',
          notes: 'Rigid plank body line, pull chest to handles/bar, pause 1 second at top.',
          movementPattern: 'Pull',
          intent: 'Horizontal Scapular Pull',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: primarySets,
          value: '10',
          defaultRest: '90s'
        }
      ],
      accessorySteps: [
        {
          name: 'Kettlebell Swings (Hip Hinge Power)',
          notes: 'Sharp hip snap, float kettlebell to chest height, tight glutes at top.',
          movementPattern: 'Hinge',
          intent: 'Posterior Chain Explosive Endurance',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '15',
          loadValue: 'Moderate Kettlebell',
          defaultRest: '60s'
        },
        {
          name: 'Dumbbell Push-Up with Row (Renegade Row)',
          notes: 'Wide foot stance for pelvic stability. Row DB to hip without tilting torso.',
          movementPattern: 'Core',
          intent: 'Anti-Rotation & Upper Integration',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '8',
          loadValue: 'Light/Mod DBs',
          defaultRest: '60s'
        },
        {
          name: 'Bird-Dog with 3-Second Iso Hold',
          notes: 'Reach opposite arm and leg long, squeeze glute without hyperextending back.',
          movementPattern: 'Core',
          intent: 'Rotary Stability & Posterior Sling',
          prescriptionMode: 'reps_per_side',
          loadMode: 'none',
          setCount: accessorySets,
          value: '8',
          defaultRest: '45s'
        },
        {
          name: 'Dumbbell Farmer’s Carry',
          notes: 'Grip tight, tall posture, rhythmic steady gait.',
          movementPattern: 'Core',
          intent: 'Total Trunk Stiffness & Grip Endurance',
          prescriptionMode: 'distance_meters',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '40',
          loadValue: 'Moderate DBs',
          defaultRest: '60s'
        }
      ]
    }
  } else if (blockNum === 2) {
    day3 = {
      title: 'Full Body 3: Hip Thrust & Single-Leg Power',
      description: 'Maximal glute force transfer, dynamic single-leg strength, and rotational trunk power.',
      primarySteps: [
        {
          name: 'Barbell or Dumbbell Hip Thrust',
          notes: 'Shoulders on bench, drive hips up to full horizontal extension, chin tucked.',
          movementPattern: 'Hinge',
          intent: 'Glute Hypertrophy & Extension Power',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '8',
          loadValue: 'Moderate-Heavy',
          defaultRest: '120s'
        },
        {
          name: 'Landmine Single-Arm Push Press',
          notes: 'Dip hips and drive press through one arm. Dynamic athletic transfer.',
          movementPattern: 'Push',
          intent: 'Multi-Joint Overhead Transfer',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: primarySets,
          value: '8',
          loadValue: 'Landmine Bar + Plates',
          defaultRest: '90s'
        }
      ],
      accessorySteps: [
        {
          name: 'Single-Leg Box Squat (Pistol Progression)',
          notes: 'Sit back to 16” box on single leg, touch lightly, stand up without rocking.',
          movementPattern: 'Squat',
          intent: 'Unilateral Quadricep & Hip Force',
          prescriptionMode: 'reps_per_side',
          loadMode: 'none',
          setCount: accessorySets,
          value: '6',
          defaultRest: '75s'
        },
        {
          name: 'Single-Arm Cable Row with Torso Rotation',
          notes: 'Allow slight reach forward on stretch, row back with lat drive and thoracic rotation.',
          movementPattern: 'Pull',
          intent: 'Functional Posterior Sling',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '8',
          loadValue: 'Moderate Cable',
          defaultRest: '60s'
        },
        {
          name: 'Pallof Press with Overhead Arc',
          notes: 'Press band out from chest, raise overhead without leaning or arching ribs.',
          movementPattern: 'Core',
          intent: 'Anti-Rotation & Overhead Core Stability',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '8',
          loadValue: 'Medium Band',
          defaultRest: '45s'
        },
        {
          name: 'Swiss Ball Stir-the-Pot',
          notes: 'Forearms on ball in plank. Make small controlled circles (8 clockwise, 8 counter-clockwise).',
          movementPattern: 'Core',
          intent: 'Dynamic Anti-Extension',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: accessorySets,
          value: '8/dir',
          defaultRest: '60s'
        }
      ]
    }
  } else {
    day3 = {
      title: 'Full Body 3: Explosive Athletic Power & Capacity',
      description: 'Maximum rate of force development, explosive hip hinge mechanics, and high-load unilateral performance.',
      primarySteps: [
        {
          name: 'Trap Bar Jump Shrug or Explosive High Pull',
          notes: '4 sets of 4 reps with light-moderate load. Maximum velocity and triple extension intent.',
          movementPattern: 'Hinge',
          intent: 'Rate of Force Development',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '4',
          loadValue: 'Moderate Load (Velocity Intent)',
          defaultRest: '120s'
        },
        {
          name: 'Heavy Bulgarian Split Squat (Dumbbells)',
          notes: '4 sets of 5 reps per side. Pure unilateral force production into the floor.',
          movementPattern: 'Squat',
          intent: 'Peak Unilateral Strength',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: primarySets,
          value: '5',
          loadValue: 'Heavy DBs',
          defaultRest: '120s'
        }
      ],
      accessorySteps: [
        {
          name: 'Single-Arm Dumbbell Power Snatch',
          notes: 'Floor to overhead in one fluid explosive motion. Catch with soft knees.',
          movementPattern: 'Hinge',
          intent: 'Full Body Power Transfer',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '5',
          loadValue: 'Moderate-Heavy DB',
          defaultRest: '75s'
        },
        {
          name: 'Push-Up to Dumbbell T-Spine Rotation',
          notes: 'Strict push up, rotate into side plank with DB pressed to ceiling.',
          movementPattern: 'Push',
          intent: 'Rotational Shoulder Stability',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '6',
          loadValue: 'Light/Mod DB',
          defaultRest: '60s'
        },
        {
          name: 'Heavy Suitcase Carry (Asymmetric Walk)',
          notes: 'One heavy dumbbell. Maintain dead-vertical posture, resist lateral side bend.',
          movementPattern: 'Core',
          intent: 'Anti-Lateral Flexion',
          prescriptionMode: 'distance_meters',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '35',
          loadValue: 'Heavy DB',
          defaultRest: '60s'
        },
        {
          name: 'Side Plank with Cable Row',
          notes: 'Hold side plank facing cable tower, row cable to ribs while maintaining rigid hip bridge.',
          movementPattern: 'Core',
          intent: 'Lateral Sling Integration',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '8',
          loadValue: 'Light Cable',
          defaultRest: '45s'
        }
      ]
    }
  }

  return {
    day1: base2.dayA,
    day2: base2.dayB,
    day3
  }
}

// Plan 3: 4-Day Split (Day 1: Lower Squat, Day 2: Upper Push/Pull, Day 3: Lower Hinge, Day 4: Upper Stability & Carries)
function get4DayWorkoutSpecs(blockNum: 1 | 2 | 3, isDeload: boolean): { day1: WorkoutSpec; day2: WorkoutSpec; day3: WorkoutSpec; day4: WorkoutSpec } {
  const p3 = get3DayWorkoutSpecs(blockNum, isDeload)
  const primarySets = isDeload ? 2 : blockNum === 1 ? 3 : blockNum === 2 ? 3 : 4
  const accessorySets = isDeload ? 2 : 3

  // Distinct Day 4 for Upper Posture, Scapular Strength & Aerobic Core
  let day4: WorkoutSpec
  if (blockNum === 1) {
    day4 = {
      title: 'Upper Body B: Scapular Health & Trunk Endurance',
      description: 'Endurance postural stability, rotator cuff conditioning, vertical pulling and loaded carries.',
      primarySteps: [
        {
          name: 'Dumbbell Neutral-Grip Incline Press',
          notes: '30-degree incline, smooth 3-second lowering, elbows tucked at 45 degrees.',
          movementPattern: 'Push',
          intent: 'Upper Chest & Front Delt Strength',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '10',
          loadValue: 'Moderate DBs',
          defaultRest: '90s'
        },
        {
          name: 'Half-Kneeling Lat Pulldown / Band Pull',
          notes: 'Pull down to collarbones, focus on lat activation and serratus anterior engagement.',
          movementPattern: 'Pull',
          intent: 'Vertical Pulling Mechanics',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '10',
          loadValue: 'Moderate Band/Cable',
          defaultRest: '90s'
        }
      ],
      accessorySteps: [
        {
          name: 'Prone Y-T-W Scapular Raises',
          notes: 'Face down on incline bench. 6 reps of Y, 6 reps of T, 6 reps of W per set.',
          movementPattern: 'Pull',
          intent: 'Lower Trapezius & Rotator Cuff Health',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: accessorySets,
          value: '6 each',
          defaultRest: '60s'
        },
        {
          name: 'Half-Kneeling Landmine Press',
          notes: 'Press up and forward in natural shoulder arc. Keep glutes engaged.',
          movementPattern: 'Push',
          intent: 'Scapulohumeral Rhythm',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '10',
          loadValue: 'Landmine Bar',
          defaultRest: '60s'
        },
        {
          name: 'Bear Crawl Hold (Quadruped Hover)',
          notes: 'Knees hovering 1 inch off floor under hips, flat back, push floor away through palms.',
          movementPattern: 'Core',
          intent: 'Anterior Core & Shoulder Stability',
          prescriptionMode: 'duration',
          loadMode: 'none',
          setCount: accessorySets,
          value: '40',
          defaultRest: '45s'
        },
        {
          name: 'Dumbbell Waiter’s Walk (Overhead Carry)',
          notes: 'One arm extended overhead with dumbbell. Lock ribcage, walk with steady pace.',
          movementPattern: 'Core',
          intent: 'Overhead Stability & Asymmetric Control',
          prescriptionMode: 'distance_meters',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '30',
          loadValue: 'Light/Mod DB',
          defaultRest: '60s'
        }
      ]
    }
  } else if (blockNum === 2) {
    day4 = {
      title: 'Upper Body B: Vertical Press/Pull & Rotator Integrity',
      description: 'Overhead strength, heavy neutral chin-ups, posterior shoulder resilience, and core anti-rotation.',
      primarySteps: [
        {
          name: 'Seated Dumbbell Overhead Press',
          notes: 'Upright bench. Press overhead without hyperextending lumbar spine. RPE 7.5.',
          movementPattern: 'Push',
          intent: 'Vertical Push Strength',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '8',
          loadValue: 'Moderate-Heavy DBs',
          defaultRest: '120s'
        },
        {
          name: 'Neutral-Grip Pull-Up (or Band-Assisted)',
          notes: '3-second eccentric lowering on every rep. Build pull-up capacity for swimming/cycling.',
          movementPattern: 'Pull',
          intent: 'Vertical Pull Strength & Hypertrophy',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: primarySets,
          value: '6-8',
          defaultRest: '120s'
        }
      ],
      accessorySteps: [
        {
          name: 'Face Pulls with External Rotation',
          notes: 'Cable at eye level, pull to forehead, rotate hands backward into high double biceps.',
          movementPattern: 'Pull',
          intent: 'Rear Delt & Infraspinatus Strength',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '12',
          loadValue: 'Moderate Cable',
          defaultRest: '60s'
        },
        {
          name: 'Dumbbell Incline Bench Row (Batwing Row)',
          notes: 'Pause 2 seconds at top contraction squeezing shoulder blades hard against ribcage.',
          movementPattern: 'Pull',
          intent: 'Scapular Retraction Stamina',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '8',
          loadValue: 'Moderate DBs',
          defaultRest: '60s'
        },
        {
          name: 'Kettlebell Windmill',
          notes: 'Lock bell overhead, hinge hips out to 45 degrees, slide free hand down shin.',
          movementPattern: 'Core',
          intent: 'Thoracic Mobility & Oblique Stability',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '6',
          loadValue: 'Light/Mod KB',
          defaultRest: '60s'
        },
        {
          name: 'Overhead + Suitcase Carry (Cross-Body Carry)',
          notes: 'One dumbbell overhead, one heavier dumbbell at side. Ultimate anti-rotational challenge.',
          movementPattern: 'Core',
          intent: 'Complex Core Stiffness',
          prescriptionMode: 'distance_meters',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '30',
          loadValue: 'Light + Heavy DB',
          defaultRest: '60s'
        }
      ]
    }
  } else {
    day4 = {
      title: 'Upper Body B: Power Transfer & Armor Building',
      description: 'Maximum scapular drive, push-press power transfer, and anti-extension trunk rigidity under load.',
      primarySteps: [
        {
          name: 'Standing Barbell Push Press',
          notes: '4 sets of 5 reps at RPE 8. Dip hips smoothly and launch bar overhead.',
          movementPattern: 'Push',
          intent: 'Kinetic Chain Power Transfer',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '5',
          loadValue: 'Heavy Barbell',
          defaultRest: '150s'
        },
        {
          name: 'Weighted Chin-Up or Heavy Lat Pulldown',
          notes: '4 sets of 5 reps. Full stretch at bottom, clear chin over bar.',
          movementPattern: 'Pull',
          intent: 'Peak Vertical Pull Force',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: primarySets,
          value: '5',
          loadValue: 'Heavy Load',
          defaultRest: '120s'
        }
      ],
      accessorySteps: [
        {
          name: 'Dumbbell Arnold Press',
          notes: 'Rotate from palms facing chest to palms forward overhead. Smooth continuous control.',
          movementPattern: 'Push',
          intent: 'Deltoid Multi-Angle Strength',
          prescriptionMode: 'reps',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '6-8',
          loadValue: 'Moderate-Heavy DBs',
          defaultRest: '75s'
        },
        {
          name: 'Half-Kneeling Single-Arm Cable High-To-Low Row',
          notes: 'Heavy rotary pull to hip crest, stabilizing stance with rear glute.',
          movementPattern: 'Pull',
          intent: 'Lat & Transverse Core Synergy',
          prescriptionMode: 'reps_per_side',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '6',
          loadValue: 'Heavy Cable',
          defaultRest: '60s'
        },
        {
          name: 'Heavy Farmer’s Walk to Overhead Lockout (Complex)',
          notes: 'Walk 20m with heavy DBs, clean to shoulders, press and walk 10m overhead.',
          movementPattern: 'Core',
          intent: 'High-Demand Metabolic Strength Endurance',
          prescriptionMode: 'distance_meters',
          loadMode: 'generic',
          setCount: accessorySets,
          value: '30',
          loadValue: 'Heavy DBs',
          defaultRest: '90s'
        },
        {
          name: 'Dragon Flag Progression or Decline Reverse Crunch',
          notes: 'Keep straight line from shoulders to toes, lower with 3-second eccentric control.',
          movementPattern: 'Core',
          intent: 'Peak Anterior Core Force',
          prescriptionMode: 'reps',
          loadMode: 'none',
          setCount: accessorySets,
          value: '6-8',
          defaultRest: '60s'
        }
      ]
    }
  }

  return {
    day1: p3.day1,
    day2: p3.day2,
    day3: p3.day3,
    day4
  }
}

// -------------------------------------------------------------
// MAIN SEED EXECUTION
// -------------------------------------------------------------

async function main() {
  console.log('🚀 Starting generation of 12-Week Progressive Strength Training Plans...')

  // 1. Locate user
  const user = await prisma.user.findUnique({
    where: { email: 'info@trinerds.com' },
    select: { id: true, email: true, name: true }
  })
  if (!user) {
    console.error('❌ User info@trinerds.com not found!')
    process.exit(1)
  }
  const libraryExercises = await prisma.strengthExerciseLibraryItem.findMany()

  console.log(`✅ Found user: ${user.name} (${user.email}) - ID: ${user.id}`)

  // 2. Ensure TrainingPlanFolder exists
  let planFolder = await prisma.trainingPlanFolder.findFirst({
    where: { userId: user.id, name: 'Strength Plans' }
  })

  if (!planFolder) {
    planFolder = await prisma.trainingPlanFolder.create({
      data: {
        userId: user.id,
        name: 'Strength Plans',
        order: 1
      }
    })
    console.log(`📁 Created TrainingPlanFolder: "Strength Plans" (${planFolder.id})`)
  } else {
    console.log(`📁 Using existing TrainingPlanFolder: "Strength Plans" (${planFolder.id})`)
  }

  // 3. Ensure WorkoutTemplateFolder exists
  let templateFolder = await prisma.workoutTemplateFolder.findFirst({
    where: { userId: user.id, name: '12-Week Progressive Strength Collection' }
  })

  if (!templateFolder) {
    templateFolder = await prisma.workoutTemplateFolder.create({
      data: {
        userId: user.id,
        name: '12-Week Progressive Strength Collection',
        order: 1
      }
    })
    console.log(`📁 Created WorkoutTemplateFolder: "12-Week Progressive Strength Collection" (${templateFolder.id})`)
  } else {
    console.log(`📁 Using existing WorkoutTemplateFolder: (${templateFolder.id})`)
  }

  // 4. Define the 3 plans metadata
  const plansConfig = [
    {
      daysPerWeek: 2,
      name: '12-Week Progressive Strength (2 Days/Week) - Base Phase',
      slug: '12-week-progressive-strength-2-days-base',
      difficulty: 5,
      days: [1, 4], // Tuesday (1) & Friday (4)
      description: 'A 12-week progressive strength training plan for endurance athletes in the base building phase, running 2 days per week (approx. 60 minutes/session). Structured into 3 four-week progressive mesocycles: Block 1 develops anatomical adaptation and motor control; Block 2 progresses to functional hypertrophy and unilateral force; Block 3 peaks maximum strength and power transfer. Each workout features 5-10m dynamic warm-up, 5m mobility, primary compound work, accessory/core work, and 5m stretching.',
      headline: 'Full-Body Foundation & Injury Resilience for Busy Endurance Athletes'
    },
    {
      daysPerWeek: 3,
      name: '12-Week Progressive Strength (3 Days/Week) - Base Phase',
      slug: '12-week-progressive-strength-3-days-base',
      difficulty: 6,
      days: [0, 2, 4], // Monday (0), Wednesday (2), Friday (4)
      description: 'A 12-week progressive strength training plan for endurance athletes in the base building phase, running 3 days per week (approx. 60 minutes/session). Structured into 3 four-week progressive mesocycles covering squat/push focus, hinge/pull focus, and unilateral power/core stability. Designed to build athletic durability, running economy, and cycling threshold torque without interfering with aerobic base volume.',
      headline: 'Comprehensive 3-Day Undulating Strength & Power Transfer Blueprint'
    },
    {
      daysPerWeek: 4,
      name: '12-Week Progressive Strength (4 Days/Week) - Base Phase',
      slug: '12-week-progressive-strength-4-days-base',
      difficulty: 7,
      days: [0, 1, 3, 4], // Monday (0), Tuesday (1), Thursday (3), Friday (4)
      description: 'An advanced 12-week progressive strength training plan for dedicated endurance athletes, running 4 days per week (approx. 60 minutes/session). Structured into Upper/Lower specialization to optimize recovery between heavy aerobic sessions. Features progressive 4-week mesocycles from foundational hypertrophy to high-threshold maximum force development.',
      headline: 'Dedicated Upper/Lower Periodization for Maximum Strength & Tendon Stiffness'
    }
  ]

  const createdTemplateTitles = new Set<string>()

  // 5. Build and save each plan
  for (const config of plansConfig) {
    console.log(`\n⚙️ Building plan: ${config.name}...`)

    // Check if plan with this name already exists for this user; remove or overwrite cleanly
    const existingPlan = await prisma.trainingPlan.findFirst({
      where: { userId: user.id, name: config.name }
    })

    if (existingPlan) {
      console.log(`  Overwriting existing plan (${existingPlan.id})...`)
      await prisma.trainingPlan.delete({ where: { id: existingPlan.id } })
    }

    // Create the TrainingPlan
    const plan = await prisma.trainingPlan.create({
      data: {
        userId: user.id,
        folderId: planFolder.id,
        name: config.name,
        slug: `${config.slug}-${Date.now()}`,
        description: config.description,
        publicHeadline: config.headline,
        isTemplate: true,
        strategy: 'BLOCK',
        status: 'ACTIVE',
        visibility: 'PRIVATE',
        accessState: 'PRIVATE',
        primarySport: 'Strength',
        sportSubtype: 'Base Building',
        skillLevel: config.daysPerWeek === 2 ? 'Beginner' : config.daysPerWeek === 3 ? 'Intermediate' : 'Advanced',
        daysPerWeek: config.daysPerWeek,
        difficulty: config.difficulty,
        recoveryRhythm: 4,
        methodology: 'Tri-Phase Progressive Periodization for Endurance: Anatomical Adaptation (W1-4), Functional Hypertrophy (W5-8), Maximum Strength & Power Transfer (W9-12).',
        whoItsFor: 'Endurance runners, cyclists, and triathletes seeking injury prevention, improved biomechanical economy, and peak force capacity during the base building season.'
      }
    })

    console.log(`  ✅ Created TrainingPlan: ${plan.id}`)

    // Blocks definition (3 Blocks of 4 Weeks)
    const blockMeta = [
      {
        order: 1,
        name: 'Block 1: Anatomical Adaptation & Movement Grooving (Weeks 1-4)',
        type: 'BASE',
        primaryFocus: 'Anatomical Adaptation',
        durationWeeks: 4,
        description: 'Establish foundational movement patterns, tendon/connective tissue tolerance, and baseline functional hypertrophy. Week 4 is a deload.'
      },
      {
        order: 2,
        name: 'Block 2: Functional Hypertrophy & Unilateral Force (Weeks 5-8)',
        type: 'BUILD',
        primaryFocus: 'Functional Hypertrophy',
        durationWeeks: 4,
        description: 'Progress exercise complexity and intensity. Emphasize unilateral balance, single-leg stability, and core rigidity. Week 8 is a deload.'
      },
      {
        order: 3,
        name: 'Block 3: Maximum Strength & Power Transfer (Weeks 9-12)',
        type: 'PEAK',
        primaryFocus: 'Maximum Strength',
        durationWeeks: 4,
        description: 'Peak neural drive and rate of force development (RFD). Heavy compound loads with full rest to maximize running economy and cycling power without hypertrophy fatigue.'
      }
    ]

    for (const bMeta of blockMeta) {
      const block = await prisma.trainingBlock.create({
        data: {
          trainingPlanId: plan.id,
          order: bMeta.order,
          name: bMeta.name,
          type: bMeta.type,
          primaryFocus: bMeta.primaryFocus,
          description: bMeta.description,
          durationWeeks: bMeta.durationWeeks,
          startDate: new Date(0)
        }
      })

      const blockNum = bMeta.order as 1 | 2 | 3
      const warmup = getWarmupBlock(blockNum)
      const mobility = getMobilityBlock(blockNum)
      const stretching = getStretchingBlock(blockNum)

      // 4 Weeks per Block
      for (let wIdx = 1; wIdx <= 4; wIdx++) {
        const globalWeekNumber = (blockNum - 1) * 4 + wIdx
        const isDeload = wIdx === 4

        const week = await prisma.trainingWeek.create({
          data: {
            blockId: block.id,
            weekNumber: wIdx,
            volumeTargetMinutes: config.daysPerWeek * 60,
            tssTarget: config.daysPerWeek * (isDeload ? 30 : 45),
            isRecovery: isDeload,
            focus: isDeload
              ? `Week ${globalWeekNumber}: Deload & Recovery`
              : `Week ${globalWeekNumber}: ${bMeta.primaryFocus} Progression`,
            startDate: new Date(0),
            endDate: new Date(0)
          }
        })

        // Generate workouts for this week
        let specs: WorkoutSpec[] = []
        if (config.daysPerWeek === 2) {
          const s = get2DayWorkoutSpecs(blockNum, isDeload)
          specs = [s.dayA, s.dayB]
        } else if (config.daysPerWeek === 3) {
          const s = get3DayWorkoutSpecs(blockNum, isDeload)
          specs = [s.day1, s.day2, s.day3]
        } else {
          const s = get4DayWorkoutSpecs(blockNum, isDeload)
          specs = [s.day1, s.day2, s.day3, s.day4]
        }

        for (let dIdx = 0; dIdx < config.days.length; dIdx++) {
          const dayIndex = config.days[dIdx]!
          const spec = specs[dIdx]!

          const workoutBlocks: BlockDef[] = [
            warmup,
            mobility,
            {
              type: 'single_exercise',
              title: 'Primary Strength & Hypertrophy Work',
              notes: isDeload
                ? 'Deload Week: Maintain crisp movement quality and load, reduce set volume by 33% to promote supercompensation.'
                : 'Primary compound work. Focus on controlled tempo (3-0-1-0 on descent), full athletic range of motion, and 2-3 reps in reserve (RIR).',
              steps: spec.primarySteps
            },
            {
              type: 'superset',
              title: 'Accessory & Core Stability',
              notes: 'Complete as paired supersets with 60s rest between movements. Emphasize pelvic stability and anti-rotational stiffness.',
              steps: spec.accessorySteps
            },
            stretching
          ]

          const baseStructuredWorkout = buildStructuredWorkout(workoutBlocks, 3600)
          
          // Apply matching to inject library IDs and video URLs
          const { structuredWorkout } = await applyStrengthLibraryDefaultsToWorkout({
            structuredWorkout: baseStructuredWorkout,
            libraryExercises,
            userId: user.id,
            entityType: 'Seed',
            entityId: plan.id,
            operation: 'seed-strength-plans'
          })
          
          const workoutTitle = `${spec.title} (W${globalWeekNumber})`

          // Create PlannedWorkout in the week
          await prisma.plannedWorkout.create({
            data: {
              userId: user.id,
              trainingWeekId: week.id,
              externalId: `pw-strength-${plan.id}-w${globalWeekNumber}-d${dayIndex}`,
              date: new Date(0),
              dayIndex: dayIndex,
              weekIndex: globalWeekNumber,
              title: workoutTitle,
              description: spec.description,
              type: 'WeightTraining',
              category: 'Strength',
              durationSec: 3600,
              tss: isDeload ? 30 : 45,
              workIntensity: isDeload ? 0.65 : 0.78,
              structuredWorkout: structuredWorkout as any
            }
          })

          // Also save as reusable WorkoutTemplate in Strength Library (once per unique template title)
          const templateKey = `${spec.title} - ${bMeta.name.split(':')[0]}`
          if (!createdTemplateTitles.has(templateKey)) {
            createdTemplateTitles.add(templateKey)

            // Check if template already exists
            const existingTemplate = await prisma.workoutTemplate.findFirst({
              where: { userId: user.id, title: templateKey }
            })

            if (existingTemplate) {
              console.log(`  Overwriting template: ${templateKey}`)
              await prisma.workoutTemplate.delete({ where: { id: existingTemplate.id } })
            }

            await prisma.workoutTemplate.create({
              data: {
                userId: user.id,
                folderId: templateFolder.id,
                title: templateKey,
                description: `${spec.description} Designed for ${bMeta.name}.`,
                type: 'WeightTraining',
                sport: 'Strength',
                category: 'Strength',
                durationSec: 3600,
                tss: 45,
                workIntensity: 0.75,
                tags: ['Endurance Strength', 'Base Building', `Block ${blockNum}`, `${config.daysPerWeek} Days/Wk`],
                isPublic: false,
                structuredWorkout: structuredWorkout as any
              }
            })
          }
        }
      }
    }
  }

  console.log(`\n🎉 Successfully built and published all 3 Plans and ${createdTemplateTitles.size} Workout Templates!`)
  process.exit(0)
}

main().catch((err) => {
  console.error('❌ Failed to create strength plans:', err)
  process.exit(1)
})
