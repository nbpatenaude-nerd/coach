import sys

def update_modal(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Search for UModal for WorkoutTemplateEditor
    # it usually looks like:
    # <UModal
    #   v-model:open="isEditorOpen"
    #   :title="..."
    #   description="..."
    # >
    
    if ':ui="{ content:' not in content and 'v-model:open="isEditorOpen"' in content:
        # We need to inject the ui prop. We can do a string replace on description="..."
        target = 'description="Define your reusable workout structure here."'
        replacement = target + '\n    :ui="{ content: \'sm:max-w-[85vw]\' }"'
        content = content.replace(target, replacement)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")
    else:
        print(f"Skipped {filepath}")

update_modal('app/pages/library/strength/index.vue')
update_modal('app/pages/library/workouts/index.vue')
update_modal('app/pages/library/workouts/[id].vue')

