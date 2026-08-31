import os
import re
import sys

content_dir = "/Users/cihan/Documents/GitHub/quartz/content"

# Regex for modern visual emojis (excluding Egyptian Hieroglyphs U+13000-U+1342F)
emoji_pattern = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # Emoticons
    "\U0001F300-\U0001F5FF"  # Misc Symbols and Pictographs
    "\U0001F680-\U0001F6FF"  # Transport and Map
    "\U0001F1E0-\U0001F1FF"  # Flags
    "\U00002702-\U000027B0"  # Dingbats
    "\U0001F900-\U0001F9FF"  # Supplemental Symbols and Pictographs
    "\U0001FA70-\U0001FAFF"  # Symbols and Pictographs Extended-A
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
            # Exclude Egyptian Hieroglyphs
            matches = [m for m in emoji_pattern.findall(text) if not any('\U00013000' <= char <= '\U0001342F' for char in m)]
            if matches:
                print(f"❌ Emoji found in {os.path.basename(p)}: {matches}")
                found_emojis += len(matches)

if found_emojis == 0:
    print("✅ ZERO EMOJI AUDIT PASSED: Sitede tek bir emoji dahi bulunamadı!")
    sys.exit(0)
else:
    print(f"❌ ZERO EMOJI AUDIT FAILED: {found_emojis} emoji bulundu!")
    sys.exit(1)
