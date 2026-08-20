const fs = require('fs');

let content = fs.readFileSync('src/screens/DoctorDashboardScreen.tsx', 'utf8');

const targetStr = `      const response = await fetch('/api/analyze-clinical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (data.text) {
        setAnalysisResult(data.text);
      } else {
        setAnalysisResult(data.error || "Não foi possível gerar a análise. Tente novamente.");
      }`;

const replacementStr = `      const apiKey = process.env.GEMINI_API_KEY;
      let responseText = null;

      if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
        try {
          const { GoogleGenAI } = await import('@google/genai');
          const ai = new GoogleGenAI({ 
            apiKey,
            httpOptions: {}
          });
          
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          if (response.text) {
            responseText = response.text;
          }
        } catch (error) {
          console.warn("API Gemini Error, applying fallback protocol:", error);
          const { generateClinicalAnalysisFallback } = await import('../utils/aiAnalysisFallback');
          responseText = generateClinicalAnalysisFallback(prompt);
        }
      } else {
        const { generateClinicalAnalysisFallback } = await import('../utils/aiAnalysisFallback');
        responseText = generateClinicalAnalysisFallback(prompt);
      }

      if (responseText) {
        setAnalysisResult(responseText);
      } else {
        setAnalysisResult("Não foi possível gerar a análise. Tente novamente.");
      }`;

if(content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/screens/DoctorDashboardScreen.tsx', content, 'utf8');
  console.log("Patched DoctorDashboardScreen");
} else {
  console.log("Could not find target string");
}

