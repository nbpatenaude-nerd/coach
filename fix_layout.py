import sys

with open('app/components/workouts/planned/StrengthExercisesEditor.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix 1: The block header layout
bad_layout = '''          <div class="border-b border-default/70 bg-muted/20 px-4 py-4 sm:px-5">
            <div
              class="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between"
            >
              <div class="min-w-0 flex-1 space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                  <UBadge color="primary" variant="soft" size="sm" class="uppercase tracking-wide">
                    {{ blockTypeLabel(block.type) }}
                  </UBadge>
                  <div class="text-xs uppercase tracking-[0.18em] text-muted">
                    {{ block.steps.length }} exercise{{ block.steps.length === 1 ? '' : 's' }}
                  </div>
                </div>

                <div class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]">
                  <UInput v-model="block.title" size="lg" placeholder="Block title" />
                  <UInput
                    v-model.number="block.durationSec"
                    type="number"
                    min="0"
                    placeholder="Block duration (s)"
                  />
                </div>

                <UTextarea
                  v-model="block.notes"
                  :rows="2"
                  autoresize
                  placeholder="Block notes or coach instructions..."
                />
              </div>

              <div class="flex flex-wrap gap-2">'''

good_layout = '''          <div class="border-b border-default/70 bg-muted/20 px-4 py-4 sm:px-5">
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

content = content.replace(bad_layout, good_layout)

bad_layout2 = '''              <UButton
                size="xs"
                color="error"
                variant="ghost"
                :disabled="localBlocks.length === 1"
                @click="
                  () => {
                    void removeBlock(blockIndex)
                  }
                "
              >
                Delete Block
              </UButton>
            </div>
          </div>
        </div>'''

good_layout2 = '''              <UButton
                size="xs"
                color="error"
                variant="ghost"
                :disabled="localBlocks.length === 1"
                @click="
                  () => {
                    void removeBlock(blockIndex)
                  }
                "
              >
                Delete Block
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

content = content.replace(bad_layout2, good_layout2)

# Fix 2: The table col width
content = content.replace('''<col v-if="step.loadMode !== 'none'" style="width: 220px" />''', '''<col v-if="step.loadMode !== 'none'" style="width: 140px" />''')

with open('app/components/workouts/planned/StrengthExercisesEditor.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced!")
