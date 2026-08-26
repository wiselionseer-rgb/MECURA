with open("src/components/DoctorAnalyticsDashboard.tsx", "r") as f:
    code = f.read()

code = code.replace("addAppointment(scheduleForm);", "addAppointment({ ...scheduleForm, status: 'confirmed' });")

with open("src/components/DoctorAnalyticsDashboard.tsx", "w") as f:
    f.write(code)
