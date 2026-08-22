with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

new_ui = """/>
                     
                     <div className="mb-6">
                        <label className="block text-sm font-bold text-white mb-2">Número de plantas desejado (Opcional)</label>
                        <input 
                           type="number" 
                           value={agronomicTargetPlants}
                           onChange={(e) => setAgronomicTargetPlants(e.target.value)}
                           className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-3 text-sm text-white focus:border-mecura-neon"
                           placeholder="Ex: 30"
                        />
                     </div>
                     
                     <Button """

import re
code = re.sub(r'/>\s*<Button ', new_ui, code, count=1)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
print("Patched React file!")
