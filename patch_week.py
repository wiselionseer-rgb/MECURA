import re
with open("src/components/DoctorAnalyticsDashboard.tsx", "r") as f:
    code = f.read()

# Replace `const startDate = currentDate;` with `const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });` // 1 = Monday
code = code.replace("const startDate = currentDate;", "const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });")

with open("src/components/DoctorAnalyticsDashboard.tsx", "w") as f:
    f.write(code)
