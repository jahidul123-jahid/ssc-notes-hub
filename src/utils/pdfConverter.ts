import { jsPDF } from 'jspdf';

/**
 * Optimizes an image element onto a canvas with balanced resolution and high text legibility.
 * Keeps file size small (~200KB-400KB per page) so users can upload unlimited pages without lag.
 */
function compressImageToDataUrl(img: HTMLImageElement, maxDimension: number = 1800, quality: number = 0.85): { dataUrl: string; width: number; height: number } {
  let { width, height } = img;

  if (width > maxDimension || height > maxDimension) {
    if (width > height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Fill white background to avoid transparent PNG black artifacts in PDF
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    return { dataUrl, width, height };
  }

  return { dataUrl: img.src, width: img.width, height: img.height };
}

/**
 * Loads an image File into an HTMLImageElement.
 */
function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Converts multiple image Files (PNG, JPG, JPEG, WEBP) to a unified multi-page PDF.
 * Allows unlimited pages and auto-compresses phone photos to prevent oversized files.
 */
export async function convertImagesToPdf(
  imageFiles: File[],
  customTitle?: string,
  onProgress?: (progress: number) => void
): Promise<File> {
  if (imageFiles.length === 0) {
    throw new Error('No images provided for PDF conversion.');
  }

  // Standard A4 dimensions in points: 595.28 x 841.89
  const a4Width = 595.28;
  const a4Height = 841.89;
  const margin = 15;

  let pdf: jsPDF | null = null;
  const total = imageFiles.length;

  for (let i = 0; i < total; i++) {
    const file = imageFiles[i];
    const img = await loadImageFile(file);
    const { dataUrl, width, height } = compressImageToDataUrl(img);

    const isLandscape = width > height;
    const pageWidth = isLandscape ? a4Height : a4Width;
    const pageHeight = isLandscape ? a4Width : a4Height;

    const maxTargetWidth = pageWidth - margin * 2;
    const maxTargetHeight = pageHeight - margin * 2;

    const widthRatio = maxTargetWidth / width;
    const heightRatio = maxTargetHeight / height;
    const scale = Math.min(widthRatio, heightRatio, 1);

    const finalWidth = width * scale;
    const finalHeight = height * scale;

    const x = (pageWidth - finalWidth) / 2;
    const y = (pageHeight - finalHeight) / 2;

    if (i === 0) {
      pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'pt',
        format: 'a4'
      });
    } else if (pdf) {
      pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
    }

    if (pdf) {
      pdf.addImage(dataUrl, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  if (!pdf) {
    throw new Error('PDF generation failed.');
  }

  const pdfBlob = pdf.output('blob');
  const baseName = customTitle
    ? customTitle.replace(/[/\\?%*:|"<>]/g, '_').slice(0, 40)
    : imageFiles[0].name.substring(0, imageFiles[0].name.lastIndexOf('.')) || 'ssc_notes';

  const cleanName = `${baseName.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]/g, '_')}_multipage.pdf`;
  return new File([pdfBlob], cleanName, { type: 'application/pdf' });
}

/**
 * Converts a single image File (PNG, JPG, JPEG, WEBP) to a standard PDF File.
 */
export async function convertImageToPdf(imageFile: File): Promise<File> {
  return convertImagesToPdf([imageFile]);
}
