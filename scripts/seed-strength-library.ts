import 'dotenv/config'
import { prisma } from '../server/utils/db'

const libraryData = [
  {
    title: 'Barbell Back Squat',
    intent: 'Build maximum lower body strength and muscle mass.',
    movementPattern: 'Squat',
    targetMuscleGroups: ['Quadriceps', 'Glutes', 'Adductors', 'Lower Back'],
    notes:
      'Keep chest up, brace core, and break at the hips and knees simultaneously. Drive through the mid-foot.',
    videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Barbell Front Squat',
    intent: 'Develop anterior chain and upper back strength.',
    movementPattern: 'Squat',
    targetMuscleGroups: ['Quadriceps', 'Core', 'Upper Back'],
    notes: 'Keep elbows high in the front rack position. Maintain an upright torso.',
    videoUrl: 'https://www.youtube.com/watch?v=v-mQsAWEJAs',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Goblet Squat',
    intent: 'Great for beginners to learn squat mechanics and build quad strength.',
    movementPattern: 'Squat',
    targetMuscleGroups: ['Quadriceps', 'Glutes', 'Core'],
    notes: 'Hold a dumbbell or kettlebell vertically against your chest. Push knees out.',
    videoUrl: 'https://www.youtube.com/watch?v=MeIiIdhcXT4',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Bulgarian Split Squat',
    intent: 'Unilateral leg strength, balance, and hypertrophy.',
    movementPattern: 'Lunge',
    targetMuscleGroups: ['Quadriceps', 'Glutes'],
    notes:
      'Elevate rear foot. Drop straight down until front thigh is parallel. Keep front heel planted.',
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Conventional Deadlift',
    intent: 'Maximal posterior chain strength.',
    movementPattern: 'Hinge',
    targetMuscleGroups: ['Hamstrings', 'Glutes', 'Lower Back', 'Lats'],
    notes:
      'Bar over mid-foot. Hinge at hips to grab the bar. Keep back flat, chest up, and drag the bar up your legs.',
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Romanian Deadlift (RDL)',
    intent: 'Targeted hamstring and glute hypertrophy and strength.',
    movementPattern: 'Hinge',
    targetMuscleGroups: ['Hamstrings', 'Glutes'],
    notes:
      'Start from the top. Unlock knees slightly, then push hips back as far as possible until you feel a deep stretch in the hamstrings.',
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Kettlebell Swing',
    intent: 'Explosive hip extension and conditioning.',
    movementPattern: 'Hinge',
    targetMuscleGroups: ['Glutes', 'Hamstrings', 'Core'],
    notes:
      'This is a hinge, not a squat. Snap your hips forward to propel the bell. Arms are just ropes.',
    videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Barbell Bench Press',
    intent: 'Upper body pushing strength.',
    movementPattern: 'Push - Horizontal',
    targetMuscleGroups: ['Pectorals', 'Anterior Deltoids', 'Triceps'],
    notes:
      'Retract scapula, maintain a slight arch, and unrack. Lower bar to mid-chest. Drive feet into the floor.',
    videoUrl: 'https://www.youtube.com/watch?v=rxD321l2svE',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Incline Dumbbell Press',
    intent: 'Upper chest hypertrophy.',
    movementPattern: 'Push - Horizontal',
    targetMuscleGroups: ['Upper Pectorals', 'Anterior Deltoids', 'Triceps'],
    notes: 'Set bench to 30-45 degrees. Press dumbbells up and slightly inward in an arc.',
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Push-up',
    intent: 'Bodyweight pushing strength and core stability.',
    movementPattern: 'Push - Horizontal',
    targetMuscleGroups: ['Pectorals', 'Triceps', 'Core'],
    notes:
      'Keep body in a straight line. Lower until chest nearly touches the floor. Push up to full extension.',
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Strict Overhead Press',
    intent: 'Shoulder strength and overhead stability.',
    movementPattern: 'Push - Vertical',
    targetMuscleGroups: ['Anterior Deltoids', 'Lateral Deltoids', 'Triceps', 'Core'],
    notes:
      'Squeeze glutes and brace core. Press the bar straight up, pushing your head through the "window" at the top.',
    videoUrl: 'https://www.youtube.com/watch?v=QAQ64hK4Xxs',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Pull-up',
    intent: 'Vertical pulling strength.',
    movementPattern: 'Pull - Vertical',
    targetMuscleGroups: ['Lats', 'Biceps', 'Rhomboids'],
    notes: 'Start from a dead hang. Pull chest to the bar by driving elbows down and back.',
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYtlbpU',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Lat Pulldown',
    intent: 'Vertical pulling hypertrophy.',
    movementPattern: 'Pull - Vertical',
    targetMuscleGroups: ['Lats', 'Biceps'],
    notes: 'Lean slightly back. Pull the bar to your upper chest. Control the eccentric.',
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Barbell Row',
    intent: 'Horizontal pulling strength and back thickness.',
    movementPattern: 'Pull - Horizontal',
    targetMuscleGroups: ['Lats', 'Rhomboids', 'Trapezius', 'Erector Spinae'],
    notes:
      'Hinge forward until torso is nearly parallel to the floor. Pull the bar to your lower chest/upper abdomen.',
    videoUrl: 'https://www.youtube.com/watch?v=G8l_8chR5BE',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Single-Arm Dumbbell Row',
    intent: 'Unilateral back hypertrophy.',
    movementPattern: 'Pull - Horizontal',
    targetMuscleGroups: ['Lats', 'Rhomboids', 'Biceps'],
    notes: 'Support non-working side on a bench. Pull the dumbbell to your hip, squeezing the lat.',
    videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Plank',
    intent: 'Core stability.',
    movementPattern: 'Core',
    targetMuscleGroups: ['Rectus Abdominis', 'Transverse Abdominis'],
    notes:
      'Support body on forearms and toes. Keep a straight line from head to heels. Squeeze glutes and core.',
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Hanging Leg Raise',
    intent: 'Lower abdominal strength and hip flexor development.',
    movementPattern: 'Core',
    targetMuscleGroups: ['Rectus Abdominis', 'Hip Flexors'],
    notes:
      'Hang from a pull-up bar. Keeping legs straight (or knees bent to modify), raise legs until parallel to the floor. Avoid swinging.',
    videoUrl: 'https://www.youtube.com/watch?v=prtjFeq5L0c',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Dumbbell Bicep Curl',
    intent: 'Bicep hypertrophy.',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Biceps'],
    notes: 'Keep elbows pinned to your sides. Supinate (turn palms up) as you curl the weight.',
    videoUrl: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Tricep Rope Pushdown',
    intent: 'Tricep hypertrophy.',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Triceps'],
    notes:
      'Keep elbows tucked. Push the rope down and spread the handles apart at the bottom for maximum contraction.',
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Standing Calf Raise',
    intent: 'Gastrocnemius hypertrophy.',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Calves'],
    notes:
      'Get a deep stretch at the bottom. Press up onto the balls of your feet and hold the contraction briefly.',
    videoUrl: 'https://www.youtube.com/watch?v=ymTGtzJb3k8',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  }
]

async function main() {
  console.log('Finding dev user...')

  let user = await prisma.user.findUnique({
    where: { email: 'dev@coachwatts.test' }
  })

  if (!user) {
    user = await prisma.user.findFirst()
    if (!user) {
      console.error('No users found in the database. Please run the user seed script first.')
      process.exit(1)
    }
  }

  console.log('Targeting user: ' + user.email)
  console.log('Seeding strength exercise library...')

  let count = 0
  for (const item of libraryData) {
    const existing = await prisma.strengthExerciseLibraryItem.findFirst({
      where: {
        userId: user.id,
        title: item.title
      }
    })

    if (existing) {
      await prisma.strengthExerciseLibraryItem.update({
        where: { id: existing.id },
        data: item
      })
      console.log('Updated: ' + item.title)
    } else {
      await prisma.strengthExerciseLibraryItem.create({
        data: {
          ...item,
          userId: user.id
        }
      })
      console.log('Created: ' + item.title)
    }
    count++
  }

  console.log('Successfully seeded ' + count + ' exercises to the strength library!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
