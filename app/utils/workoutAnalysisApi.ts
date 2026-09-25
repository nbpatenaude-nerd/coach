export type WorkoutAnalysisScope = { kind: 'athlete' } | { kind: 'coach'; athleteId: string }

export function createWorkoutAnalysisApi(workoutId: string, scope: WorkoutAnalysisScope) {
  const base =
    scope.kind === 'coach'
      ? `/api/coaching/athletes/${scope.athleteId}/workouts/${workoutId}`
      : `/api/workouts/${workoutId}`

  return {
    workout: (query?: Record<string, string | boolean | number>) => ({
      url: base as string,
      query: query || (scope.kind === 'athlete' ? { includeStreams: false } : undefined)
    }),
    streams: () => `${base}/streams`,
    segmentSummary: () => `${base}/segment-summary`,
    powerCurve: () => `${base}/power-curve`,
    intervals: () => `${base}/intervals`,
    exportGpx: () =>
      scope.kind === 'coach' ? `${base}/export/gpx` : `/api/workouts/${workoutId}/export/gpx`
  }
}
