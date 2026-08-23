with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

old_header = 'className="min-h-[64px] md:min-h-[80px] py-3 md:py-4 border-b border-mecura-elevated flex flex-col xl:flex-row xl:items-center justify-between px-4 md:px-6 bg-[#0A0A0F]/80 backdrop-blur-md z-10 flex-shrink-0 gap-4"'
new_header = 'className="min-h-[64px] md:min-h-[80px] py-3 md:py-4 border-b border-mecura-elevated flex flex-col md:flex-row md:items-start justify-between px-4 md:px-6 bg-[#0A0A0F]/80 backdrop-blur-md z-10 flex-shrink-0 gap-4"'

old_buttons = 'className="flex gap-2 md:gap-2 overflow-x-auto md:flex-wrap pb-1 md:pb-0 items-center xl:justify-end"'
new_buttons = 'className="flex gap-2 overflow-x-auto md:overflow-visible md:flex-wrap pb-1 md:pb-0 items-center md:justify-end"'

code = code.replace(old_header, new_header)
code = code.replace(old_buttons, new_buttons)

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)
