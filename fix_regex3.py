with open("src/utils/pdfGenerator.ts", "r") as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if "return (text || '')" in line:
        new_lines.append(line)
        new_lines.append("      .replace(/[–—]/g, '-')\n")
        new_lines.append(r"      .replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');" + "\n")
        skip = True
        continue
    if skip:
        if "};" in line:
            new_lines.append(line)
            skip = False
        continue
    new_lines.append(line)

with open("src/utils/pdfGenerator.ts", "w") as f:
    f.writelines(new_lines)
