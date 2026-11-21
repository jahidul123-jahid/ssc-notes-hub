import { jsPDF } from 'jspdf';

/**
 * Converts an image File (PNG, JPG, JPEG, WEBP) to a standard high-quality PDF File.
 * Maintains aspect ratio and centers image neatly on standard page bounds.
 */
export async function convertImageToPdf(imageFile: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Standard A4 dimensions in points: 595.28 x 841.89
          const a4Width = 595.28;
          const a4Height = 841.89;

          // Determine orientation based on image aspect ratio
          const isLandscape = img.width > img.height;
          const pageWidth = isLandscape ? a4Height : a4Width;
          const pageHeight = isLandscape ? a4Width : a4Height;

          // Scale image to fit neatly within margins (20pt padding)
          const margin = 20;
          const maxTargetWidth = pageWidth - margin * 2;
          const maxTargetHeight = pageHeight - margin * 2;

          const widthRatio = maxTargetWidth / img.width;
          const heightRatio = maxTargetHeight / img.height;
          const scale = Math.min(widthRatio, heightRatio, 1); // Don't upscale tiny images

          const finalWidth = img.width * scale;
          const finalHeight = img.height * scale;

          // Center the image on the page
          const x = (pageWidth - finalWidth) / 2;
          const y = (pageHeight - finalHeight) / 2;

          const pdf = new jsPDF({
            orientation: isLandscape ? 'landscape' : 'portrait',
            unit: 'pt',
            format: 'a4'
          });

          // Determine image format for jsPDF
          const format = imageFile.type.includes('png') ? 'PNG' : 'JPEG';
          pdf.addImage(img, format, x, y, finalWidth, finalHeight, undefined, 'FAST');

          const pdfBlob = pdf.output('blob');
          const originalBaseName = imageFile.name.substring(0, imageFile.name.lastIndexOf('.')) || imageFile.name;
          const cleanName = `${originalBaseName.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;

          const pdfFile = new File([pdfBlob], cleanName, { type: 'application/pdf' });
          resolve(pdfFile);
        } catch (err) {
          console.warn("jsPDF conversion fallback:", err);
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(imageFile);
  });
}
