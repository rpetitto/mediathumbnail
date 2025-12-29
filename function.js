window.function = async function (urlArg) {
  // 1. SAFETY: Handle empty inputs
  if (!urlArg || !urlArg.value) return null;
  
  const url = urlArg.value;
  // Ensure we are working with a string
  if (typeof url !== 'string') return null;

  const cleanUrl = url.split('?')[0].toLowerCase();

  // 2. IMAGE CHECK: Return immediately if it's a file
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  if (imageExtensions.some(ext => cleanUrl.endsWith(ext))) {
    return url;
  }

  // Helper to timeout fetch requests (prevents spinning on network hangs)
  const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 3000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(resource, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  };

  // 3. YOUTUBE
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = url.match(youtubeRegex);
  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  }

  // 4. VIMEO
  if (url.includes('vimeo.com/')) {
    try {
      const response = await fetchWithTimeout(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        return data.thumbnail_url || null;
      }
    } catch (e) { /* Ignore and fall through */ }
  }

  // 5. LOOM
  if (url.includes('loom.com/share/') || url.includes('loom.com/v/')) {
    try {
      const response = await fetchWithTimeout(`https://www.loom.com/v1/oembed?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        return data.thumbnail_url || null;
      }
    } catch (e) { /* Ignore and fall through */ }
  }

  // 6. HOSTED VIDEO (DOM)
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.crossOrigin = "anonymous";
      video.src = url;
      video.muted = true;
      video.preload = "metadata";

      // 3-second hard timeout
      const timeout = setTimeout(() => resolve(null), 3000);

      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };

      video.onseeked = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          // Return the base64 string
          resolve(canvas.toDataURL('image/jpeg'));
        } catch (e) {
          resolve(null);
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        resolve(null);
      };
    } catch (e) {
      resolve(null);
    }
  });
};
