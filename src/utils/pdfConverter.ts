import { jsPDF } from 'jspdf';

/**
 * Optimizes an image element onto a canvas with high text legibility and balanced compression.
 * Maintains crisp quality for handwritten notes, equations, and diagrams.
 */
function compressImageToDataUrl(
  img: HTMLImageElement,
  maxDimension: number = 2048,
  quality: number = 0.88
): { dataUrl: string; width: number; height: number } {
  let width = img.naturalWidth || img.width || 1200;
  let height = img.naturalHeight || img.height || 1600;

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
  const ctx = canvas.getContext('2d', { willReadFrequently: false });

  let dataUrl = '';
  if (ctx) {
    // Fill pure white background to prevent transparent PNG / WEBP black artifacts
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  } else {
    dataUrl = img.src;
  }

  // Free canvas memory buffer immediately to prevent browser memory leaks
  canvas.width = 0;
  canvas.height = 0;

  return { dataUrl, width, height };
}

/**
 * Efficiently loads an image File (JPG, JPEG, PNG, WEBP) into an HTMLImageElement using ObjectURL.
 * Avoids heavy base64 heap spikes and prevents memory leaks.
 */
function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`ছবি "${file.name}" লোড করা সম্ভব হয়নি। সঠিক JPG, JPEG, PNG অথবা WEBP ফাইল নির্বাচন করুন।`));
    };

    img.src = objectUrl;
  });
}

/**
 * Converts multiple image Files (PNG, JPG, JPEG, WEBP) to a standardized multi-page PDF.
 * Preserves high text legibility while compressing photo files for seamless uploads.
 */
export async function convertImagesToPdf(
  imageFiles: File[],
  customTitle?: string,
  onProgress?: (progress: number) => void
): Promise<File> {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('PDF তৈরির জন্য কোনো ছবি পাওয়া যায়নি।');
  }

  // Standard A4 dimensions in points: 595.28 x 841.89
  const a4Width = 595.28;
  const a4Height = 841.89;
  const margin = 14;

  let pdf: jsPDF | null = null;
  const total = imageFiles.length;

  for (let i = 0; i < total; i++) {
    const file = imageFiles[i];
    let img: HTMLImageElement | null = null;

    try {
      img = await loadImageFile(file);
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
          format: 'a4',
          compress: true
        });
      } else if (pdf) {
        pdf.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      }

      if (pdf) {
        pdf.addImage(dataUrl, 'JPEG', x, y, finalWidth, finalHeight, undefined, 'FAST');
      }
    } finally {
      if (img) {
        img.src = '';
      }
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }
  }

  if (!pdf) {
    throw new Error('PDF ডকুমেন্ট তৈরি ব্যর্থ হয়েছে।');
  }

  const pdfBlob = pdf.output('blob');
  const baseName = (customTitle || imageFiles[0].name.replace(/\.[^/.]+$/, ''))
    .trim()
    .slice(0, 40)
    .replace(/[/\\?%*:|"<>]/g, '_');

  const cleanName = `${baseName || 'ssc_notes'}_multipage.pdf`;
  return new File([pdfBlob], cleanName, { type: 'application/pdf' });
}

/**
 * Converts a single image File (PNG, JPG, JPEG, WEBP) to a standard PDF File.
 */
export async function convertImageToPdf(imageFile: File): Promise<File> {
  return convertImagesToPdf([imageFile]);
}
