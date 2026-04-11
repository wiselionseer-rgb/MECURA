import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { Message } from '../store/useStore';

export const generatePrescriptionPDF = (userName: string, messages: Message[]) => {
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
  doc.setFontSize(14);
  doc.text("DADOS DO PACIENTE", 20, 65);
  
  doc.setLineWidth(0.5);
  doc.setDrawColor(212, 175, 55); // Dourado
  doc.line(20, 68, 190, 68);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Nome:", 20, 80);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  const sanitizedUserName = (userName || 'Paciente').replace(/[–—]/g, '-').replace(/[^\x0A\x0D\x20-\x7E\xA0-\xFF\u0152\u0153\u0178]/g, '');
  doc.text(`${sanitizedUserName}`, 35, 80);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Data:", 140, 80);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(`${format(new Date(), 'dd/MM/yyyy')}`, 152, 80);
  
  // Prescrição
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(40, 40, 40);
  doc.text("PRESCRIÇÃO", 20, 105);
  
  doc.setDrawColor(212, 175, 55); // Dourado
  doc.line(20, 108, 190, 108);
  
  let yPos = 120;
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
  
  doc.save(`Receita_${sanitizedUserName.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
};
