import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # BillingPlans
    content = re.sub(r"formatPrice\(\s*priceFor\(\s*planToChangeTo\.value,\s*billingInterval\.value === 'monthly' \? '1-phase' : '12-phase',\s*currency\.value\s*\),\s*currency\.value\s*\)", r"formatPrice(priceFor(planToChangeTo.value, billingInterval.value === 'monthly' ? '1-phase' : '12-phase', currency.value) or 0, currency.value)", content, flags=re.MULTILINE)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('app/components/settings/BillingPlans.vue')
