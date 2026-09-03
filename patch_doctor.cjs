const fs = require('fs');
let code = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf-8');

// Add import
code = code.replace(
  "import { MedicalReportEditorModal } from '../components/MedicalReportEditorModal';",
  "import { MedicalReportEditorModal } from '../components/MedicalReportEditorModal';\nimport { PsychomotorReportEditorModal } from '../components/PsychomotorReportEditorModal';"
);

// Add states
code = code.replace(
  "// Medical Report (Laudo Médico) Editor & Preview States",
  "// Psychomotor Report Editor States\n  const [showPsychomotorReportEditorModal, setShowPsychomotorReportEditorModal] = useState(false);\n  const [psychomotorReportText, setPsychomotorReportText] = useState('');\n\n  // Medical Report (Laudo Médico) Editor & Preview States"
);

// Modify handleOpenPsychomotorReportEditor
const handleOpenPsychomotor = `
  const handleOpenPsychomotorReportEditor = () => {
    const pName = currentPatient?.patientName || userName || 'Paciente';
    const patientAnswers = currentPatient?.answers || answers;
    const pBirthDate = currentPatient?.birthDate || patientAnswers?.birthDate || userBirthDate || 'Não informada';
    const pCpf = currentPatient?.cpf || patientAnswers?.cpf || userCpf || 'Não informado';
    
    setReportPatientName(pName);
    setReportBirthDate(pBirthDate);
    setReportCpf(pCpf);
    setReportEmissionDate(new Date().toLocaleDateString('pt-BR'));
    setReportDoctorName('Dr. Guilherme Taveira Dias');
    setReportDoctorCrm('CRM/MT 17259');
    setReportDoctorSpecialty('Especialista em Medicina Canabinoide');

    const defaultPsychomotorText = \`Declaro, para os devidos fins de direito, que o(a) paciente <strong>\${pName}</strong>, inscrito(a) no CPF <strong>\${pCpf}</strong>, encontra-se em acompanhamento médico regular neste Centro Integrado de Medicina Canabinoide.\\n\\nO(a) paciente faz uso terapêutico de produtos derivados de Cannabis, estritamente conforme prescrição médica, sob supervisão e com acompanhamento clínico contínuo.\\n\\nAtesto, baseado em exames clínicos e testes de rastreio de capacidade psicomotora realizados durante as consultas de monitoramento, que o uso das medicações prescritas, nas doses estipuladas, <strong> NÃO RESULTA </strong> em alteração da capacidade psicomotora, prejuízo cognitivo, ou comprometimento dos reflexos e estado de alerta do paciente.\\n\\nO tratamento prescrito não interfere em sua capacidade de operar máquinas complexas, conduzir veículos automotores ou exercer atividades laborais que exijam atenção e precisão, não configurando infração à legislação de trânsito relacionada ao comprometimento psicomotor ("Lei Seca" ou "Lei do Drogômetro" - Art. 165 do CTB).\\n\\nRessalto que os canabinoides prescritos têm finalidade exclusivamente terapêutica, sendo legalmente importados (RDC 660/2022 ANVISA) e/ou adquiridos via Associações de Pacientes, e não se enquadram como substâncias psicoativas entorpecentes de uso recreativo capazes de causar dependência ou prejuízo sensório-motor nas doses tituladas.\`;

    setPsychomotorReportText(defaultPsychomotorText);
    setShowPsychomotorReportEditorModal(true);
  };

  const handleDownloadPsychomotorReportFromEditor = () => {
    generatePsychomotorReportPDF(reportPatientName, {
      customPatientName: reportPatientName,
      birthDate: reportBirthDate,
      cpf: reportCpf,
      emissionDate: reportEmissionDate,
      customDoctorName: reportDoctorName,
      customDoctorCrm: reportDoctorCrm,
      customDoctorSpecialty: reportDoctorSpecialty,
      customPsychomotorText: psychomotorReportText
    });
  };

  const handleDownloadMedicalReportFromEditor = () => {`;

code = code.replace("const handleDownloadMedicalReportFromEditor = () => {", handleOpenPsychomotor);

// Update button onClick
code = code.replace(
  "onClick={() => generatePsychomotorReportPDF(currentPatient?.patientName || userName || 'Paciente', { customPatientName: currentPatient?.patientName || userName || 'Paciente', birthDate: currentPatient?.birthDate, cpf: currentPatient?.cpf, answers: currentPatient?.answers })}",
  "onClick={handleOpenPsychomotorReportEditor}"
);

// Add the modal component at the end
const modalComponent = `
      {/* Psychomotor Report View & Edit Modal */}
      <PsychomotorReportEditorModal
        isOpen={showPsychomotorReportEditorModal}
        onClose={() => setShowPsychomotorReportEditorModal(false)}
        patientName={reportPatientName}
        setPatientName={setReportPatientName}
        birthDate={reportBirthDate}
        setBirthDate={setReportBirthDate}
        cpf={reportCpf}
        setCpf={setReportCpf}
        emissionDate={reportEmissionDate}
        setEmissionDate={setReportEmissionDate}
        doctorName={reportDoctorName}
        setDoctorName={setReportDoctorName}
        doctorCrm={reportDoctorCrm}
        setDoctorCrm={setReportDoctorCrm}
        doctorSpecialty={reportDoctorSpecialty}
        setDoctorSpecialty={setReportDoctorSpecialty}
        psychomotorText={psychomotorReportText}
        setPsychomotorText={setPsychomotorReportText}
        onDownloadPDF={handleDownloadPsychomotorReportFromEditor}
      />
    </div>
  );
}`;

code = code.replace(/    <\/div>\n  \);\n\}\n?$/, modalComponent);

fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', code);
