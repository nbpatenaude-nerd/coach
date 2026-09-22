<script setup lang="ts">
  import {
    EText,
    EContainer,
    EHeading,
    EButton,
    EHtml,
    EHead,
    EPreview,
    EBody,
    ESection,
    EImg,
    ELink,
    EFont
  } from 'vue-email'

  withDefaults(
    defineProps<{
      name?: string
      dayLabel: string
      deadlineHint: string
      checkInUrl: string
      siteUrl?: string
      logoUrl?: string
      unsubscribeUrl?: string
      utmQuery?: string
    }>(),
    {
      siteUrl: 'https://journeyendurance.com',
      logoUrl: 'https://journeyendurance.com/icon.png'
    }
  )
</script>

<template>
  <EHtml lang="en">
    <EHead>
      <EFont
        font-family="Public Sans"
        fallback-font-family="sans-serif"
        :web-font="{
          url: 'https://fonts.gstatic.com/s/publicsans/v14/ijwQs572Xtc6ZYQws9YVwnNGfJ4.woff2',
          format: 'woff2'
        }"
        :font-weight="400"
        font-style="normal"
      />
    </EHead>
    <EPreview
      >It’s {{ dayLabel }} — complete your weekly check-in {{ deadlineHint }} so your coach can
      review it.</EPreview
    >
    <EBody
      style="
        background-color: #f4f4f5;
        font-family:
          'Public Sans',
          Inter,
          -apple-system,
          BlinkMacSystemFont,
          'Segoe UI',
          Roboto,
          sans-serif;
        margin: 0;
        padding: 0;
      "
    >
      <EContainer style="margin: 0 auto; padding: 32px 16px; max-width: 560px">
        <ESection style="text-align: center; margin-bottom: 24px">
          <EImg :src="logoUrl" alt="Journey Endurance" width="48" height="48" />
        </ESection>
        <ESection
          style="
            background-color: #ffffff;
            border-radius: 12px;
            padding: 32px 28px;
            border: 1px solid #e4e4e7;
          "
        >
          <EHeading
            as="h1"
            style="
              font-size: 22px;
              font-weight: 700;
              color: #18181b;
              margin: 0 0 12px;
              line-height: 1.3;
            "
          >
            Weekly check-in reminder
          </EHeading>
          <EText style="font-size: 15px; color: #3f3f46; line-height: 1.55; margin: 0 0 16px">
            Hi {{ name || 'Athlete' }}, it’s {{ dayLabel }}. Take a few minutes to rate your
            training, health, and personal week {{ deadlineHint }}.
          </EText>
          <EText style="font-size: 15px; color: #3f3f46; line-height: 1.55; margin: 0 0 24px">
            Your coach uses these answers alongside your data when they record your weekly feedback
            video.
          </EText>
          <EButton
            :href="`${checkInUrl}${utmQuery || ''}`"
            style="
              background-color: #00a8ff;
              color: #ffffff;
              font-size: 14px;
              font-weight: 600;
              padding: 12px 20px;
              border-radius: 8px;
              text-decoration: none;
              display: inline-block;
            "
          >
            Open check-in
          </EButton>
        </ESection>
        <ESection style="margin-top: 24px; text-align: center">
          <EText style="font-size: 12px; color: #a1a1aa; margin: 0">
            <ELink :href="siteUrl" style="color: #a1a1aa; text-decoration: underline"
              >Journey Endurance</ELink
            >
            <template v-if="unsubscribeUrl">
              ·
              <ELink :href="unsubscribeUrl" style="color: #a1a1aa; text-decoration: underline"
                >Unsubscribe</ELink
              >
            </template>
          </EText>
        </ESection>
      </EContainer>
    </EBody>
  </EHtml>
</template>
