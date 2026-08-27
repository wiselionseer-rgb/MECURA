import re

with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

# Add sendPasswordResetEmail to imports
if "sendPasswordResetEmail" not in code:
    code = code.replace("import { auth } from '../firebase';", "import { auth } from '../firebase';\nimport { sendPasswordResetEmail } from 'firebase/auth';")

old_func = """  const handleUpdatePatientPassword = async () => {
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
  };"""

new_func = """  const handleUpdatePatientPassword = async () => {
    if (showEditPatientPassword) {
      const patient = patients.find(p => p.id === showEditPatientPassword);
      if (patient && patient.email) {
        try {
          await sendPasswordResetEmail(auth, patient.email);
          setSupportToastMessage('Link de redefinição enviado para o e-mail do paciente!');
          setShowSupportToast(true);
          setTimeout(() => setShowSupportToast(false), 3000);
        } catch (err) {
          console.error("Erro ao enviar link de redefinição", err);
          setSupportToastMessage('Erro ao enviar link. Verifique o console.');
          setShowSupportToast(true);
          setTimeout(() => setShowSupportToast(false), 3000);
        }
      }
      setShowEditPatientPassword(null);
    }
  };"""

if old_func in code:
    code = code.replace(old_func, new_func)

old_modal = """      {showEditPatientPassword && (
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
      )}"""

new_modal = """      {showEditPatientPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#161622] border border-[#262636] rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Redefinir Senha do Paciente</h3>
            <p className="text-[#8A8A9E] mb-6 text-sm">Por questões de segurança do Firebase, não é possível definir uma senha provisória manualmente.<br/><br/>Ao confirmar, o sistema enviará um e-mail oficial para <b>{patients.find(p => p.id === showEditPatientPassword)?.email}</b> com um link seguro para ele redefinir a própria senha.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditPatientPassword(null)}>Cancelar</Button>
              <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black" onClick={handleUpdatePatientPassword}>Enviar E-mail</Button>
            </div>
          </div>
        </div>
      )}"""

if old_modal in code:
    code = code.replace(old_modal, new_modal)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
