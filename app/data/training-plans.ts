export type TrainingPlanCategory = 'running' | 'triathlon' | 'cycling' | 'strength'

export interface TrainingPlan {
  id: string
  title: string
  category: TrainingPlanCategory
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration: string // e.g., '12 Weeks'
  hoursPerWeek: string // e.g., '5-7 hours/week'
  description: string
  trainingPeaksUrl: string
  image?: string // Optional cover image
}

export const trainingPlans: TrainingPlan[] = [
  {
    id: 'hyrox-race-ready',
    title: 'Hyrox Race Ready',
    category: 'strength',
    level: 'Intermediate',
    duration: '12 Weeks',
    hoursPerWeek: '4-6 hours/week',
    description:
      'Master the art of compromised running and functional strength through a program designed to turn your first HYROX race into an epic “Hero’s Journey.”',
    trainingPeaksUrl:
      'https://www.trainingpeaks.com/training-plans/other/fitness/tp-608329/12-week-hyrox-training-5k-to-hyrox',
    image: '/images/plans/hyrox.png'
  },
  {
    id: 'sprint-triathlon-starter',
    title: 'Sprint Triathlon Starter',
    category: 'triathlon',
    level: 'Beginner',
    duration: '6 Weeks',
    hoursPerWeek: '3-5 hours/week',
    description:
      'Turn your curiosity into a finish line with a structured, walk-run supported guide designed to lead the “tri-curious” through their first Sprint or Super-Sprint triathlon.',
    trainingPeaksUrl:
      'https://www.trainingpeaks.com/training-plans/triathlon/sprint/tp-570972/triathlon-starter-base-6-week-intro-to-tri',
    image: '/images/plans/triathlon.png'
  },
  {
    id: '10k-heros-ascent',
    title: '10K: The Hero’s Ascent',
    category: 'running',
    level: 'Intermediate',
    duration: '12 Weeks',
    hoursPerWeek: '4-6 hours/week',
    description:
      'Reclaim your peak performance and sharpen your speed through a 10-week cycle of high-intensity intervals, hill strength, and data-driven testing.',
    trainingPeaksUrl:
      'https://www.trainingpeaks.com/training-plans/running/10km/tp-450986/12-week-10k-the-heros-ascent',
    image: '/images/plans/10k.png'
  },
  {
    id: 'learn-to-run',
    title: 'Learn to Run',
    category: 'running',
    level: 'Beginner',
    duration: '12 Weeks',
    hoursPerWeek: '2-3 hours/week',
    description:
      'Discover your potential and build a sustainable running habit with this free, accessible 12-week Walk:Run program designed for the absolute beginner.',
    trainingPeaksUrl:
      'https://www.trainingpeaks.com/training-plans/running/10km/tp-514018/free-the-first-mile-a-free-guide-to-starting-your-journey',
    image: '/images/plans/learn_run.png'
  }
]
