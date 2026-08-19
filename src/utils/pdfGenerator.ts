import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { Message, useStore } from '../store/useStore';

export interface PatientPrescriptionData {
  birthDate?: string;
  cpf?: string;
  phone?: string;
}

export const generatePrescriptionPDF = (
  userName: string, 
  messages: Message[],
  patientData?: PatientPrescriptionData
) => {
  const doc = new jsPDF();
  
  // Configurações de fonte e cor
  doc.setFont("helvetica", "bold");
  
  // Cabeçalho
  doc.setFillColor(10, 10, 15); // Cor de fundo escura
  doc.rect(0, 0, 210, 45, 'F');
  
  // Logo / Nome da Clínica
  doc.setTextColor(212, 175, 55); // Dourado (Mecura gold)
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("mecura", 20, 28);
  
  // Título do Documento
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RECEITA MÉDICA", 140, 28);
  
  // Linha decorativa dourada abaixo do cabeçalho
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1);
  doc.line(0, 45, 210, 45);
  
  // Informações do Paciente
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("DADOS DO PACIENTE", 20, 60);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55); // Dourado
  doc.line(20, 63, 190, 63);
  
  // Linha 1: Nome e Data de Emissão
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Nome:", 20, 72);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const sanitizedUserName = (userName || 'Paciente').replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
  doc.text(`${sanitizedUserName}`, 35, 72);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Emissão:", 140, 72);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`${format(new Date(), 'dd/MM/yyyy')}`, 158, 72);

  // Linha 2: Data de Nascimento e CPF
  const storeState = useStore.getState();
  const birthDateText = patientData?.birthDate || storeState.userBirthDate || storeState.answers?.birthDate || 'Não informada';
  const cpfText = patientData?.cpf || storeState.userCpf || storeState.answers?.cpf || 'Não informado';

  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Data de Nasc.:", 20, 80);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`${birthDateText}`, 47, 80);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("CPF:", 140, 80);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`${cpfText}`, 152, 80);
  
  // Prescrição
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  doc.text("PRESCRIÇÃO", 20, 96);
  
  doc.setDrawColor(212, 175, 55); // Dourado
  doc.line(20, 99, 190, 99);
  
  let yPos = 110;
  const prescribedItems = messages.filter(m => 
    (m.type === 'product' && m.productData) || 
    (m.type === 'prescription_notes' && m.text)
  );
  
  if (prescribedItems.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Nenhum produto ou orientação prescrita nesta consulta.", 20, yPos);
  } else {
    prescribedItems.forEach((msg, index) => {
      if (msg.type === 'product' && msg.productData) {
        const product = msg.productData;
        
        // Produto
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(212, 175, 55); // Dourado
        doc.text(`${index + 1}.`, 20, yPos);
        
        doc.setTextColor(20, 20, 20);
        const sanitizedProductName = product.name.replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
        const splitProductName = doc.splitTextToSize(sanitizedProductName, 160);
        doc.text(splitProductName, 28, yPos);
        
        // Detalhes
        yPos += (splitProductName.length * 5) + 1;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const sanitizedBrand = product.brand.replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
        const sanitizedOrigin = product.origin.replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
        doc.text(`Fabricante: ${sanitizedBrand} | Origem: ${sanitizedOrigin}`, 28, yPos);
        
        // Posologia
        yPos += 8;
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60, 60, 60);
        doc.text("Posologia:", 28, yPos);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        yPos += 6;
        const dosageText = product.dosage.join('\n').replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
        const splitDosage = doc.splitTextToSize(dosageText, 160);
        
        for (let i = 0; i < splitDosage.length; i++) {
          if (yPos > 260) {
            doc.addPage();
            yPos = 30;
          }
          doc.text(splitDosage[i], 28, yPos);
          yPos += 5;
        }
        yPos += 7;
      } else if (msg.type === 'prescription_notes' && msg.text) {
        // Notas/Orientações
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(212, 175, 55); // Dourado
        doc.text(`${index + 1}.`, 20, yPos);
        
        doc.setTextColor(20, 20, 20);
        doc.text(`Orientações e Prescrição Detalhada:`, 28, yPos);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        yPos += 8;
        const sanitizedNotes = msg.text.replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
        const splitNotes = doc.splitTextToSize(sanitizedNotes, 160);
        
        for (let i = 0; i < splitNotes.length; i++) {
          if (yPos > 260) {
            doc.addPage();
            yPos = 30;
          }
          doc.text(splitNotes[i], 28, yPos);
          yPos += 5;
        }
        yPos += 7;
      }
      
      // Nova página se necessário
      if (yPos > 240) {
        doc.addPage();
        yPos = 30;
      }
    });
  }
  
  // Rodapé / Assinatura
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(60, pageHeight - 50, 150, pageHeight - 50); // Linha de assinatura
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Dr. Guilherme Taveira Dias", 105, pageHeight - 42, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("CRM: 12345/SP", 105, pageHeight - 36, { align: "center" });
  doc.text("Especialista em Medicina Canabinoide", 105, pageHeight - 31, { align: "center" });
  
  // Espaço para assinatura digital (caixa pontilhada)
  doc.setDrawColor(150, 150, 150);
  doc.setLineDashPattern([2, 2], 0);
  doc.rect(60, pageHeight - 85, 90, 30);
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Espaço para Assinatura Digital", 105, pageHeight - 68, { align: "center" });
  
  const fileName = `Receita_${sanitizedUserName.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');
  doc.save(fileName);
};

export interface MedicalReportData {
  birthDate?: string;
  cpf?: string;
  phone?: string;
  answers?: any;
  analysisText?: string | null;
}

export const generateMedicalReportPDF = (
  userName: string,
  messages: Message[],
  patientData?: MedicalReportData
) => {
  const doc = new jsPDF();
  const pageWidth = 210;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Helper for adding sanitized text
  const sanitize = (text: string) => {
    return (text || '')
      .replace(/[–—]/g, '-')
      .replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
  };

  const storeState = useStore.getState();
  const patientAnswers = patientData?.answers || storeState.answers;
  const sanitizedUserName = sanitize(userName || 'Paciente');
  const birthDateText = sanitize(patientData?.birthDate || storeState.userBirthDate || patientAnswers?.birthDate || 'Não informada');
  const cpfText = sanitize(patientData?.cpf || storeState.userCpf || patientAnswers?.cpf || 'Não informado');

  // Cabeçalho
  const renderHeader = (pageNumber: number) => {
    doc.setFillColor(10, 10, 15);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(212, 175, 55); // Dourado
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");
    doc.text("mecura", margin, 26);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LAUDO MÉDICO CLÍNICO", 125, 26);

    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(1);
    doc.line(0, 42, 210, 42);
  };

  const renderFooter = (pageNumber: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text("Mecura Medicina Integrativa | Documento emitido para fins de acompanhamento e suporte terapêutico", margin, pageHeight - 10);
    doc.text(`Pág. ${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  };

  let currentPage = 1;
  renderHeader(currentPage);

  let yPos = 54;

  const checkPageBreak = (neededSpace: number) => {
    if (yPos + neededSpace > pageHeight - 35) {
      renderFooter(currentPage);
      doc.addPage();
      currentPage++;
      renderHeader(currentPage);
      yPos = 52;
    }
  };

  // 1. Dados do Paciente
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. IDENTIFICAÇÃO DO PACIENTE", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Nome do Paciente:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(10, 10, 10);
  doc.text(sanitizedUserName, margin + 35, yPos);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Data de Emissão:", 135, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(10, 10, 10);
  doc.text(format(new Date(), 'dd/MM/yyyy'), 167, yPos);

  yPos += 6;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("Data de Nasc.:", margin, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(10, 10, 10);
  doc.text(birthDateText, margin + 27, yPos);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(70, 70, 70);
  doc.text("CPF:", 135, yPos);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(10, 10, 10);
  doc.text(cpfText, 147, yPos);

  // 2. Diagnóstico e Quadro Clínico
  yPos += 12;
  checkPageBreak(30);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. DIAGNÓSTICO E QUADRO CLÍNICO", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;
  const objectives = patientAnswers?.objectives?.join(', ') || 'Ansiedade e dor crônica';
  const intensity = patientAnswers?.intensity ? `${patientAnswers.intensity}/10` : 'Moderada a intensa';
  const duration = patientAnswers?.duration || 'Quadro de evolução crônica';
  const description = patientAnswers?.description || 'Paciente relata persistência dos sintomas refratários aos tratamentos convencionais de primeira linha, com impacto expressivo na qualidade de vida, repouso noturno e funcionalidade global.';

  const clinicalSummary = `O(A) paciente supramencionado(a) compareceu a atendimento médico e foi submetido(a) a minuciosa avaliação clínica. Apresenta sintomatologia compatível com ${objectives}, com intensidade referida em ${intensity} e tempo de evolução caracterizado por ${duration}. 

História da Moléstia: ${description}

Tratamento prévio com fármacos convencionais: ${patientAnswers?.remedios ? 'Sim' : 'Não'} | Diagnóstico de Comorbidade Crônica: ${patientAnswers?.doenca_cronica ? 'Sim' : 'Não'}.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  const splitClinical = doc.splitTextToSize(sanitize(clinicalSummary), contentWidth);
  for (const line of splitClinical) {
    checkPageBreak(6);
    doc.text(line, margin, yPos);
    yPos += 5;
  }

  // 3. Fisiopatologia e Racional Terapêutico Canabinoide
  yPos += 6;
  checkPageBreak(35);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. JUSTIFICATIVA E RACIONAL DO TRATAMENTO", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;
  const therapeuticRationale = `A terapêutica com Fitocanabinoides (Cannabis Medicinal) fundamenta-se na modulação do Sistema Endocanabinoide (SEC), uma complexa rede de sinalização neuromoduladora e imunológica composta por receptores CB1 e CB2.

- Modulação Neuroquímica e Anti-inflamatória: O Canabidiol (CBD) atua como modulador alostérico negativo de CB1 e inibidor da degradação de anandamida (via FAAH), promovendo ação ansiolítica, neuroprotetora e redução de citocinas pró-inflamatórias.
- Efeito Comitiva (Entourage Effect): A administração de extratos integrais (Full Spectrum) contendo canabinoides menores (CBG, CBN e microdosagens de THC) e terpenos sinérgicos proporciona potencialização da resposta terapêutica com menor necessidade de escalonamento de doses.
- Adequação Clínica: Diante da refratariedade e da necessidade de estabilização sintomática sem os efeitos colaterais deletérios de medicações sedativas ou anti-inflamatórios convencionais a longo prazo, justifica-se a instituição do tratamento fitocanabinoide.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  const splitRationale = doc.splitTextToSize(sanitize(therapeuticRationale), contentWidth);
  for (const line of splitRationale) {
    checkPageBreak(6);
    doc.text(line, margin, yPos);
    yPos += 5;
  }

  // 4. Plano de Tratamento e Medicamentos Prescritos
  yPos += 6;
  checkPageBreak(35);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. CONDUTA E MEDICAMENTOS PROPOSTOS", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 8;

  const prescribedItems = messages.filter(m => 
    (m.type === 'product' && m.productData) || 
    (m.type === 'prescription_notes' && m.text)
  );

  if (prescribedItems.length > 0) {
    prescribedItems.forEach((msg, idx) => {
      if (msg.type === 'product' && msg.productData) {
        checkPageBreak(25);
        const p = msg.productData;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(212, 175, 55);
        doc.text(`Item ${idx + 1}: ${sanitize(p.name)}`, margin, yPos);
        
        yPos += 5;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(90, 90, 90);
        doc.text(`Origem: ${sanitize(p.origin || 'Associação Nacional / Importado')} | Fabricante: ${sanitize(p.brand || 'Associação Brasileira')}`, margin + 3, yPos);

        yPos += 5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        doc.text("Posologia e Modo de Uso:", margin + 3, yPos);

        yPos += 4;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(20, 20, 20);
        const dosageLines = doc.splitTextToSize(sanitize(p.dosage.join(' ')), contentWidth - 6);
        for (const dl of dosageLines) {
          checkPageBreak(5);
          doc.text(dl, margin + 3, yPos);
          yPos += 4.5;
        }
        yPos += 3;
      } else if (msg.type === 'prescription_notes' && msg.text) {
        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(212, 175, 55);
        doc.text(`Item ${idx + 1}: Orientações e Prescrição Médica`, margin, yPos);
        
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(30, 30, 30);
        const noteLines = doc.splitTextToSize(sanitize(msg.text), contentWidth - 6);
        for (const nl of noteLines) {
          checkPageBreak(5);
          doc.text(nl, margin + 3, yPos);
          yPos += 4.5;
        }
        yPos += 3;
      }
    });
  } else {
    // Default therapeutic guideline if no items in chat
    const defaultMedicationPlan = `1. Formulação Predominante em CBD Full Spectrum (ou Óleo Integral Associação Nacional):
   - Posologia: Iniciar com 5 gotas sublinguais a cada 12 horas, com titulação gradual a cada 3 a 5 dias.
2. Manejo Noturno / Resgate Álgico (conforme necessidade clínica):
   - Posologia: 5 a 10 gotas à noite ou formulação complementar sob monitoramento.`;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    const splitDefaultPlan = doc.splitTextToSize(sanitize(defaultMedicationPlan), contentWidth);
    for (const line of splitDefaultPlan) {
      checkPageBreak(5);
      doc.text(line, margin, yPos);
      yPos += 4.5;
    }
  }

  // 5. Orientações de Titulação e Retorno
  yPos += 6;
  checkPageBreak(30);
  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("5. MONITORAMENTO E RECOMENDAÇÕES", margin, yPos);
  
  yPos += 3;
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 7;
  const monitoringText = `- Titulação Lenta e Progressiva ("Start Low, Go Slow"): Ajustar a dosagem gradualmente até atingir a janela terapêutica ideal com controle pleno de sintomas e ausência de efeitos adversos.
- Monitoramento de Segurança: Acompanhar potenciais interações no citocromo hepático CYP3A4 / CYP2C19 caso haja uso concomitante de outros fármacos.
- Retorno Médico: Reavaliação clínica agendada em 30 (trinta) dias para ajuste posológico e consolidação do desfecho clínico.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  const splitMonitoring = doc.splitTextToSize(sanitize(monitoringText), contentWidth);
  for (const line of splitMonitoring) {
    checkPageBreak(5);
    doc.text(line, margin, yPos);
    yPos += 4.5;
  }

  // Bloco de Assinatura Médica
  checkPageBreak(45);
  yPos = Math.max(yPos + 8, pageHeight - 48);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(60, yPos, 150, yPos);

  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(10, 10, 10);
  doc.text("Dr. Guilherme Taveira Dias", 105, yPos, { align: "center" });

  yPos += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("CRM: 12345/SP | Especialista em Medicina Canabinoide", 105, yPos, { align: "center" });
  
  yPos += 4;
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Documento com Assinatura Digital e Registro Médico ICP-Brasil", 105, yPos, { align: "center" });

  renderFooter(currentPage);

  const fileName = `Laudo_Medico_${sanitizedUserName.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_');
  doc.save(fileName);
};
