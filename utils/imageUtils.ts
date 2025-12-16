export const createCollage = async (imagesBase64: string[]): Promise<string> => {
  if (imagesBase64.length === 0) return '';
  if (imagesBase64.length === 1) return imagesBase64[0];

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject('Could not get canvas context');
      return;
    }

    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    imagesBase64.forEach((base64) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imagesBase64.length) {
          processCollage();
        }
      };
      img.onerror = reject;
      img.src = `data:image/png;base64,${base64}`;
      loadedImages.push(img);
    });

    const processCollage = () => {
      // Assuming all images are same size/ratio for simplicity, taking first as reference
      const width = loadedImages[0].width;
      const height = loadedImages[0].height;
      
      let cols = 1;
      let rows = 1;

      if (imagesBase64.length === 2) {
        cols = 2;
        rows = 1;
      } else if (imagesBase64.length >= 3) {
        cols = 2;
        rows = 2;
      }

      canvas.width = width * cols;
      canvas.height = height * rows;

      // Fill background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      loadedImages.forEach((img, index) => {
        // Stop if we have more images than 2x2 grid handles (max 4)
        if (index >= 4) return;

        const x = (index % cols) * width;
        const y = Math.floor(index / cols) * height;
        ctx.drawImage(img, x, y, width, height);
      });

      // Get base64 without prefix
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl.split(',')[1]); 
    };
  });
};
