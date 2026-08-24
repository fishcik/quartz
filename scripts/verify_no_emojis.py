import os
import re
import sys

content_dir = "/Users/cihan/Documents/GitHub/quartz/content"
sikildi_path = "/Users/cihan/Documents/GitHub/quartz/SİKİLDİ.md"

emoji_pattern = re.compile(
    "["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002702-\U000027B0"
    "\U000024C2-\U0001F251"
    "\U0001F900-\U0001F9FF"
    "\U0001FA70-\U0001FAFF"
    "\U00002600-\U000026FF"
    "]+",
    flags=re.UNICODE
)

found_emojis = 0

for root, dirs, files in os.walk(content_dir):
    for file in files:
        if file.endswith(".md"):
            p = os.path.join(root, file)
            with open(p, "r", encoding="utf-8") as f:
                text = f.read()
            matches = emoji_pattern.findall(text)
            if matches:
                print(f"❌ Emoji found in {os.path.basename(p)}: {matches}")
                found_emojis += len(matches)

if found_emojis == 0:
    print("✅ ZERO EMOJI AUDIT PASSED: Sitede tek bir emoji dahi bulunamadı!")
    sys.exit(0)
else:
    print(f"❌ ZERO EMOJI AUDIT FAILED: {found_emojis} emoji bulundu!")
    sys.exit(1)
