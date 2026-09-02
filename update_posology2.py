import re

def update_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        "12 em 12 horas",
        "12/12 horas"
    )
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

update_file("src/components/PrescriptionEditorModal.tsx")
update_file("src/screens/DoctorDashboardScreen.tsx")
print("Updated successfully")
