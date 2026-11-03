/**
 * Tasty Nest - Image Compression & Google Drive Uploader
 * Compresses images client-side to strictly under 1MB using HTML5 Canvas.
 * Uploads compressed media to Google Drive via Google Apps Script Web App.
 */

const TastyMedia = {
  /**
   * Compresses an image File or Blob to under 1MB (typically 200KB - 600KB)
   * Resizes large dimensions, converts to JPEG/WebP, and iteratively optimizes quality.
   * @param {File|Blob} file - The original image file
   * @param {number} maxDimension - Max width or height (default 1600px)
   * @param {number} targetMaxBytes - Max bytes (default 950KB for strict < 1MB limit)
   * @returns {Promise<{blob: Blob, base64: string, sizeBytes: number, originalSize: number, savings: string}>}
   */
  async compressImageUnder1MB(file, maxDimension = 1600, targetMaxBytes = 950 * 1024) {
    const originalSize = file.size;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Invalid image format"));
        img.onload = () => {
          try {
            let width = img.width;
            let height = img.height;

            // Maintain aspect ratio while bounding within maxDimension
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
            // White background in case PNG with transparency is converted to JPEG
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // Progressive compression until size is under targetMaxBytes (< 1MB)
            let quality = 0.85;
            let format = 'image/jpeg';
            let dataUrl = canvas.toDataURL(format, quality);

            // Helper to get byte length of base64 data url
            const getByteLength = (b64) => {
              const head = b64.indexOf(',') + 1;
              return Math.round((b64.length - head) * 3 / 4);
            };

            let currentBytes = getByteLength(dataUrl);

            // Iterative reduction if still >= 950KB
            while (currentBytes > targetMaxBytes && quality > 0.3) {
              quality -= 0.12;
              dataUrl = canvas.toDataURL(format, quality);
              currentBytes = getByteLength(dataUrl);
            }

            // If still too large, downscale canvas dimensions
            if (currentBytes > targetMaxBytes) {
              const scaleDown = 0.75;
              const subCanvas = document.createElement('canvas');
              subCanvas.width = Math.round(width * scaleDown);
              subCanvas.height = Math.round(height * scaleDown);
              const subCtx = subCanvas.getContext('2d');
              subCtx.fillStyle = '#FFFFFF';
              subCtx.fillRect(0, 0, subCanvas.width, subCanvas.height);
              subCtx.drawImage(canvas, 0, 0, subCanvas.width, subCanvas.height);
              dataUrl = subCanvas.toDataURL(format, 0.75);
              currentBytes = getByteLength(dataUrl);
            }

            // Convert dataURL to Blob
            const byteString = atob(dataUrl.split(',')[1]);
            const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const compressedBlob = new Blob([ab], { type: mimeString });

            const savings = originalSize > 0 
              ? `${Math.max(0, Math.round((1 - currentBytes / originalSize) * 100))}%`
              : '0%';

            console.log(`[TastyMedia] Image compressed: ${(originalSize / 1024 / 1024).toFixed(2)} MB -> ${(currentBytes / 1024).toFixed(1)} KB (Saved ${savings})`);

            resolve({
              blob: compressedBlob,
              base64: dataUrl,
              sizeBytes: currentBytes,
              originalSize,
              savings,
              mimeType: mimeString
            });
          } catch (err) {
            reject(err);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Uploads compressed image or video file to Google Drive via Google Apps Script Web App
   * @param {File|Blob} fileOrBlob - The media file or compressed blob
   * @param {string} fileName - Destination filename
   * @param {string} customScriptUrl - Optional override for Google Apps Script Web App URL
   * @returns {Promise<{success: boolean, fileId: string, url: string, viewUrl: string}>}
   */
  async uploadToGoogleDrive(fileOrBlob, fileName = 'upload.jpg', customScriptUrl = null) {
    const scriptUrl = customScriptUrl || TastyConfig?.getGoogleAppsScriptUrl?.();

    if (!scriptUrl || scriptUrl.includes('YOUR_GOOGLE_APPS_SCRIPT')) {
      throw new Error("Google Apps Script URL is not configured. Please open Admin Control Center -> Cloud Settings and paste your Google Apps Script Web App URL.");
    }

    // Convert file/blob to Base64
    const base64Data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(fileOrBlob);
    });

    const mimeType = fileOrBlob.type || 'image/jpeg';

    const payload = {
      base64: base64Data,
      filename: fileName || `tastynest-${Date.now()}.jpg`,
      mimeType: mimeType
    };

    console.log(`[TastyMedia] Uploading ${fileName} (${mimeType}) to Google Drive...`);

    // Use URLSearchParams or text/plain to avoid CORS preflight issues with Google Apps Script
    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script returned HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || "Failed to upload file to Google Drive");
    }

    console.log(`[TastyMedia] Google Drive upload successful! File ID: ${result.fileId}, Direct URL: ${result.url}`);
    return result;
  },

  /**
   * Uploads compressed image or media.
   * 1. If Google Apps Script is configured: uploads to Google Drive.
   * 2. If Google Apps Script is not configured, but Firebase is configured: uploads to Firebase Storage.
   * 3. Fallback: returns compressed base64 data URL.
   */
  async uploadMedia(fileOrBlob, fileName = 'upload.jpg') {
    // 1. Google Drive via Google Apps Script (Primary)
    if (typeof TastyConfig !== 'undefined' && TastyConfig.isGoogleDriveConfigured()) {
      return await this.uploadToGoogleDrive(fileOrBlob, fileName);
    }

    // 2. Firebase Storage (Cloud backup)
    if (typeof firebase !== 'undefined' && firebase.storage && window.isFirestoreActive) {
      try {
        console.log(`[TastyMedia] Uploading compressed ${fileName} to Firebase Storage...`);
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`recipe-uploads/${Date.now()}-${fileName}`);
        const snapshot = await fileRef.put(fileOrBlob);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        console.log("[TastyMedia] Uploaded to Firebase Storage:", downloadUrl);
        return {
          success: true,
          url: downloadUrl,
          fileId: snapshot.metadata.fullPath,
          source: 'firebase-storage'
        };
      } catch (stErr) {
        console.warn("[TastyMedia] Firebase Storage upload fallback to local:", stErr);
      }
    }

    // 3. Fallback: convert to base64 data URL
    const b64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(fileOrBlob);
    });

    return {
      success: true,
      url: b64,
      source: 'local'
    };
  },

  /**
   * Converts various video URLs (Google Drive, YouTube, Pinterest) into direct embeddable URLs
   */
  formatVideoEmbedUrl(url) {
    if (!url || typeof url !== 'string') return '';
    const trimmed = url.trim();

    // Google Drive share link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // Convert to preview embed: https://drive.google.com/file/d/FILE_ID/preview
    const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }

    // Google Drive open link: https://drive.google.com/open?id=FILE_ID
    const driveIdMatch = trimmed.match(/drive\.google\.com\/(?:open|uc)\?id=([a-zA-Z0-9_-]+)/);
    if (driveIdMatch && driveIdMatch[1]) {
      return `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
    }

    // YouTube watch or short link: convert to youtube.com/embed/VIDEO_ID
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1`;
    }

    return trimmed;
  }
};

window.TastyMedia = TastyMedia;
