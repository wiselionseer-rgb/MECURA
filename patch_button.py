import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

old_btn = """<Key className="w-4 h-4 mr-2" /> Alterar Senha</Button>"""
new_btn = """<Key className="w-4 h-4 mr-2" /> Enviar Redefinição</Button>"""

if old_btn in code:
    code = code.replace(old_btn, new_btn)

old_whatsapp = """window.open(`https://wa.me/${phone}?text=Olá! Vimos que você solicitou a recuperação de senha na Mecura. Sua nova senha provisória é: `, '_blank');"""
new_whatsapp = """window.open(`https://wa.me/${phone}?text=Olá! Vimos que você solicitou a recuperação de senha na Mecura. Acabamos de enviar um link oficial de redefinição para o seu e-mail cadastrado. Por favor, verifique sua caixa de entrada e siga as instruções.`, '_blank');"""

if old_whatsapp in code:
    code = code.replace(old_whatsapp, new_whatsapp)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
