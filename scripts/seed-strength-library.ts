import 'dotenv/config'
import { prisma } from '../server/utils/db'

const libraryData = [
  // CHEST
  {
    title: 'Barbell Bench Press',
    movementPattern: 'Push - Horizontal',
    targetMuscleGroups: [
      'Primary: Pectoralis Major (Sternal)',
      'Secondary: Anterior Deltoid',
      'Secondary: Triceps Brachii'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=rxD321l2svE',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Incline Barbell Bench Press',
    movementPattern: 'Push - Horizontal',
    targetMuscleGroups: [
      'Primary: Pectoralis Major (Clavicular)',
      'Secondary: Anterior Deltoid',
      'Secondary: Triceps Brachii'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=SrqOu55lrOU',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Dumbbell Flyes',
    movementPattern: 'Isolation',
    targetMuscleGroups: [
      'Primary: Pectoralis Major (Sternal)',
      'Secondary: Anterior Deltoid',
      'Secondary: Biceps Brachii (Short Head)'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=eozdVDA78K0',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Push-up',
    movementPattern: 'Push - Horizontal',
    targetMuscleGroups: [
      'Primary: Pectoralis Major (Sternal)',
      'Secondary: Anterior Deltoid',
      'Secondary: Triceps Brachii',
      'Secondary: Rectus Abdominis'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Cable Crossover',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Primary: Pectoralis Major (Sternal)', 'Secondary: Anterior Deltoid'],
    videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },

  // BACK
  {
    title: 'Pull-up',
    movementPattern: 'Pull - Vertical',
    targetMuscleGroups: [
      'Primary: Latissimus Dorsi',
      'Secondary: Brachialis',
      'Secondary: Brachioradialis',
      'Secondary: Biceps Brachii',
      'Secondary: Teres Major'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYtlbpU',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Chin-up',
    movementPattern: 'Pull - Vertical',
    targetMuscleGroups: [
      'Primary: Latissimus Dorsi',
      'Secondary: Biceps Brachii',
      'Secondary: Brachialis',
      'Secondary: Teres Major'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=brhRXlOhsAM',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Barbell Row',
    movementPattern: 'Pull - Horizontal',
    targetMuscleGroups: [
      'Primary: Back, General',
      'Secondary: Latissimus Dorsi',
      'Secondary: Rhomboids',
      'Secondary: Trapezius',
      'Secondary: Erector Spinae'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=G8l_8chR5BE',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Single-Arm Dumbbell Row',
    movementPattern: 'Pull - Horizontal',
    targetMuscleGroups: [
      'Primary: Latissimus Dorsi',
      'Secondary: Rhomboids',
      'Secondary: Trapezius (Middle)',
      'Secondary: Brachialis'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=pYcpY20QaE8',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Lat Pulldown',
    movementPattern: 'Pull - Vertical',
    targetMuscleGroups: [
      'Primary: Latissimus Dorsi',
      'Secondary: Brachialis',
      'Secondary: Biceps Brachii',
      'Secondary: Teres Major'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Seated Cable Row',
    movementPattern: 'Pull - Horizontal',
    targetMuscleGroups: [
      'Primary: Back, General',
      'Secondary: Rhomboids',
      'Secondary: Latissimus Dorsi',
      'Secondary: Trapezius (Middle)'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },

  // SHOULDERS
  {
    title: 'Strict Overhead Press (Barbell)',
    movementPattern: 'Push - Vertical',
    targetMuscleGroups: [
      'Primary: Anterior Deltoid',
      'Secondary: Lateral Deltoid',
      'Secondary: Triceps Brachii',
      'Secondary: Trapezius (Upper)',
      'Secondary: Serratus Anterior'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=QAQ64hK4Xxs',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Seated Dumbbell Press',
    movementPattern: 'Push - Vertical',
    targetMuscleGroups: [
      'Primary: Anterior Deltoid',
      'Secondary: Lateral Deltoid',
      'Secondary: Triceps Brachii'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=qEwKCR5JCog',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Dumbbell Lateral Raise',
    movementPattern: 'Isolation',
    targetMuscleGroups: [
      'Primary: Lateral Deltoid',
      'Secondary: Anterior Deltoid',
      'Secondary: Trapezius (Upper)',
      'Secondary: Supraspinatus'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Reverse Pec Deck (Rear Delt Fly)',
    movementPattern: 'Isolation',
    targetMuscleGroups: [
      'Primary: Posterior Deltoid',
      'Secondary: Infraspinatus',
      'Secondary: Teres Minor',
      'Secondary: Trapezius (Middle)',
      'Secondary: Rhomboids'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=WzXEXq1wFis',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Face Pull',
    movementPattern: 'Pull - Horizontal',
    targetMuscleGroups: [
      'Primary: Posterior Deltoid',
      'Secondary: Infraspinatus',
      'Secondary: Trapezius (Middle)',
      'Secondary: Rhomboids'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },

  // LEGS - QUADS
  {
    title: 'Barbell Back Squat',
    movementPattern: 'Squat',
    targetMuscleGroups: [
      'Primary: Quadriceps',
      'Secondary: Gluteus Maximus',
      'Secondary: Adductor Magnus',
      'Secondary: Soleus',
      'Secondary: Erector Spinae'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=bEv6CCg2BC8',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Barbell Front Squat',
    movementPattern: 'Squat',
    targetMuscleGroups: [
      'Primary: Quadriceps',
      'Secondary: Gluteus Maximus',
      'Secondary: Erector Spinae',
      'Secondary: Rectus Abdominis'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=v-mQsAWEJAs',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Leg Press',
    movementPattern: 'Squat',
    targetMuscleGroups: [
      'Primary: Quadriceps',
      'Secondary: Gluteus Maximus',
      'Secondary: Adductor Magnus'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjW7OSvc',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Bulgarian Split Squat',
    movementPattern: 'Lunge',
    targetMuscleGroups: [
      'Primary: Quadriceps',
      'Secondary: Gluteus Maximus',
      'Secondary: Adductor Magnus',
      'Secondary: Soleus'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=2C-uNgKwPLE',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Walking Lunges',
    movementPattern: 'Lunge',
    targetMuscleGroups: [
      'Primary: Quadriceps',
      'Secondary: Gluteus Maximus',
      'Secondary: Adductor Magnus',
      'Secondary: Soleus'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=L8fvypPrzzs',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },
  {
    title: 'Leg Extension',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Primary: Quadriceps'],
    videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },

  // LEGS - POSTERIOR CHAIN
  {
    title: 'Conventional Deadlift',
    movementPattern: 'Hinge',
    targetMuscleGroups: [
      'Primary: Gluteus Maximus',
      'Secondary: Hamstrings',
      'Secondary: Erector Spinae',
      'Secondary: Quadriceps',
      'Secondary: Adductor Magnus'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=op9kVnSso6Q',
    prescriptionMode: 'Target',
    defaultRest: '180s'
  },
  {
    title: 'Romanian Deadlift (RDL)',
    movementPattern: 'Hinge',
    targetMuscleGroups: [
      'Primary: Hamstrings',
      'Secondary: Gluteus Maximus',
      'Secondary: Erector Spinae',
      'Secondary: Adductor Magnus'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Barbell Hip Thrust',
    movementPattern: 'Hinge',
    targetMuscleGroups: [
      'Primary: Gluteus Maximus',
      'Secondary: Hamstrings',
      'Secondary: Quadriceps',
      'Secondary: Adductor Magnus'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=xDoeT96Qf3M',
    prescriptionMode: 'Target',
    defaultRest: '120s'
  },
  {
    title: 'Seated Leg Curl',
    movementPattern: 'Isolation',
    targetMuscleGroups: [
      'Primary: Hamstrings',
      'Secondary: Gastrocnemius',
      'Secondary: Sartorius',
      'Secondary: Gracilis'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=Orxowest56U',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Kettlebell Swing',
    movementPattern: 'Hinge',
    targetMuscleGroups: [
      'Primary: Gluteus Maximus',
      'Secondary: Hamstrings',
      'Secondary: Erector Spinae',
      'Secondary: Core'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=YSxHifyI6s8',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },

  // CALVES
  {
    title: 'Standing Calf Raise',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Primary: Gastrocnemius', 'Secondary: Soleus'],
    videoUrl: 'https://www.youtube.com/watch?v=ymTGtzJb3k8',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Seated Calf Raise',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Primary: Soleus', 'Secondary: Gastrocnemius'],
    videoUrl: 'https://www.youtube.com/watch?v=JbyjNymZOt0',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },

  // ARMS - BICEPS
  {
    title: 'Barbell Curl',
    movementPattern: 'Isolation',
    targetMuscleGroups: [
      'Primary: Biceps Brachii',
      'Secondary: Brachialis',
      'Secondary: Brachioradialis'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Dumbbell Hammer Curl',
    movementPattern: 'Isolation',
    targetMuscleGroups: [
      'Primary: Brachioradialis',
      'Secondary: Brachialis',
      'Secondary: Biceps Brachii'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Incline Dumbbell Curl',
    movementPattern: 'Isolation',
    targetMuscleGroups: [
      'Primary: Biceps Brachii (Long Head)',
      'Secondary: Brachialis',
      'Secondary: Brachioradialis'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=soxrZlIl35U',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },

  // ARMS - TRICEPS
  {
    title: 'Tricep Rope Pushdown',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Primary: Triceps Brachii', 'Secondary: Anconeus'],
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Overhead Tricep Extension (Dumbbell)',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Primary: Triceps Brachii (Long Head)', 'Secondary: Anconeus'],
    videoUrl: 'https://www.youtube.com/watch?v=_gsUck-7M74',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Skullcrushers (Lying Tricep Extension)',
    movementPattern: 'Isolation',
    targetMuscleGroups: ['Primary: Triceps Brachii', 'Secondary: Anconeus'],
    videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
    prescriptionMode: 'Target',
    defaultRest: '90s'
  },

  // CORE
  {
    title: 'Plank',
    movementPattern: 'Core',
    targetMuscleGroups: [
      'Primary: Rectus Abdominis',
      'Secondary: Transverse Abdominis',
      'Secondary: Obliques',
      'Secondary: Erector Spinae'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=ASdvN_XEl_c',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Hanging Leg Raise',
    movementPattern: 'Core',
    targetMuscleGroups: [
      'Primary: Iliopsoas (Hip Flexors)',
      'Secondary: Rectus Abdominis',
      'Secondary: Obliques'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=prtjFeq5L0c',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Ab Wheel Rollout',
    movementPattern: 'Core',
    targetMuscleGroups: [
      'Primary: Rectus Abdominis',
      'Secondary: Transverse Abdominis',
      'Secondary: Latissimus Dorsi',
      'Secondary: Pectoralis Major'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=rqiQqdCrtYM',
    prescriptionMode: 'Target',
    defaultRest: '60s'
  },
  {
    title: 'Cable Woodchopper',
    movementPattern: 'Core',
    targetMuscleGroups: [
      'Primary: Obliques',
      'Secondary: Rectus Abdominis',
      'Secondary: Transverse Abdominis'
    ],
    videoUrl: 'https://www.youtube.com/watch?v=p4M3qsEKE_8',
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
  }

  console.log('Targeting user: ' + user.email)
  console.log('Seeding extensive EXRX-based strength exercise library...')

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

  console.log('Successfully seeded ' + count + ' extensive exercises to the strength library!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
