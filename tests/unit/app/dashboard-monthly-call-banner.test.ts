// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import MonthlyCallBanner from '../../../app/components/dashboard/MonthlyCallBanner.vue'

let mockQuery: Record<string, string> = {}
let mockCurrentDate = new Date(Date.UTC(2026, 8, 26)) // Sep 26, 2026 (September has 30 days -> last week is 24-30)

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: mockQuery
  })
}))

vi.mock('~/composables/useFormat', () => ({
  useFormat: () => ({
    getUserLocalDate: () => mockCurrentDate
  })
}))

vi.mock('@tolgee/vue', () => ({
  useTranslate: () => ({
    t: (key: string, fallback?: string) => fallback || key
  })
}))

const mockToastAdd = vi.fn()
vi.stubGlobal('useToast', () => ({
  add: mockToastAdd
}))

describe('MonthlyCallBanner', () => {
  beforeEach(() => {
    localStorage.clear()
    mockQuery = {}
    mockCurrentDate = new Date(Date.UTC(2026, 8, 26))
    mockToastAdd.mockReset()
  })

  it('renders during the last week of the month', () => {
    mockCurrentDate = new Date(Date.UTC(2026, 8, 26)) // Sep 26 (last week)
    const wrapper = mount(MonthlyCallBanner, {
      global: {
        stubs: {
          UIcon: { template: '<i />' },
          UBadge: { template: '<span><slot /></span>' },
          UButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>'
          },
          DashboardBookingModal: { template: '<div class="booking-modal-stub" />' },
          Teleport: true
        }
      }
    })

    expect(wrapper.text()).toContain('Monthly Coaching Call')
    expect(wrapper.text()).toContain('September')
    expect(wrapper.text()).toContain('Book a Call')
  })

  it('does not render outside the last week of the month', () => {
    mockCurrentDate = new Date(Date.UTC(2026, 8, 5)) // Sep 5 (not last week)
    const wrapper = mount(MonthlyCallBanner, {
      global: {
        stubs: {
          UIcon: { template: '<i />' },
          UBadge: { template: '<span><slot /></span>' },
          UButton: { template: '<button><slot /></button>' },
          DashboardBookingModal: true,
          Teleport: true
        }
      }
    })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Monthly Coaching Call')
  })

  it('renders outside last week if showMonthlyBanner query override is provided', () => {
    mockCurrentDate = new Date(Date.UTC(2026, 8, 5)) // Sep 5
    mockQuery = { showMonthlyBanner: '1' }
    const wrapper = mount(MonthlyCallBanner, {
      global: {
        stubs: {
          UIcon: { template: '<i />' },
          UBadge: { template: '<span><slot /></span>' },
          UButton: { template: '<button><slot /></button>' },
          DashboardBookingModal: true,
          Teleport: true
        }
      }
    })

    expect(wrapper.text()).toContain('Monthly Coaching Call')
    expect(wrapper.text()).toContain('Book a Call')
  })

  it('hides banner when dismissed and persists to localStorage', async () => {
    mockCurrentDate = new Date(Date.UTC(2026, 8, 26))
    const wrapper = mount(MonthlyCallBanner, {
      global: {
        stubs: {
          UIcon: { template: '<i />' },
          UBadge: { template: '<span><slot /></span>' },
          UButton: {
            template: '<button @click="$emit(\'click\')"><slot /></button>'
          },
          DashboardBookingModal: true,
          Teleport: true
        }
      }
    })

    const buttons = wrapper.findAll('button')
    // Second button is dismiss
    const dismissBtn = buttons[1]
    await dismissBtn.trigger('click')

    expect(localStorage.getItem('monthly-call-banner-dismissed-2026-9')).toBe('true')
    expect(wrapper.text()).not.toContain('Monthly Coaching Call')
  })
})
