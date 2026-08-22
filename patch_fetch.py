with open("src/screens/AdminDashboardScreen.tsx", "r") as f:
    code = f.read()

old_fetch_agronomic = """      const response = await fetch('/api/admin-agronomic-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           medicalReportText: agronomicMedicalReport,
           prescriptionText: agronomicPrescription,
           medicalReportFile: agronomicMedicalFile,
           prescriptionFile: agronomicPrescriptionFile,
           targetPlants: agronomicTargetPlants
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAgronomicResult(data.markdown);
    } catch (e: any) {
      alert("Erro ao gerar laudo: " + e.message);
    } finally {"""

new_fetch_agronomic = """      const response = await fetch('/api/admin-agronomic-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           medicalReportText: agronomicMedicalReport,
           prescriptionText: agronomicPrescription,
           medicalReportFile: agronomicMedicalFile,
           prescriptionFile: agronomicPrescriptionFile,
           targetPlants: agronomicTargetPlants
        })
      });
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Servidor retornou HTML ou erro não-JSON:", responseText);
        if (response.status === 413) {
           throw new Error("Os arquivos anexados são muito grandes. Tente enviar PDFs menores ou apenas colar o texto.");
        } else {
           throw new Error(`Erro no servidor da hospedagem (Status ${response.status}). Verifique o console do navegador para mais detalhes.`);
        }
      }
      
      if (!response.ok) throw new Error(data.error || 'Erro desconhecido');
      setAgronomicResult(data.markdown);
    } catch (e: any) {
      alert("Erro ao gerar laudo: " + e.message);
    } finally {"""

code = code.replace(old_fetch_agronomic, new_fetch_agronomic)

old_fetch_catalog = """        const response = await fetch('/api/admin-catalog-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             prompt: aiPrompt,
             currentCatalog: JSON.stringify(products),
             file: aiFile
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);"""

new_fetch_catalog = """        const response = await fetch('/api/admin-catalog-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             prompt: aiPrompt,
             currentCatalog: JSON.stringify(products),
             file: aiFile
          })
        });
        
        const responseText = await response.text();
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          if (response.status === 413) {
             throw new Error("O arquivo anexado é muito grande. Tente usar uma imagem menor.");
          } else {
             throw new Error(`Erro no servidor (Status ${response.status}).`);
          }
        }
        
        if (!response.ok) throw new Error(data.error || 'Erro desconhecido');"""

code = code.replace(old_fetch_catalog, new_fetch_catalog)

with open("src/screens/AdminDashboardScreen.tsx", "w") as f:
    f.write(code)
