import re

def process_file(filepath, replacements):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            c = f.read()
        for old, new in replacements:
            c = c.replace(old, new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(c)
    except FileNotFoundError:
        pass

process_file('app/components/UpgradeModal.vue', [
    ("interval === 'monthly'", "interval === 'MONTHLY'"),
    ("interval === 'annual'", "interval === 'ANNUAL'"),
    ("interval = 'monthly'", "interval = 'MONTHLY'"),
    ("interval = 'annual'", "interval = 'ANNUAL'")
])

process_file('app/components/settings/BillingPlans.vue', [
    ("interval === 'monthly'", "interval === 'MONTHLY'"),
    ("interval === 'annual'", "interval === 'ANNUAL'"),
    ("interval = 'monthly'", "interval = 'MONTHLY'"),
    ("interval = 'annual'", "interval = 'ANNUAL'")
])
