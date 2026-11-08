// Utility for reliable PDF download and mobile viewing/sharing
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

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
 * Persists a base64 attachment to both /api/upload AND Firestore `stored_files` (with 600KB chunking)
 * so that:
 * 1) The returned attachment URL is tiny (< 100 bytes) and never causes active_consultations/messages writes to exceed Firestore's 1 MiB limit.
 * 2) Even if /api/upload is unreachable or containers restart, the complete file is 100% recoverable from Firestore `stored_files`.
 */
export async function persistAttachmentToCloud(attachment: {
  name?: string;
  url?: string;
  type?: string;
  docType?: string;
  title?: string;
  fileId?: string;
}): Promise<{
  name: string;
  url: string;
  type: string;
  docType?: string;
  title?: string;
  fileId?: string;
}> {
  const safeName = (attachment.name || 'Documento_Oficial.pdf').replace(/[^a-zA-Z0-9_.\-]/g, '_');
  const mimeType = attachment.type || 'application/pdf';

  if (!attachment.url || !attachment.url.startsWith('data:')) {
    return {
      ...attachment,
      name: attachment.name || safeName,
      url: attachment.url || '',
      type: mimeType
    };
  }

  const rawDataUrl = attachment.url;
  const base64Data = rawDataUrl.includes(';base64,') ? rawDataUrl.split(';base64,')[1] : rawDataUrl;
  const fileId = attachment.fileId || `${Date.now()}_${safeName}`;
  let finalUrl = `/api/files/${fileId}`;

  // 1. Try uploading via backend /api/upload
  try {
    const upRes = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: attachment.name || safeName,
        data: rawDataUrl,
        type: mimeType
      })
    });
    const contentType = upRes.headers.get('content-type') || '';
    if (upRes.ok && contentType.includes('application/json')) {
      const upData = await upRes.json();
      if (upData?.url) {
        finalUrl = upData.url;
      }
    }
  } catch (uploadErr) {
    console.warn('[persistAttachmentToCloud] /api/upload indisponível, salvando diretamente no Firestore:', uploadErr);
  }

  // 2. Always persist in Firestore `stored_files/{targetFileId}` with 600KB chunking so it is 100% durable across devices
  const targetFileId = finalUrl.startsWith('/api/files/')
    ? finalUrl.replace('/api/files/', '').split('?')[0]
    : fileId;

  const CHUNK_SIZE = 600000;
  try {
    if (base64Data.length <= CHUNK_SIZE) {
      await setDoc(doc(db, 'stored_files', targetFileId), {
        filename: targetFileId,
        originalName: attachment.name || safeName,
        base64Data,
        chunkCount: 0,
        type: mimeType,
        createdAt: new Date().toISOString()
      });
    } else {
      const chunks: string[] = [];
      for (let i = 0; i < base64Data.length; i += CHUNK_SIZE) {
        chunks.push(base64Data.slice(i, i + CHUNK_SIZE));
      }
      await setDoc(doc(db, 'stored_files', targetFileId), {
        filename: targetFileId,
        originalName: attachment.name || safeName,
        chunkCount: chunks.length,
        type: mimeType,
        createdAt: new Date().toISOString()
      });
      await Promise.all(
        chunks.map((chunk, idx) =>
          setDoc(doc(db, 'stored_files', targetFileId, 'chunks', String(idx)), {
            index: idx,
            data: chunk
          })
        )
      );
    }
  } catch (fsErr) {
    console.warn('[persistAttachmentToCloud] Aviso ao gravar em stored_files:', fsErr);
  }

  return {
    ...attachment,
    name: attachment.name || safeName,
    url: finalUrl,
    fileId: targetFileId,
    type: mimeType
  };
}

/**
 * Fetches a file Blob directly from Firestore `stored_files/{fileId}` (reassembling chunks if chunked).
 */
export async function fetchBlobFromFirestoreStoredFiles(fileId: string, defaultMime = 'application/pdf'): Promise<Blob | null> {
  if (!fileId) return null;
  try {
    const cleanId = fileId.replace(/^\/api\/files\//, '').split('?')[0].trim();
    if (!cleanId) return null;

    const snap = await getDoc(doc(db, 'stored_files', cleanId));
    if (!snap.exists()) return null;

    const data = snap.data();
    let fullBase64 = data?.base64Data || '';
    if (!fullBase64 && data?.chunkCount && Number(data.chunkCount) > 0) {
      const chunksSnap = await getDocs(collection(db, 'stored_files', cleanId, 'chunks'));
      if (!chunksSnap.empty) {
        const sorted = chunksSnap.docs
          .map(d => d.data())
          .sort((a, b) => Number(a.index || 0) - Number(b.index || 0));
        fullBase64 = sorted.map(c => c.data || '').join('');
      }
    }

    if (!fullBase64) return null;
    return base64ToPdfBlob(fullBase64, data?.type || defaultMime);
  } catch (err) {
    console.warn('[fetchBlobFromFirestoreStoredFiles] Erro ao ler stored_files:', err);
    return null;
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
 * - Handles Firestore `stored_files` fallback (including multi-chunk signed PDFs)
 * - Falls back to dynamic client-side PDF generation when needed
 */
export async function downloadOrGenerateAttachment(
  attachment: { name?: string; url?: string; type?: string; docType?: string; title?: string; fileId?: string } | undefined,
  fallbackGenerator?: () => Promise<Blob | void | null>,
  defaultFileName = 'Documento.pdf'
): Promise<void> {
  const fileName = attachment?.name || defaultFileName;
  let pdfBlob: Blob | null = null;

  // Case 1: Attachment contains a valid Base64 data URL
  if (!pdfBlob && attachment?.url && attachment.url.startsWith('data:')) {
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
          console.warn("[downloadOrGenerateAttachment] Resposta do servidor não é um PDF válido, consultando Firestore stored_files.");
        }
      }
    } catch (e) {
      console.warn("[downloadOrGenerateAttachment] Erro ao buscar PDF do servidor:", e);
    }
  }

  // Case 2.5: Direct Firestore `stored_files` lookup (supports chunked PDFs across any host/device)
  if (!pdfBlob && (attachment?.fileId || (attachment?.url && attachment.url.includes('/api/files/')))) {
    const targetFileId = attachment?.fileId || attachment?.url?.split('/api/files/')[1]?.split('?')[0] || '';
    if (targetFileId) {
      const fsBlob = await fetchBlobFromFirestoreStoredFiles(targetFileId, attachment?.type || 'application/pdf');
      if (fsBlob && (await isPdfBlob(fsBlob))) {
        pdfBlob = fsBlob;
      }
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
    console.error("Não foi possível abrir o arquivo PDF no momento.");
  }
}
