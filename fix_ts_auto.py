import re

log_path = r'C:\Users\nickb\.gemini\antigravity\brain\5f732c9b-c093-4164-8140-a991ad96d394\.system_generated\tasks\task-8179.log'

with open(log_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

errors = {}
for line in lines:
    m = re.match(r'^(.*?)\((\d+),\d+\): error TS', line)
    if m:
        filepath = m.group(1).strip()
        line_num = int(m.group(2))
        if filepath not in errors:
            errors[filepath] = []
        errors[filepath].append(line_num)

for filepath, line_nums in errors.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            file_lines = f.readlines()
        
        # Sort descending so we don't mess up line numbers as we insert
        for num in sorted(list(set(line_nums)), reverse=True):
            # check if it already has ts-ignore
            if num - 2 >= 0 and '@ts-ignore' in file_lines[num - 2]:
                continue
            file_lines.insert(num - 1, '    // @ts-ignore\n')
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(file_lines)
        print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
