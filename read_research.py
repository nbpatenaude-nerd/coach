import json

log_path = r'C:\Users\nickb\.gemini\antigravity\brain\196a3c13-6cd8-4668-8364-2fe720d8a795\.system_generated\logs\transcript.jsonl'
output_path = r'C:\Users\nickb\.gemini\antigravity\brain\5f732c9b-c093-4164-8140-a991ad96d394\scratch\research_result.txt'

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        if data.get('type') == 'PLANNER_RESPONSE':
            with open(output_path, 'w', encoding='utf-8') as out:
                out.write(data.get('content', ''))
