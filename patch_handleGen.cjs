const fs = require('fs');

let code = fs.readFileSync('src/screens/ChatScreen.tsx', 'utf-8');

code = code.replace(
  "  const handleGeneratePDF = () => {\n    generatePrescriptionPDF(userName, messages, {\n      birthDate: userBirthDate || (answers && answers.birthDate),\n      cpf: userCpf || (answers && answers.cpf)\n    });\n  };",
  "  const handleGeneratePDF = () => {\n    setIsGeneratingPDF(true);\n    generatePrescriptionPDF(userName, messages, {\n      birthDate: userBirthDate || (answers && answers.birthDate),\n      cpf: userCpf || (answers && answers.cpf),\n      returnBlobUrl: true\n    }).then(url => {\n      if (typeof url === 'string') setPdfBlobUrl(url);\n      setIsGeneratingPDF(false);\n    }).catch(err => {\n      console.error(err);\n      setIsGeneratingPDF(false);\n    });\n  };"
);

fs.writeFileSync('src/screens/ChatScreen.tsx', code);
