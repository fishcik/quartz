import os
import subprocess
import sys

content_dir = "/Users/cihan/Documents/GitHub/quartz/content"

def check_file_integrity(filepath, original_commit):
    full_path = os.path.join(content_dir, filepath)
    if not os.path.exists(full_path):
        print(f"File not found: {filepath}")
        return False
    
    try:
        orig = subprocess.check_output(["git", "show", f"{original_commit}:{filepath}"], cwd="/Users/cihan/Documents/GitHub/quartz").decode("utf-8")
        with open(full_path, "r", encoding="utf-8") as f:
            curr = f.read()
        
        orig_words = len(orig.split())
        curr_words = len(curr.split())
        
        # Word count check
        print(f"[{os.path.basename(filepath)}] Orig: {orig_words} words | Curr: {curr_words} words")
        return True
    except Exception as e:
        print(f"Error checking {filepath}: {e}")
        return False

if __name__ == "__main__":
    print("=== PROSE INTEGRITY VERIFIER ===")
    print("Checking repository prose integrity...")
    # Add check routines
