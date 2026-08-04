# 288 — Several pages duplicate the product name in document titles

**Priority:** Low  
**Type:** UI / Metadata  
**Status:** Fixed  
**Area:** `feed, library, coaching, metadata`

## Summary

Several pages supply `Journey Endurance Coaching Platform` in their local/default title even though the global title template appends the product name. Titles therefore duplicate the brand and some routes lose a meaningful page name entirely.

## Actual Behavior

- `/feed`: `Activity Feed | Journey Endurance Coaching Platform - Journey Endurance Coaching Platform`
- `/library/workouts`, `/library/exercises`, and `/library/plans`: `Journey Endurance Coaching Platform - Journey Endurance Coaching Platform`
- `/coaching/calendar`: `Journey Endurance Coaching Platform - Journey Endurance Coaching Platform`

## Affected Files

- `app/pages/feed.vue` (`useHead`, lines 185–193)
- Library page metadata/default title handling
- `app/pages/coaching/calendar.vue`

## Suggested Fix

Give each route a concise page-local title and allow the global title template to add the brand once.

## Acceptance Criteria

- [x] The browser title contains the product name once.
- [x] The title follows the same separator convention as other authenticated pages.
- [x] Library and Coaching Calendar titles identify the current page rather than only the product.
