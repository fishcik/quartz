import os
import re
import json

content_dir = "/Users/cihan/Documents/GitHub/quartz/content"
out_static = "/Users/cihan/Documents/GitHub/quartz/quartz/static/sc-glossary.json"
out_public = "/Users/cihan/Documents/GitHub/quartz/public/static/sc-glossary.json"

glossary_map = {}

for root, dirs, files in os.walk(content_dir):
    for file in files:
        if not file.endswith(".md"):
            continue
        rel_path = os.path.relpath(os.path.join(root, file), content_dir)
        # Skip private or templates
        if rel_path.startswith(".") or "templates" in rel_path:
            continue
        
        with open(os.path.join(root, file), "r", encoding="utf-8") as f:
            text = f.read()
        
        # Get title
        title_match = re.search(r'^title:\s*(.+)$', text, flags=re.MULTILINE)
        if title_match:
            title = title_match.group(1).strip()
        else:
            title = file[:-3]
        
        # Build slug URL
        clean_slug = rel_path[:-3].replace(" ", "-").lower()
        # Quartz slug format
        url = "/" + clean_slug
        
        # Find footnotes: [^key]: **Term:** Definition or [^key]: **Term**: Definition
        fn_pattern = re.compile(r'^\[\^([a-zA-Z0-9_\-]+)\]:\s*\*\*([^*]+)\*\*:?\s*(.+)$', flags=re.MULTILINE)
        for match in fn_pattern.finditer(text):
            key = match.group(1)
            term_name = match.group(2).strip().rstrip(":")
            desc = match.group(3).strip()
            
            if term_name not in glossary_map:
                glossary_map[term_name] = {
                    "term": term_name,
                    "desc": desc,
                    "sources": []
                }
            
            # Add source if not already present
            existing_urls = [s["url"] for s in glossary_map[term_name]["sources"]]
            if url not in existing_urls:
                glossary_map[term_name]["sources"].append({
                    "title": title,
                    "path": rel_path[:-3],
                    "url": url
                })

# Sort alphabetically by term
glossary_list = sorted(list(glossary_map.values()), key=lambda x: x["term"].lower())

print(f"Compiled {len(glossary_list)} total K&K terms across vault!")

with open(out_static, "w", encoding="utf-8") as f:
    json.dump(glossary_list, f, ensure_ascii=False, indent=2)

if os.path.exists(os.path.dirname(out_public)):
    with open(out_public, "w", encoding="utf-8") as f:
        json.dump(glossary_list, f, ensure_ascii=False, indent=2)

print("Saved updated glossary to static and public!")
