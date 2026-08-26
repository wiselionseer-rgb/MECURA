import re

with open("src/store/useAdminStore.ts", "r") as f:
    code = f.read()

code = code.replace("discount: number;", "discount: number;\n  discountType?: 'percentage' | 'fixed';")

with open("src/store/useAdminStore.ts", "w") as f:
    f.write(code)
