import sys

filepath = 'app/components/PlannedWorkoutModal.vue'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = '<UModal v-model:open="isOpen" :dismissible="!loading" :close="loading ? false : undefined">'
replacement = '<UModal v-model:open="isOpen" :dismissible="!loading" :close="loading ? false : undefined" :ui="{ content: \'sm:max-w-[85vw]\' }">'

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated PlannedWorkoutModal")
else:
    print("Could not find target string in PlannedWorkoutModal")
