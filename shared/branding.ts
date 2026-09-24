/**
 * User-facing product branding. Prefer these constants over hardcoded
 * "Coach Watts" / coachwatts.com strings in UI, email, and Intervals publish.
 *
 * Technical identifiers (Prisma enums like COACH_WATTS, Intervals [CoachWatts]
 * markers, internal component filenames) stay as-is for compatibility.
 */

export const PRODUCT_NAME = 'Journey Endurance'
export const PRODUCT_NAME_COMPACT = 'JourneyEndurance'
export const PRODUCT_TAGLINE = 'AI-powered endurance coaching that adapts to you.'
export const PRODUCT_SITE_URL = 'https://journeyendurance.ca'
export const PRODUCT_ATTRIBUTION = `🔗 ${PRODUCT_SITE_URL} - AI Endurance Coaching`

/** Header written into Intervals.icu activity descriptions when publishing AI summary. */
export const WORKOUT_SUMMARY_BLOCK_HEADER = `${PRODUCT_NAME} Workout Analysis`
