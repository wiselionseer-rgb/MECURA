with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

modals_string = """      {/* Modals for Agenda */}"""
parts = code.split(modals_string)

# If there are more than 2 parts, it was inserted multiple times
if len(parts) > 2:
    # Keep everything up to the first insertion
    new_code = parts[0] + modals_string + parts[-1]
    with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
        f.write(new_code)
