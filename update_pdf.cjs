const fs = require('fs');

let pdfCode = fs.readFileSync('src/utils/pdfGenerator.tsx', 'utf-8');

pdfCode = pdfCode.replace(
  "jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }",
  "jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }"
);

pdfCode = pdfCode.replace(
  "patientData?: PatientPrescriptionData & { returnBlobUrl?: boolean }\n): Promise<string | void> => {",
  "patientData?: PatientPrescriptionData & { returnBlob?: boolean }\n): Promise<Blob | void> => {"
);

pdfCode = pdfCode.replace(
  "if (patientData?.returnBlobUrl) {\n    const pdfBlob = await html2pdf().set(opt).from(container).output('blob');\n    root.unmount();\n    document.body.removeChild(container);\n    return URL.createObjectURL(pdfBlob);\n  }",
  "if (patientData?.returnBlob) {\n    const pdfBlob = await html2pdf().set(opt).from(container).output('blob');\n    root.unmount();\n    document.body.removeChild(container);\n    return pdfBlob;\n  }"
);

fs.writeFileSync('src/utils/pdfGenerator.tsx', pdfCode);

let chatCode = fs.readFileSync('src/screens/ChatScreen.tsx', 'utf-8');

chatCode = chatCode.replace(
  "const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);",
  "const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);"
);

chatCode = chatCode.replace(
  "&& !pdfBlobUrl &&",
  "&& !pdfBlob &&"
);

chatCode = chatCode.replace(
  "returnBlobUrl: true",
  "returnBlob: true"
);

chatCode = chatCode.replace(
  "if (typeof url === 'string') setPdfBlobUrl(url);",
  "if (url instanceof Blob) setPdfBlob(url);"
);

chatCode = chatCode.replace(
  "pdfBlobUrl,",
  "pdfBlob,"
);

// We replace the handleGeneratePDF function body
chatCode = chatCode.replace(
  "  const handleGeneratePDF = () => {\n    setIsGeneratingPDF(true);\n    generatePrescriptionPDF(userName, messages, {\n      birthDate: userBirthDate || (answers && answers.birthDate),\n      cpf: userCpf || (answers && answers.cpf),\n      returnBlobUrl: true\n    }).then(url => {\n      if (typeof url === 'string') setPdfBlobUrl(url);\n      setIsGeneratingPDF(false);\n    }).catch(err => {\n      console.error(err);\n      setIsGeneratingPDF(false);\n    });\n  };",
  "  const handleGeneratePDF = async () => {\n    setIsGeneratingPDF(true);\n    try {\n      const blob = await generatePrescriptionPDF(userName, messages, {\n        birthDate: userBirthDate || (answers && answers.birthDate),\n        cpf: userCpf || (answers && answers.cpf),\n        returnBlob: true\n      });\n      if (blob instanceof Blob) {\n        setPdfBlob(blob);\n        triggerDownloadOrShare(blob);\n      }\n    } catch(err) {\n      console.error(err);\n    } finally {\n      setIsGeneratingPDF(false);\n    }\n  };\n\n  const triggerDownloadOrShare = async (blob: Blob) => {\n    const fileName = `Receita_${userName || 'Paciente'}.pdf`;\n    if (navigator.share && navigator.canShare) {\n      try {\n        const file = new File([blob], fileName, { type: 'application/pdf' });\n        if (navigator.canShare({ files: [file] })) {\n          await navigator.share({ files: [file], title: 'Receita Médica' });\n          return;\n        }\n      } catch (e) {\n        console.log('Share API falhou, usando fallback', e);\n      }\n    }\n    const url = URL.createObjectURL(blob);\n    const a = document.createElement('a');\n    a.href = url;\n    a.download = fileName;\n    document.body.appendChild(a);\n    a.click();\n    document.body.removeChild(a);\n    setTimeout(() => URL.revokeObjectURL(url), 100);\n  };"
);

// We replace the button JSX
const oldJsx = `<a
                        href={pdfBlobUrl || '#'}
                        download={\`Receita_\${userName || 'Paciente'}.pdf\`}
                        onClick={(e) => {
                           if (!pdfBlobUrl) {
                             e.preventDefault();
                             if (!isGeneratingPDF) handleGeneratePDF();
                           }
                        }}
                        className={\`w-full flex items-center justify-center bg-mecura-neon text-black font-bold shadow-[0_0_20px_rgba(166,255,0,0.25)] rounded-xl h-12 \${!pdfBlobUrl ? 'opacity-70 cursor-wait' : 'hover:bg-[#b5ff33]'}\`}
                      >
                        {isGeneratingPDF ? (
                          <span className=\"flex items-center gap-2\">
                            <div className=\"w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin\" />
                            Gerando PDF...
                          </span>
                        ) : (
                          <span className=\"flex items-center gap-2\">
                            <Download className=\"w-4 h-4\" /> Baixar PDF
                          </span>
                        )}
                      </a>`;
                      
const newJsx = `<button
                        onClick={(e) => {
                           e.preventDefault();
                           if (pdfBlob) {
                             triggerDownloadOrShare(pdfBlob);
                           } else if (!isGeneratingPDF) {
                             handleGeneratePDF();
                           }
                        }}
                        className={\`w-full flex items-center justify-center bg-mecura-neon text-black font-bold shadow-[0_0_20px_rgba(166,255,0,0.25)] rounded-xl h-12 \${!pdfBlob ? 'opacity-70 cursor-wait' : 'hover:bg-[#b5ff33]'}\`}
                      >
                        {isGeneratingPDF ? (
                          <span className=\"flex items-center gap-2\">
                            <div className=\"w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin\" />
                            Gerando PDF...
                          </span>
                        ) : (
                          <span className=\"flex items-center gap-2\">
                            <Download className=\"w-4 h-4\" /> Baixar PDF
                          </span>
                        )}
                      </button>`;
                      
chatCode = chatCode.replace(oldJsx, newJsx);

fs.writeFileSync('src/screens/ChatScreen.tsx', chatCode);

