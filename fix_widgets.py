import re
import glob

files = glob.glob('app/components/dashboard/*.vue')

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # Remove v-if="isOnboarded" from the first UCard
    # It usually looks like:
    # <UCard
    #   v-if="isOnboarded"
    c = re.sub(r'<UCard\s*v-if="isOnboarded"', '<UCard', c)
    c = re.sub(r'v-if="isOnboarded"\s*:ui=', ':ui=', c)
    c = c.replace('v-if="isOnboarded"', '')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(c)
