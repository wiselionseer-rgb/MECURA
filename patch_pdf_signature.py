with open("src/utils/pdfGenerator.ts", "r") as f:
    code = f.read()

old_code = """  // Bloco de Assinatura Médica
  checkPageBreak(45);
  yPos += 25;"""

new_code = """  // Bloco de Assinatura Médica
  if (yPos > pageHeight - 65) {
    renderFooter(currentPage);
    doc.addPage();
    currentPage++;
    renderHeader(currentPage);
  }
  yPos = pageHeight - 50;"""

if old_code in code:
    code = code.replace(old_code, new_code)
    with open("src/utils/pdfGenerator.ts", "w") as f:
        f.write(code)
    print("Signature patched successfully.")
else:
    print("Old signature code not found!")
