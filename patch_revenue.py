import re
with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Add calculation variables
calc_block = """  const revenueFila = payments.filter(p => p.type === 'Consulta Básica').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenuePremium = payments.filter(p => p.type === 'Consulta Premium').reduce((acc, p) => acc + (p.value || 0), 0);
  const revenueTotal = revenueFila + revenuePremium;

  return ("""

if "const revenueFila =" not in code:
    code = code.replace("  return (", calc_block)

old_faturamento = """            <h3 className="text-xl font-bold mt-8 mb-4">Faturamento (Lucro)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#161622] to-[#1a2e20] p-6 rounded-2xl border border-mecura-neon/30">
                <div className="text-[#8A8A9E] mb-2">Receita Fila (R$ 50)</div>
                <div className="text-3xl font-bold text-mecura-neon">
                  {(queueCount * 50).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#2e1a2b] p-6 rounded-2xl border border-purple-500/30">
                <div className="text-[#8A8A9E] mb-2">Receita Premium (R$ 250)</div>
                <div className="text-3xl font-bold text-purple-400">
                  {(allAppointments.length * 250).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#262636] p-6 rounded-2xl border border-white/20">
                <div className="text-[#8A8A9E] mb-2">Faturamento Total</div>
                <div className="text-3xl font-bold text-white">
                  {((queueCount * 50) + (allAppointments.length * 250)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>"""

new_faturamento = """            <h3 className="text-xl font-bold mt-8 mb-4">Faturamento (Lucro - Via Mercado Pago)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#161622] to-[#1a2e20] p-6 rounded-2xl border border-mecura-neon/30">
                <div className="text-[#8A8A9E] mb-2">Receita Fila (Mercado Pago)</div>
                <div className="text-3xl font-bold text-mecura-neon">
                  {revenueFila.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#2e1a2b] p-6 rounded-2xl border border-purple-500/30">
                <div className="text-[#8A8A9E] mb-2">Receita Premium (Mercado Pago)</div>
                <div className="text-3xl font-bold text-purple-400">
                  {revenuePremium.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              <div className="bg-gradient-to-br from-[#161622] to-[#262636] p-6 rounded-2xl border border-white/20">
                <div className="text-[#8A8A9E] mb-2">Faturamento Total</div>
                <div className="text-3xl font-bold text-white">
                  {revenueTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>"""

if old_faturamento in code:
    code = code.replace(old_faturamento, new_faturamento)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
print("Patched faturamento view")
