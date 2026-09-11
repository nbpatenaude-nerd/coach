import sys
import re

with open('app/components/workouts/planned/StrengthExercisesEditor.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace block header
pattern = re.compile(r'<div class="border-b border-default/70 bg-muted/20 px-4 py-4 sm:px-5">\s*<div\s*class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"\s*>\s*<div class="min-w-0 flex-1 space-y-3">\s*<div class="flex flex-wrap items-center gap-2">\s*<UBadge color="primary" variant="soft" size="sm" class="uppercase tracking-wide">\s*\{\{ blockTypeLabel\(block\.type\) \}\}\s*</UBadge>\s*<div class="text-xs uppercase tracking-\[0\.18em\] text-muted">\s*\{\{ block\.steps\.length \}\} exercise\{\{ block\.steps\.length === 1 \? \'\' : \'s\' \}\}\s*</div>\s*</div>\s*<div class="grid gap-3 sm:grid-cols-\[minmax\(0,1fr\)_160px\]">\s*<UInput v-model="block\.title" size="lg" placeholder="Block title" />\s*<UInput\s*v-model\.number="block\.durationSec"\s*type="number"\s*min="0"\s*placeholder="Block duration \(s\)"\s*/>\s*</div>\s*<UTextarea\s*v-model="block\.notes"\s*:rows="2"\s*autoresize\s*placeholder="Block notes or coach instructions\.\.\."\s*/>\s*</div>\s*<div class="flex flex-wrap gap-2">')

replacement = '''<div class="border-b border-default/70 bg-muted/20 px-4 py-4 sm:px-5">
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <UBadge color="primary" variant="soft" size="sm" class="uppercase tracking-wide">
                  {{ blockTypeLabel(block.type) }}
                </UBadge>
                <div class="text-xs uppercase tracking-[0.18em] text-muted">
                  {{ block.steps.length }} exercise{{ block.steps.length === 1 ? '' : 's' }}
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">'''

content, count = pattern.subn(replacement, content)
print(f"Replaced header: {count} times")

pattern2 = re.compile(r'Delete Block\s*</UButton>\s*</div>\s*</div>\s*</div>')
replacement2 = '''Delete Block
              </UButton>
            </div>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <UInput v-model="block.title" size="lg" placeholder="Block title" class="flex-1" />
            <UInput
              v-model.number="block.durationSec"
              type="number"
              min="0"
              size="lg"
              placeholder="Block duration (s)"
              class="w-full sm:w-48"
            />
          </div>

          <UTextarea
            v-model="block.notes"
            :rows="2"
            autoresize
            placeholder="Block notes or coach instructions..."
          />
        </div>
      </div>'''

content, count2 = pattern2.subn(replacement2, content)
print(f"Replaced tail: {count2} times")

content = content.replace('<col v-if="step.loadMode !== \'none\'" style="width: 220px" />', '<col v-if="step.loadMode !== \'none\'" style="width: 140px" />')

with open('app/components/workouts/planned/StrengthExercisesEditor.vue', 'w', encoding='utf-8') as f:
    f.write(content)

