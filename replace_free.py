import os
import glob
import json

i18n_dir = r"d:\coach\app\i18n\en"
files = glob.glob(os.path.join(i18n_dir, "*.json")) + [os.path.join(i18n_dir, ".json")]

replacements = [
    ("Downgrade to Free", "Downgrade to Tri Nerds"),
    ("Stay Free", "Stay with Tri Nerds"),
    ("Instant downgrade to Free.", "Instant downgrade to Tri Nerds."),
    ("Get Started for Free", "Start your 14-Day Trial"),
    ("Claim Your Digital Twin (Free)", "Claim Your Digital Twin"),
    ("No credit card required to start free.", "No credit card required to start."),
    ("pricing_badge\": \"Free\"", "pricing_badge\": \"Tri Nerds\""),
    ("\"name\": \"Free\"", "\"name\": \"Tri Nerds\""),
    ("Start free with a 14-day full-access trial", "Start your 14-day full-access trial"),
    ("Free forever with optional upgrades.", "14-day trial starts at signup."),
    ("nav_pricing_badge\": \"Free\"", "nav_pricing_badge\": \"Tri Nerds\""),
    ("back on Free-tier AI limits", "back on Tri Nerds AI limits"),
    ("Continue on Free", "Continue as a Tri Nerd"),
    ("Free and UNLOCK athletes", "Tri Nerds and UNLOCK athletes"),
    ("Start free - 14-day full-access trial included.", "Start your 14-day full-access trial."),
    ("permanent FREE tier", "permanent Tri Nerds tier"),
    ("\"start_free\": \"Start Free\"", "\"start_free\": \"Start Trial\""),
    ("Instant downgrade to Free", "Instant downgrade to Tri Nerds"),
    ("\"description\": \"Start free with a 14-day full-access trial.\"", "\"description\": \"Start your 14-day full-access trial.\""),
    ("returns to Free features", "returns to Tri Nerds features"),
    ("the free plan covers 6 workouts", "the Tri Nerds plan covers 6 workouts"),
    ("billing_compare_row_analysis_free", "billing_compare_row_analysis_free"), # Key, ignore
    ("billing_compare_row_coaching_free", "billing_compare_row_coaching_free"), # Key
    ("billing_compare_row_insights_free", "billing_compare_row_insights_free"), # Key
    ("billing_compare_row_planning_free", "billing_compare_row_planning_free"), # Key
    ("billing_tier_desc_free", "billing_tier_desc_free"), # Key
    ("billing_tier_free", "billing_tier_free"), # Key
    ("nutrition_diet_dairy_free", "nutrition_diet_dairy_free"), # Key
    ("nutrition_diet_gluten_free", "nutrition_diet_gluten_free"), # Key
]

for filepath in files:
    if not os.path.isfile(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old, new in replacements:
        if old in new and "pricing_badge" not in old and "\"name\"" not in old: continue
        content = content.replace(old, new)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

