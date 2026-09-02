import re

def update_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace the exact match
    content = content.replace(
        "Tomar 03 gotas pela manhã e 03 gotas no final da tarde",
        "Tomar 03 gotas de 12/12 horas"
    )
    
    # Replace the other variant in DoctorDashboardScreen.tsx
    content = content.replace(
        "Tomar 03 gotas pela manhã e 03 gotas à noite",
        "Tomar 03 gotas de 12/12 horas"
    )
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

update_file("src/screens/DoctorDashboardScreen.tsx")
update_file("src/components/PrescriptionEditorModal.tsx")
print("Updated successfully")
