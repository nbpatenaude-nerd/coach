import re

with open('app/pages/dashboard.vue', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove old DashboardCheckIn
checkin_pattern = r'''\s*<!-- Weekly Check-In \(For All Athletes\) -->\s*<DashboardCheckIn />'''
content = re.sub(checkin_pattern, '', content, count=1)

# 2. Remove old DashboardCoachFeedback
feedback_pattern = r'''\s*<!-- Row: Coach Interaction \(Feedback\) -->\s*<div class="grid grid-cols-1 gap-4 sm:gap-8 items-start mb-4 sm:mb-8 lg:grid-cols-2">\s*<!-- "Ask Coach" launcher -->\s*<DashboardCoachFeedback />\s*</div>'''
content = re.sub(feedback_pattern, '', content, count=1)

# 3. Insert them both at the top
insert_marker = r'''<div class="p-0 sm:p-6 pt-0! space-y-4 sm:space-y-8">'''
insert_pos = content.find(insert_marker)

if insert_pos != -1:
    new_blocks = '''

              <!-- Top Section: Weekly Check-In & Coach Feedback -->
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-4 sm:mb-8 items-stretch">
                <!-- Weekly Check-In (1/3 width) -->
                <div class="col-span-1 h-full">
                  <DashboardCheckIn class="h-full" />
                </div>
                
                <!-- Coach Feedback (2/3 width) -->
                <div class="col-span-1 lg:col-span-2 h-full">
                  <DashboardCoachFeedback class="h-full" />
                </div>
              </div>'''
    
    # Insert right after the insert_marker
    content = content[:insert_pos + len(insert_marker)] + new_blocks + content[insert_pos + len(insert_marker):]

with open('app/pages/dashboard.vue', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
