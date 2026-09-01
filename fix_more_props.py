import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('<DashboardTrainingRecommendationCard class="h-full" />', '<DashboardTrainingRecommendationCard class="h-full" @open-details="openRecommendationModal" @open-checkin="openCheckinModal" />')
c = c.replace('<DashboardRecentActivity class="h-full" />', '<DashboardRecentActivityCard class="h-full" />')

with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(c)
