import os

def insert_ignore(filepath, line_num):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        lines.insert(line_num - 1, '    // @ts-ignore\n')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(lines)
    except Exception as e:
        print(f"Error {filepath}: {e}")

# This is tedious to do line by line. Let's just fix the variables.
