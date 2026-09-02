import re

def update_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update protocolNotes
    old_protocol = "const protocolNotes = `PROTOCOLO DE ENTRADA ACESSÍVEL (FASE 1):\\n- Medicamento Inicial: ${prodName} (Associação Brasileira)\\n- Posologia Econômica: ${dosage.join(' ')}\\n- Rendimento estimado: 45 a 60 dias.\\n- Fase 2 (Evolução): Reavaliação em 30 a 45 dias para verificar resposta terapêutica e evolução progressiva se necessário.`;"
    new_protocol = "const protocolNotes = `PROTOCOLO DE ENTRADA ACESSÍVEL (FASE 1):\\n- Medicamento Inicial: ${prodName} (Associação Brasileira)\\n- Posologia Econômica: ${dosage.join(' ')}\\n- Rendimento estimado: 45 a 60 dias.\\n- Fase 2 (Evolução): Reavaliação em 30 a 45 dias para verificar resposta terapêutica e evolução progressiva se necessário.\\n- Administrar com alimentos gordurosos (preferencia, não obrigatorio) - podendo aumentar em até 5x a absorção.\\n- Se observado sonolencia durante o dia apos a administração do medicamento, reduzir em 1/3 a dose da manhã e 2/3 a noite.\\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos continuos.`;"
    
    content = content.replace(old_protocol, new_protocol)
    
    # 2. Update default fallback notes at line 633
    old_fallback = "setPrescNotes(notes || 'Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.');"
    new_fallback = "setPrescNotes(notes || 'Manter o frasco ao abrigo de luz e calor excessivo. Uso contínuo sob titulação gradual.\\n- Administrar com alimentos gordurosos (preferencia, não obrigatorio) - podendo aumentar em até 5x a absorção.\\n- Se observado sonolencia durante o dia apos a administração do medicamento, reduzir em 1/3 a dose da manhã e 2/3 a noite.\\n- Preferencialmente tomar canabidiol 2 horas antes ou depois do uso de medicamentos continuos.');"
    
    content = content.replace(old_fallback, new_fallback)

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

update_file("src/screens/DoctorDashboardScreen.tsx")
print("Updated successfully")
