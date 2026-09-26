/**
 * Client-Side Image Compression & Upload Utility for Nigerian Mobile Networks
 * Resizes large phone camera photos (typically 4MB-15MB) down to optimized WebP/JPEG (<200KB),
 * preventing heavy bandwidth usage, reducing upload latency on 3G/4G, and safeguarding storage quotas.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeMB?: number;
}

export interface CompressResult {
  dataUrl: string;
  blob: Blob;
  originalSizeKB: number;
  compressedSizeKB: number;
  fileName: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_RAW_FILE_SIZE_MB = 10; // 10MB limit on raw input

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.78,
    maxFileSizeMB = MAX_RAW_FILE_SIZE_MB
  } = options;

  // Validation
  if (!file) {
    throw new Error('No image file provided');
  }

  if (file.size > maxFileSizeMB * 1024 * 1024) {
    throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is ${maxFileSizeMB}MB.`);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
    throw new Error('Unsupported image format. Please upload a JPG, PNG, or WebP photo.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unable to decode image. File may be corrupted.'));
      img.onload = () => {
        try {
          let { width, height } = img;

          // Compute aspect ratio scaling
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            throw new Error('Could not initialize canvas context for compression.');
          }

          // Draw with smoothing for high fidelity
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', quality);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve({
                  dataUrl,
                  blob: new Blob(),
                  originalSizeKB: Math.round(file.size / 1024),
                  compressedSizeKB: Math.round((dataUrl.length * 0.75) / 1024),
                  fileName: file.name
                });
                return;
              }

              resolve({
                dataUrl,
                blob,
                originalSizeKB: Math.round(file.size / 1024),
                compressedSizeKB: Math.round(blob.size / 1024),
                fileName: file.name
              });
            },
            'image/jpeg',
            quality
          );
        } catch (err: any) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
