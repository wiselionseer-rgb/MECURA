with open("src/screens/DoctorDashboardScreen.tsx", "r") as f:
    code = f.read()

old_container = '<div className="flex flex-col md:flex-row h-[100dvh] bg-[#050508] text-mecura-pearl overflow-hidden font-sans">'
new_container = '<div className="flex flex-col md:flex-row h-[100dvh] bg-[#050508] text-mecura-pearl overflow-hidden font-sans pt-[max(env(safe-area-inset-top),12px)] md:pt-0">'
code = code.replace(old_container, new_container)

with open("src/screens/DoctorDashboardScreen.tsx", "w") as f:
    f.write(code)

with open("src/components/layout/AppLayout.tsx", "r") as f:
    code = f.read()

old_app = 'className="w-full h-[100dvh] sm:h-[850px] sm:max-w-[400px] bg-[#0A0A0F] sm:rounded-[44px] sm:border-[8px] sm:border-[#1F1F29] overflow-hidden relative shadow-2xl flex flex-col transform-gpu"'
new_app = 'className="w-full h-[100dvh] sm:h-[850px] sm:max-w-[400px] bg-[#0A0A0F] sm:rounded-[44px] sm:border-[8px] sm:border-[#1F1F29] overflow-hidden relative shadow-2xl flex flex-col transform-gpu pt-[env(safe-area-inset-top)] sm:pt-0"'
code = code.replace(old_app, new_app)

with open("src/components/layout/AppLayout.tsx", "w") as f:
    f.write(code)
