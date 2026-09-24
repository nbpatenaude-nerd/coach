import { requireAuth } from '../../utils/auth-guard'
import {
  getActiveCheckInForm,
  parseFormDefinition
} from '../../utils/services/weeklyCheckInService'

export default defineEventHandler(async (event) => {
  await requireAuth(event, [])
  const form = await getActiveCheckInForm()
  const definition = parseFormDefinition(form.sections)

  return {
    id: form.id,
    slug: form.slug,
    title: form.title,
    description: form.description,
    version: form.version,
    sections: definition.sections
  }
})
