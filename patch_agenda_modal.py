import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Make the patient row have an Agenda button
old_actions = """                    <div>
                       <Button variant="outline" className="text-xs h-8 px-2" onClick={() => forceSendToQueue(p)}>Mover p/ Fila</Button>
                    </div>"""

new_actions = """                    <div className="flex flex-col gap-1">
                       <Button variant="outline" className="text-xs h-8 px-2 w-full" onClick={() => forceSendToQueue(p)}>Mover p/ Fila</Button>
                       <Button variant="outline" className="text-xs h-8 px-2 w-full" onClick={() => setShowAgenda(p.id)}><Calendar className="w-3 h-3 mr-1"/> Agenda</Button>
                    </div>"""

code = code.replace(old_actions, new_actions)

# Update the modal to filter appointments
old_modal_list = """            <div className="flex-1 overflow-y-auto space-y-4">
              {allAppointments.length > 0 ? (
                allAppointments.map(app => ("""

new_modal_list = """            <div className="flex-1 overflow-y-auto space-y-4">
              {allAppointments.filter(app => app.doctorId === showAgenda || app.patientId === showAgenda).length > 0 ? (
                allAppointments.filter(app => app.doctorId === showAgenda || app.patientId === showAgenda).map(app => ("""

code = code.replace(old_modal_list, new_modal_list)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
