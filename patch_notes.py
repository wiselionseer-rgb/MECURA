import re

with open("src/screens/DoctorDashboardScreen.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Replace the setPrescNotes line
old_set_presc = """setPrescNotes(notes || 'Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.\\n- Administrar com alimentos gordurosos (preferencia, não obrigatorio) - podendo aumentar em até 5x a absorção.\\n- Se observado sonolencia durante o dia apos a administração do medicamento, reduzir em 1/3 a dose da manhã e 2/3 a noite.\\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos continuos.');"""

new_set_presc = """const defaultNotesToAdd = '- Administrar com alimentos gordurosos (preferencia, não obrigatorio) - podendo aumentar em até 5x a absorção.\\n- Se observado sonolencia durante o dia apos a administração do medicamento, reduzir em 1/3 a dose da manhã e 2/3 a noite.\\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos continuos.';
    
    let finalNotes = notes || ('Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.\\n' + defaultNotesToAdd);
    if (notes && !notes.includes('alimentos gordurosos')) {
      finalNotes += '\\n\\n' + defaultNotesToAdd;
    }
    setPrescNotes(finalNotes);"""

code = code.replace(old_set_presc, new_set_presc)

# Add semicolon to protocolNotes just in case the user meant it literally
# Wait, let's keep the semicolon out, it was probably just a separator.
# Actually, I won't touch protocolNotes if it already has the text.

with open("src/screens/DoctorDashboardScreen.tsx", "w", encoding="utf-8") as f:
    f.write(code)
