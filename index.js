// temporary index.js for testing
export default async function (url) {
    return "Test Success: " + url;
}
/*export default async function (url) {
    if (!url) return undefined;

    const cleanUrl = url.split('?')[0].toLowerCase();
    
    // 1. IMAGE CHECK: If it's already an image, return it.
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    if (imageExtensions.some(ext => cleanUrl.endsWith(ext))) {
        return url;
    }

    // 2. YOUTUBE (Regex - Supports Shorts, Embeds, Standard)
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const ytMatch = url.match(youtubeRegex);
    if (ytMatch) {
        return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
    }

    // 3. VIMEO (OEmbed API)
    if (url.includes('vimeo.com/')) {
        try {
            const response = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`);
            if (response.ok) {
                const data = await response.json();
                return data.thumbnail_url;
            }
        } catch (error) {
            // Silently fail to return undefined
        }
    }

    // 4. LOOM (OEmbed API)
    if (url.includes('loom.com/share/') || url.includes('loom.com/v/')) {
        try {
            const response = await fetch(`https://www.loom.com/v1/oembed?url=${encodeURIComponent(url)}`);
            if (response.ok) {
                const data = await response.json();
                return data.thumbnail_url;
            }
        } catch (error) {
            // Silently fail
        }
    }

    // 5. HOSTED VIDEO FALLBACK (Browser DOM Required)
    // This will only work if Glide's driver exposes 'document'. 
    if (typeof document !== 'undefined') {
        return new Promise((resolve) => {
            try {
                const video = document.createElement('video');
                video.crossOrigin = "anonymous";
                video.src = url;
                video.muted = true;
                
                // 3-second timeout to prevent hanging
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

    return undefined;
}
