import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

old_watch = """        if (newSettings && newSettings.layout && Array.isArray(newSettings.layout)) {
        // Merge with default layout to ensure any new components not in their saved layout are added
        const savedIds = newSettings.layout.map((item: any) => item.id)
        const missingComponents = DEFAULT_DASHBOARD_LAYOUT.filter(
          (item) => !savedIds.includes(item.id)
        )
        dashboardLayout.value = [...newSettings.layout, ...missingComponents]
      }"""

new_watch = """        if (newSettings && newSettings.layout && Array.isArray(newSettings.layout)) {
        const deprecatedIds = ['coachFeedback', 'athleteProfile'];
        const validLayout = newSettings.layout.filter((item: any) => !deprecatedIds.includes(item.id));
        const savedIds = validLayout.map((item: any) => item.id)
        const missingComponents = DEFAULT_DASHBOARD_LAYOUT.filter(
          (item) => !savedIds.includes(item.id)
        )
        
        dashboardLayout.value = [...validLayout, ...missingComponents]
      }"""

# Actually, the indentation might be slightly different. Let's just use regex.
content = re.sub(
    r'if\s*\(newSettings && newSettings\.layout && Array\.isArray\(newSettings\.layout\)\)\s*\{\s*// Merge.*?dashboardLayout\.value = \[\.\.\.newSettings\.layout, \.\.\.missingComponents\]\s*\}',
    new_watch,
    content,
    flags=re.DOTALL
)

with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(content)
