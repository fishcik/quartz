import os
import re
import json

content_dir = "/Users/cihan/Documents/GitHub/quartz/content"
graph_ts_path = "/Users/cihan/Documents/GitHub/quartz/.quartz/plugins/graph/src/components/scripts/graph.inline.ts"

# 1. Map articles and extract K&K terms
courses_map = {
    "Biliş Psikolojisi 1": "Bilişsel Psikoloji",
    "Gelişim Psikolojisi 1": "Gelişim Psikolojisi",
    "Klinik Psikoloji 1": "Klinik Psikoloji",
    "Sağlık Psikolojisi ve Davranışsal Tıp": "Sağlık Psikolojisi",
}

kk_data = {}

for root, dirs, files in os.walk(content_dir):
    for file in files:
        if not file.endswith(".md"):
            continue
        rel_path = os.path.relpath(os.path.join(root, file), content_dir)
        if rel_path.startswith(".") or "templates" in rel_path or file == "index.md":
            continue
        
        with open(os.path.join(root, file), "r", encoding="utf-8") as f:
            text = f.read()
            
        # Find all footnotes
        fn_pattern = re.compile(r'^\[\^([a-zA-Z0-9_\-]+)\]:\s*\*\*([^*]+)\*\*:?\s*(.+)$', flags=re.MULTILINE)
        terms = []
        for m in fn_pattern.finditer(text):
            k_id = m.group(1).strip()
            k_title = m.group(2).strip().rstrip(":")
            terms.append({"id": k_id, "title": k_title})
            
        if terms:
            kk_data[rel_path[:-3]] = terms

print(f"Generated kk_data for {len(kk_data)} articles!")

# Read current graph.inline.ts
with open(graph_ts_path, "r", encoding="utf-8") as f:
    ts_content = f.read()

# Replace kkData
kk_json = json.dumps(kk_data, ensure_ascii=False)
ts_content = re.sub(r'var kkData = \{.*?\};', f'var kkData = {kk_json};', ts_content, count=1)

with open(graph_ts_path, "w", encoding="utf-8") as f:
    f.write(ts_content)

print("Updated graph.inline.ts with live synaptic K&K data!")
