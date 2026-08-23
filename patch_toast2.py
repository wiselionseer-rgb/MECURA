import re

with open("src/components/NotificationToast.tsx", "r") as f:
    code = f.read()

code = code.replace("60 * 60 * 1000", "30 * 1000")

with open("src/components/NotificationToast.tsx", "w") as f:
    f.write(code)
print("Updated to 30 seconds.")
