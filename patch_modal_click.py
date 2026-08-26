with open("src/components/DoctorAnalyticsDashboard.tsx", "r") as f:
    code = f.read()

old_code = """            <button 
              onClick={() => {
                if (scheduleForm.patientName && scheduleForm.date && scheduleForm.time) {
                  addAppointment({ ...scheduleForm, status: 'confirmed' });
                  setShowScheduleModal(false);
                  setScheduleForm({...scheduleForm, patientName: ''});
                  setCurrentDate(parseISO(scheduleForm.date));
                }
              }}"""

new_code = """            <button 
              onClick={() => {
                if (scheduleForm.patientName && scheduleForm.date && scheduleForm.time) {
                  addAppointment({ ...scheduleForm, status: 'confirmed' });
                  
                  // Try to find patient ID in queue or history to send chat notification
                  const patientId = queue.find(p => p.patientName === scheduleForm.patientName)?.id 
                                 || consultationHistory.find(h => h.patientName === scheduleForm.patientName)?.id;
                  
                  if (patientId) {
                     addDoc(collection(db, 'active_consultations', patientId, 'messages'), {
                       id: Date.now().toString(),
                       text: `[SISTEMA] Sua consulta foi agendada para ${format(parseISO(scheduleForm.date), 'dd/MM/yyyy')} às ${scheduleForm.time}.`,
                       sender: 'doctor',
                       timestamp: new Date()
                     }).catch(console.error);
                  }

                  setShowScheduleModal(false);
                  setScheduleForm({...scheduleForm, patientName: ''});
                  setCurrentDate(parseISO(scheduleForm.date));
                }
              }}"""

code = code.replace(old_code, new_code)

with open("src/components/DoctorAnalyticsDashboard.tsx", "w") as f:
    f.write(code)
