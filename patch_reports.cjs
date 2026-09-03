const fs = require('fs');

const file = 'src/utils/pdfGenerator.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove the empty exports
content = content.replace(/export const generateMedicalReportPDF = async \(userName: string, messages\?: any, patientData\?: any\) => \{\};\s*/, '');
content = content.replace(/export const generatePsychomotorReportPDF = async \(userName: string, messages\?: any, patientData\?: any\) => \{\};\s*/, '');
content = content.replace(/export const generatePsychomotorReportPDF = async \(userName: string, patientData\?: any\) => \{\};\s*/, '');

const additionalCode = `
export const generateMedicalReportPDF = async (userName: string, messages?: any, patientData?: any) => {
  const sanitize = (text: string) => {
    return (text || '').replace(/[–—]/g, '-').replace(/[^\\x0A\\x0D\\x20-\\x7E\\xA0-\\xFF\\u0152\\u0153\\u0178]/g, '');
  };

  const rawUserName = patientData?.customPatientName || userName || 'Paciente';
  const sanitizedUserName = sanitize(rawUserName);
  
  const birthDateText = sanitize(patientData?.birthDate || 'Não informada');
  const cpfText = sanitize(patientData?.cpf || 'Não informado');
  const emissionDateStr = patientData?.emissionDate || format(new Date(), 'dd/MM/yyyy');
  
  const docName = patientData?.customDoctorName || "Dr. Guilherme Taveira Dias";
  const docCrm = patientData?.customDoctorCrm || "CRM/MT 17259";
  const docSpec = patientData?.customDoctorSpecialty || "Especialista em Medicina Canabinoide";

  const PdfComponent = () => {
    return (
      <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
        <div className="relative p-12 border border-[#E2E8F0] box-border flex flex-col justify-between" style={{ width: "794px", minHeight: "1123px", backgroundColor: "#FFFFFF", color: "#111827" }}>
          <div>
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-4 mb-6 pt-4">
              <div>
                <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                <p className="text-[11px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                  CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-[#1E1B4B] m-0">{docName}</h3>
                <p className="text-xs text-[#475569] font-semibold m-0">{docCrm}</p>
                <p className="text-[10px] text-[#64748B] m-0">{docSpec}</p>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-xl font-black text-[#1E1B4B] tracking-widest uppercase mb-2">LAUDO MÉDICO</h1>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-sm text-[#475569]">
                  <span className="font-bold text-[#1E1B4B]">PACIENTE:</span>
                  <span className="font-semibold">{sanitizedUserName}</span>
                </div>
                <div className="flex items-center justify-center gap-6 text-xs text-[#64748B]">
                  {birthDateText !== 'Não informada' && (
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-[#475569]">NASCIMENTO:</span> {birthDateText}
                    </span>
                  )}
                  {cpfText !== 'Não informado' && (
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-[#475569]">CPF:</span> {cpfText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {patientData?.customDiagnosis && (
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-1 mb-2">Diagnóstico e Resumo Clínico</h4>
                  <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{patientData.customDiagnosis}</p>
                </div>
              )}
              {patientData?.customRationale && (
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-1 mb-2">Raciocínio Terapêutico</h4>
                  <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{patientData.customRationale}</p>
                </div>
              )}
              {patientData?.customTreatmentPlan && (
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-1 mb-2">Plano de Tratamento Canabinoide</h4>
                  <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{patientData.customTreatmentPlan}</p>
                </div>
              )}
              {patientData?.customMonitoring && (
                <div>
                  <h4 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wider border-b border-[#E2E8F0] pb-1 mb-2">Acompanhamento e Monitoramento</h4>
                  <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap">{patientData.customMonitoring}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#E2E8F0]">
            <div className="flex flex-col items-center">
              <div className="w-52 h-0 border-b border-[#CBD5E1] mb-2"></div>
              <p className="text-sm font-bold text-[#1E1B4B]">{docName}</p>
              <p className="text-xs text-[#64748B] mb-4">{docCrm}</p>
              <div className="flex justify-between w-full text-[10px] text-[#94A3B8] font-semibold">
                <span>{emissionDateStr}</span>
                <span>Válido em todo o território nacional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfComponent />);

  await new Promise(resolve => setTimeout(resolve, 800));

  const opt = {
    margin: 0,
    filename: \`Laudo_Medico_\${sanitizedUserName.replace(/\\s+/g, '_')}.pdf\`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  if (patientData?.returnBlob) {
    const pdfBlob = await html2pdf().set(opt).from(container.firstElementChild || container).output('blob');
    root.unmount();
    document.body.removeChild(container);
    return pdfBlob;
  }

  await html2pdf().set(opt).from(container.firstElementChild || container).save();

  root.unmount();
  document.body.removeChild(container);
};

export const generatePsychomotorReportPDF = async (userName: string, patientData?: any) => {
  const sanitize = (text: string) => {
    return (text || '').replace(/[–—]/g, '-').replace(/[^\\x0A\\x0D\\x20-\\x7E\\xA0-\\xFF\\u0152\\u0153\\u0178]/g, '');
  };

  const rawUserName = patientData?.customPatientName || userName || 'Paciente';
  const sanitizedUserName = sanitize(rawUserName);
  
  const birthDateText = sanitize(patientData?.birthDate || 'Não informada');
  const cpfText = sanitize(patientData?.cpf || 'Não informado');
  const emissionDateStr = patientData?.emissionDate || format(new Date(), 'dd/MM/yyyy');
  
  const docName = "Dr. Guilherme Taveira Dias";
  const docCrm = "CRM/MT 17259";
  const docSpec = "Especialista em Medicina Canabinoide";

  const PdfComponent = () => {
    return (
      <div className="flex flex-col items-center" style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif", width: "794px", backgroundColor: "#F8FAFC" }}>
        <div className="relative p-12 border border-[#E2E8F0] box-border flex flex-col justify-between" style={{ width: "794px", minHeight: "1123px", backgroundColor: "#FFFFFF", color: "#111827" }}>
          <div>
            <div className="flex items-start justify-between border-b-2 border-[#1E1B4B] pb-4 mb-6 pt-4">
              <div>
                <h2 className="text-2xl font-black text-[#1E1B4B] tracking-tight m-0 leading-none mb-1">MECURA</h2>
                <p className="text-[11px] text-[#059669] font-bold tracking-wider uppercase m-0 leading-none">
                  CENTRO INTEGRADO DE MEDICINA CANABINOIDE
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-[#1E1B4B] m-0">{docName}</h3>
                <p className="text-xs text-[#475569] font-semibold m-0">{docCrm}</p>
                <p className="text-[10px] text-[#64748B] m-0">{docSpec}</p>
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-xl font-black text-[#1E1B4B] tracking-widest uppercase mb-2">LAUDO PSICOMOTOR</h1>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#059669] mb-4">AVALIAÇÃO DA LEI DO DROGÔMETRO / APTIDÃO</p>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2 text-sm text-[#475569]">
                  <span className="font-bold text-[#1E1B4B]">PACIENTE:</span>
                  <span className="font-semibold">{sanitizedUserName}</span>
                </div>
                <div className="flex items-center justify-center gap-6 text-xs text-[#64748B]">
                  {birthDateText !== 'Não informada' && (
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-[#475569]">NASCIMENTO:</span> {birthDateText}
                    </span>
                  )}
                  {cpfText !== 'Não informado' && (
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-[#475569]">CPF:</span> {cpfText}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 text-sm text-[#334155] leading-relaxed text-justify">
              <p>
                Declaro, para os devidos fins de direito, que o(a) paciente <strong>{sanitizedUserName}</strong>, 
                inscrito(a) no CPF <strong>{cpfText}</strong>, encontra-se em acompanhamento médico regular neste 
                Centro Integrado de Medicina Canabinoide.
              </p>
              <p>
                O(a) paciente faz uso terapêutico de produtos derivados de Cannabis, estritamente conforme 
                prescrição médica, sob supervisão e com acompanhamento clínico contínuo. 
              </p>
              <p>
                Atesto, baseado em exames clínicos e testes de rastreio de capacidade psicomotora realizados 
                durante as consultas de monitoramento, que o uso das medicações prescritas, nas doses estipuladas, 
                <strong> NÃO RESULTA </strong> em alteração da capacidade psicomotora, prejuízo cognitivo, ou 
                comprometimento dos reflexos e estado de alerta do paciente.
              </p>
              <p>
                O tratamento prescrito não interfere em sua capacidade de operar máquinas complexas, conduzir 
                veículos automotores ou exercer atividades laborais que exijam atenção e precisão, não configurando 
                infração à legislação de trânsito relacionada ao comprometimento psicomotor ("Lei Seca" ou "Lei do Drogômetro" - Art. 165 do CTB).
              </p>
              <p>
                Ressalto que os canabinoides prescritos têm finalidade exclusivamente terapêutica, 
                sendo legalmente importados (RDC 660/2022 ANVISA) e/ou adquiridos via Associações de Pacientes, 
                e não se enquadram como substâncias psicoativas entorpecentes de uso recreativo capazes de 
                causar dependência ou prejuízo sensório-motor nas doses tituladas.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[#E2E8F0]">
            <div className="flex flex-col items-center">
              <div className="w-52 h-0 border-b border-[#CBD5E1] mb-2"></div>
              <p className="text-sm font-bold text-[#1E1B4B]">{docName}</p>
              <p className="text-xs text-[#64748B] mb-4">{docCrm}</p>
              <div className="flex justify-between w-full text-[10px] text-[#94A3B8] font-semibold">
                <span>{emissionDateStr}</span>
                <span>Válido em todo o território nacional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '0';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.style.opacity = '1';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<PdfComponent />);

  await new Promise(resolve => setTimeout(resolve, 800));

  const opt = {
    margin: 0,
    filename: \`Laudo_Psicomotor_\${sanitizedUserName.replace(/\\s+/g, '_')}.pdf\`,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2, useCORS: true, logging: false, windowWidth: 794, scrollY: 0, scrollX: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  if (patientData?.returnBlob) {
    const pdfBlob = await html2pdf().set(opt).from(container.firstElementChild || container).output('blob');
    root.unmount();
    document.body.removeChild(container);
    return pdfBlob;
  }

  await html2pdf().set(opt).from(container.firstElementChild || container).save();

  root.unmount();
  document.body.removeChild(container);
};
`
fs.writeFileSync(file, content + '\n' + additionalCode);
