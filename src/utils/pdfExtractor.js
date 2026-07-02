import { pdfjs } from 'react-pdf';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = PDFWorker;

export async function extractTextFromPDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      text += pageText + '\n\n';
    }
    return text.trim();
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    return null;
  }
}
