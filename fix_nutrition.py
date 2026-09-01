import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    c = f.read()

old_str = '<DashboardNutritionFuelingCard class="h-full" />'
new_str = '<DashboardNutritionFuelingCard class="h-full" :nutrition="todayNutrition" :workouts="todayWorkouts" :settings="nutritionSettings" :weight="userStore.user?.weight" :loading="loadingNutrition" @refresh="fetchTodayNutrition" />'

c = c.replace(old_str, new_str)

with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(c)
