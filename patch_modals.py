import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Replace lucide imports
old_imports = """  User,
  X"""
new_imports = """  User,
  X, Key, AlertTriangle"""
if new_imports not in code:
    code = code.replace(old_imports, new_imports)

# Add states
state_hook = "const [deletePatientConfirm, setDeletePatientConfirm] = useState<string | null>(null);\n  const [showEditPatientPassword, setShowEditPatientPassword] = useState<string | null>(null);\n  const [newPatientPassword, setNewPatientPassword] = useState('');"

if "deletePatientConfirm" not in code:
    code = code.replace("const [patientSearch, setPatientSearch] = useState('');", "const [patientSearch, setPatientSearch] = useState('');\n  " + state_hook)

# Add functions
functions = """  const handleDeletePatient = async () => {
    if (deletePatientConfirm) {
      try {
        await deleteDoc(doc(db, 'users', deletePatientConfirm));
        setSupportToastMessage('Paciente excluído com sucesso!');
        setShowSupportToast(true);
        setTimeout(() => setShowSupportToast(false), 3000);
      } catch (err) {
        console.error("Erro ao excluir", err);
      }
      setDeletePatientConfirm(null);
    }
  };

  const handleUpdatePatientPassword = async () => {
    if (showEditPatientPassword && newPatientPassword) {
      try {
        await updateDoc(doc(db, 'users', showEditPatientPassword), {
          password: newPatientPassword // Just saving it so it can be viewed if they have a custom method.
        });
        setSupportToastMessage('Senha salva no perfil do paciente!');
        setShowSupportToast(true);
        setTimeout(() => setShowSupportToast(false), 3000);
      } catch (err) {
        console.error("Erro ao atualizar senha", err);
      }
      setShowEditPatientPassword(null);
      setNewPatientPassword('');
    }
  };
"""
if "handleDeletePatient" not in code:
    code = code.replace("const handleAddDoctor = () => {", functions + "\n  const handleAddDoctor = () => {")

# Add Modals
modals = """
      {deletePatientConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-red-500/30 rounded-3xl p-6 w-full max-w-md text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Excluir Paciente?</h3>
            <p className="text-[#8A8A9E] mb-6 text-sm">Esta ação removerá o perfil do paciente. Essa ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeletePatientConfirm(null)}>Cancelar</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleDeletePatient}>Excluir</Button>
            </div>
          </div>
        </div>
      )}

      {showEditPatientPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Mudar Senha do Paciente</h3>
            <p className="text-[#8A8A9E] mb-4 text-xs">Aviso: Isso altera a senha no banco de dados. Para usuários usando login Firebase Auth, use o recurso "Esqueci a Senha" no app.</p>
            <input type="password" value={newPatientPassword} onChange={e => setNewPatientPassword(e.target.value)} placeholder="Nova senha" className="w-full bg-[#0A0A0F] border border-[#262636] rounded-xl px-4 py-2 mb-4 text-white" />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditPatientPassword(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleUpdatePatientPassword}>Salvar Senha</Button>
            </div>
          </div>
        </div>
      )}
"""
if "deletePatientConfirm &&" not in code:
    code = code.replace("{showAddDoctor && (", modals + "\n      {showAddDoctor && (")

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
