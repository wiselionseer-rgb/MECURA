// Utility for reliable PDF download and mobile viewing/sharing

/**
 * Checks if a Blob is genuinely a PDF file by inspecting its magic bytes (%PDF-).
 * This prevents opening or saving HTML 404 error pages or corrupted text as a PDF.
 */
export async function isPdfBlob(blob: Blob | null | undefined): Promise<boolean> {
  if (!blob || blob.size < 50) return false;
  try {
    const header = await blob.slice(0, 10).text();
    // Valid PDF files MUST start with %PDF
    return header.startsWith('%PDF');
  } catch {
    return false;
  }
}

export function base64ToPdfBlob(dataUrl: string, contentType = 'application/pdf'): Blob {
  try {
    const raw = dataUrl.includes(';base64,') ? dataUrl.split(';base64,')[1] : dataUrl;
    const cleanBase64 = (raw || '').replace(/\s+/g, '');
    if (!cleanBase64) {
      throw new Error("Base64 string vazia");
    }
    const binaryString = window.atob(cleanBase64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: contentType });
  } catch (err) {
    console.error("Erro ao converter base64 para Blob:", err);
    throw err;
  }
}

/**
 * Delivers a PDF blob directly to the user:
 * - Direct download on Desktop (Windows, Mac, Linux) and Android into the Downloads folder without triggering OS share dialogs.
 * - On iOS Safari: Opens in native PDF viewer tab so iOS users can read and save immediately.
 */
export async function deliverPdfBlob(blob: Blob, fileName: string): Promise<boolean> {
  const safeFileName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  
  // Ensure the blob has the proper MIME type
  const pdfBlob = blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });

  try {
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Direct binary download (Desktop Windows/Mac, Android, iOS and iframes)
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = safeFileName;
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    
    // Revoke the object URL after a delay
    setTimeout(() => {
      try {
        if (a.parentNode) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(blobUrl);
      } catch {
        // ignore
      }
    }, 60000);
    return true;
  } catch (err) {
    console.error("Falha ao disparar download do Blob:", err);
    try {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = safeFileName;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          if (a.parentNode) document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        } catch {
          // ignore
        }
      }, 60000);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Universal PDF attachment downloader:
 * - Handles base64 data URLs by converting to binary Blob and checking PDF integrity
 * - Handles server URLs (/api/files/...) by fetching as binary Blob and checking PDF integrity
 * - Detects corrupted, empty, or HTML 404 responses and falls back to dynamic client-side generation
 */
export async function downloadOrGenerateAttachment(
  attachment: { name?: string; url?: string; type?: string; docType?: string; title?: string } | undefined,
  fallbackGenerator?: () => Promise<Blob | void | null>,
  defaultFileName = 'Documento.pdf'
): Promise<void> {
  const fileName = attachment?.name || defaultFileName;
  let pdfBlob: Blob | null = null;

  // Case 1: Attachment contains a valid Base64 data URL
  if (attachment?.url && attachment.url.startsWith('data:')) {
    try {
      const candidate = base64ToPdfBlob(attachment.url, attachment.type || 'application/pdf');
      if (await isPdfBlob(candidate)) {
        pdfBlob = candidate;
      } else {
        console.warn("[downloadOrGenerateAttachment] Base64 decodificado não possui cabeçalho %PDF válido.");
      }
    } catch (e) {
      console.warn("[downloadOrGenerateAttachment] Base64 inválido, tentando fallback:", e);
    }
  }

  // Case 2: Attachment contains a server URL (/api/files/... or http...)
  if (!pdfBlob && attachment?.url && attachment.url.trim().length > 5 && !attachment.url.startsWith('data:')) {
    try {
      const res = await fetch(attachment.url, { cache: 'no-cache' });
      if (res.ok) {
        const fetchedBlob = await res.blob();
        if (await isPdfBlob(fetchedBlob)) {
          pdfBlob = new Blob([fetchedBlob], { type: 'application/pdf' });
        } else {
          console.warn("[downloadOrGenerateAttachment] Resposta do servidor não é um PDF válido (provável HTML 404/500).");
        }
      }
    } catch (e) {
      console.warn("[downloadOrGenerateAttachment] Erro ao buscar PDF do servidor:", e);
    }
  }

  // Case 3: If no valid blob could be obtained and we have a fallback generator, generate it!
  if (!pdfBlob && fallbackGenerator) {
    console.log("[downloadOrGenerateAttachment] Gerando PDF dinamicamente via gerador de fallback...");
    try {
      const generated = await fallbackGenerator();
      if (generated instanceof Blob) {
        if (await isPdfBlob(generated)) {
          pdfBlob = generated;
        } else {
          console.warn("[downloadOrGenerateAttachment] Gerador retornou blob que não é PDF.");
        }
      }
    } catch (genErr) {
      console.error("[downloadOrGenerateAttachment] Erro no gerador de fallback:", genErr);
    }
  }

  // If we have a validated blob, deliver it safely
  if (pdfBlob) {
    await deliverPdfBlob(pdfBlob, fileName);
  } else {
    alert("Não foi possível abrir o arquivo PDF no momento. Por favor, solicite a reemissão do documento ao médico ou tente novamente.");
  }
}
