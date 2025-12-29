window.function = async function (urlArg) {
  // 1. Unpack the Glide parameter (it comes as an object)
  if (!urlArg || !urlArg.value) return undefined;
  const url = urlArg.value;
  const cleanUrl = url.split('?')[0].toLowerCase();

  // 2. Image Check
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  if (imageExtensions.some(ext => cleanUrl.endsWith(ext))) {
    return url;
  }

  // 3. YouTube (Regex)
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = url.match(youtubeRegex);
  if (ytMatch) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  }

  // 4. Vimeo (OEmbed)
  if (url.includes('vimeo.com/')) {
    try {
      const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        return data.thumbnail_url;
      }
    } catch (error) { /* ignore */ }
  }

  // 5. Loom (OEmbed)
  if (url.includes('loom.com/share/') || url.includes('loom.com/v/')) {
    try {
      const response = await fetch(`https://www.loom.com/v1/oembed?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        const data = await response.json();
        return data.thumbnail_url;
      }
    } catch (error) { /* ignore */ }
  }

  // 6. Hosted Video Fallback (DOM)
  // Since this runs in a real browser context (iframe), document IS available.
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.crossOrigin = "anonymous";
      video.src = url;
      video.muted = true;
      video.preload = "metadata"; // optimization

      // Timeout to prevent hanging
      const timeout = setTimeout(() => resolve(undefined), 3000);

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
          resolve(canvas.toDataURL('image/jpeg'));
        } catch (e) {
          resolve(undefined);
        }
      };

      video.onerror = () => {
        clearTimeout(timeout);
        resolve(undefined);
      };
    } catch (e) {
      resolve(undefined);
    }
  });
}
