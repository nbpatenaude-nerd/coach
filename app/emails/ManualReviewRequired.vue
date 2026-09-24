<script setup lang="ts">
  import {
    EText,
    EContainer,
    EHeading,
    EButton,
    ERow,
    EColumn,
    EHtml,
    EHead,
    EPreview,
    EBody,
    ESection,
    EHr,
    ELink,
    EFont
  } from 'vue-email'

  defineProps<{
    coachName: string
    athleteEmail: string
    reasoning: string
    adjustmentPercentage: number
    checkinDate: string
  }>()

  const main = {
    backgroundColor: '#0a0a0a',
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
  }
  const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '580px'
  }
  const title = {
    fontSize: '24px',
    lineHeight: '1.25',
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center' as const,
    padding: '0 20px',
    letterSpacing: '-0.5px'
  }
  const text = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#a3a3a3',
    padding: '0 20px'
  }
  const textWhite = {
    ...text,
    color: '#ffffff'
  }
  const box = {
    padding: '24px',
    backgroundColor: '#171717',
    borderRadius: '8px',
    border: '1px solid #262626',
    margin: '20px'
  }
  const boxTitle = {
    fontSize: '14px',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    color: '#737373',
    fontWeight: '600',
    margin: '0 0 12px 0'
  }
  const hr = {
    borderColor: '#262626',
    margin: '20px 0'
  }
  const buttonContainer = {
    textAlign: 'center' as const,
    marginTop: '32px'
  }
  const button = {
    backgroundColor: '#e11d48', // rose-600 (warning color)
    borderRadius: '4px',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px'
  }
</script>

<template>
  <EHtml>
    <EHead>
      <EFont
        font-family="Inter"
        fallback-font-family="Helvetica"
        :web-font="{
          url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZJhjp-Ek-_EeA.woff2',
          format: 'woff2'
        }"
        :font-weight="400"
        font-style="normal"
      />
      <EFont
        font-family="Inter"
        fallback-font-family="Helvetica"
        :web-font="{
          url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZJhjp-Ek-_EeA.woff2',
          format: 'woff2'
        }"
        :font-weight="600"
        font-style="normal"
      />
      <EFont
        font-family="Inter"
        fallback-font-family="Helvetica"
        :web-font="{
          url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZJhjp-Ek-_EeA.woff2',
          format: 'woff2'
        }"
        :font-weight="700"
        font-style="normal"
      />
    </EHead>
    <EPreview>Manual Review Required for {{ athleteEmail }}</EPreview>
    <EBody :style="main">
      <EContainer :style="container">
        <!-- Header -->
        <ESection>
          <EHeading :style="title">Manual Review Required</EHeading>
        </ESection>

        <EHr :style="hr" />

        <!-- Message -->
        <ESection>
          <EText :style="textWhite">Hello {{ coachName }},</EText>
          <EText :style="text">
            Your athlete <strong>{{ athleteEmail }}</strong> has submitted a daily check-in that
            flagged a significant need for training adjustment ({{ adjustmentPercentage }}%
            reduction recommended by AI).
          </EText>
          <EText :style="text">
            Because this adjustment exceeds the 20% automation threshold, no changes have been
            automatically made to their planned workouts. Please review their condition and adjust
            their plan manually.
          </EText>
        </ESection>

        <!-- Details Box -->
        <ESection :style="box">
          <EHeading :style="boxTitle">AI Assessment</EHeading>
          <EText :style="textWhite" style="margin-top: 0">
            {{ reasoning }}
          </EText>

          <EHr :style="hr" style="margin: 16px 0" />

          <ERow>
            <EColumn>
              <EText :style="{ ...text, fontSize: '14px', margin: '0' }">Check-in Date</EText>
              <EText
                :style="{ ...textWhite, fontSize: '15px', fontWeight: '500', margin: '4px 0 0' }"
              >
                {{ new Date(checkinDate).toLocaleDateString() }}
              </EText>
            </EColumn>
            <EColumn>
              <EText :style="{ ...text, fontSize: '14px', margin: '0' }">Recommended Adj.</EText>
              <EText
                :style="{ ...textWhite, fontSize: '15px', fontWeight: '500', margin: '4px 0 0' }"
              >
                -{{ adjustmentPercentage }}%
              </EText>
            </EColumn>
          </ERow>
        </ESection>

        <!-- CTA -->
        <ESection :style="buttonContainer">
          <EButton href="https://coachwatts.com/crm/athletes" :style="button">
            Review Athlete Profile
          </EButton>
        </ESection>

        <!-- Footer -->
        <ESection style="margin-top: 48px; text-align: center">
          <EHr :style="hr" />
          <EText style="color: #525252; font-size: 12px">
            Journey Endurance Coaching<br />
            AI-driven insights for elite endurance training
          </EText>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
