with open("src/utils/pdfGenerator.ts", "r") as f:
    code = f.read()

old_code = """  // Bloco de Assinatura Médica
  checkPageBreak(45);
  yPos = Math.max(yPos + 8, pageHeight - 48);"""

new_code = """  // Bloco de Assinatura Médica
  checkPageBreak(45);
  yPos += 25;"""
code = code.replace(old_code, new_code)

with open("src/utils/pdfGenerator.ts", "w") as f:
    f.write(code)
