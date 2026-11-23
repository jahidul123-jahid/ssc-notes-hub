import { jsPDF } from 'jspdf';

/**
 * Optimizes an image element onto a canvas with high text legibility and balanced compression.
 * Maintains crisp quality for handwritten notes, equations, and diagrams.
 */
function compressImageToDataUrl(
  img: HTMLImageElement,
  maxDimension: number = 2560,
  quality: number = 0.90
): { dataUrl: string; width: number; height: number } {
  let width = img.naturalWidth || img.width || 1200;
  let height = img.naturalHeight || img.height || 1600;

  // Only downscale if the image exceeds ultra-high resolution limit (2560px)
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
 * Converts multiple image Files (PNG, JPG, JPEG, WEBP) to an optimized, dynamic-sized PDF.
 * Eliminates unnecessary white margins by tailoring each PDF page's dimensions to the
 * exact aspect ratio of each uploaded image.
 *
 * - Zero left/right/top/bottom margins.
 * - Full page utilization without stretching or distorting image proportions.
 * - Preserves high text sharpness for handwritten notes, equations, and diagrams.
 * - Handles portrait, landscape, and mixed orientations seamlessly.
 */
export async function convertImagesToPdf(
  imageFiles: File[],
  customTitle?: string,
  onProgress?: (progress: number) => void
): Promise<File> {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error('PDF তৈরির জন্য কোনো ছবি পাওয়া যায়নি।');
  }

  // Standard reference dimensions in points (pt):
  // 595.28 pt for standard portrait width, 841.89 pt for landscape width
  const STANDARD_PORTRAIT_WIDTH = 595.28;
  const STANDARD_LANDSCAPE_WIDTH = 841.89;

  let pdf: jsPDF | null = null;
  const total = imageFiles.length;

  for (let i = 0; i < total; i++) {
    const file = imageFiles[i];
    let img: HTMLImageElement | null = null;

    try {
      img = await loadImageFile(file);
      const { dataUrl, width, height } = compressImageToDataUrl(img);

      const isLandscape = width > height;

      // Calculate dynamic PDF page dimensions that match the EXACT aspect ratio of the image.
      // This eliminates all empty left, right, top, and bottom white gutters.
      const baseWidth = isLandscape ? STANDARD_LANDSCAPE_WIDTH : STANDARD_PORTRAIT_WIDTH;
      const pageWidth = baseWidth;
      const pageHeight = Number(((baseWidth * height) / width).toFixed(2));
      const orientation = isLandscape ? 'landscape' : 'portrait';

      if (i === 0) {
        pdf = new jsPDF({
          orientation,
          unit: 'pt',
          format: [pageWidth, pageHeight],
          compress: true
        });
      } else if (pdf) {
        pdf.addPage([pageWidth, pageHeight], orientation);
      }

      if (pdf) {
        // Place the image at (0, 0) spanning the entire page dimensions (100% full coverage, 0 margins)
        pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
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
 * Converts a single image File (PNG, JPG, JPEG, WEBP) to an optimized, perfectly-fitted PDF File.
 */
export async function convertImageToPdf(imageFile: File): Promise<File> {
  return convertImagesToPdf([imageFile]);
}
