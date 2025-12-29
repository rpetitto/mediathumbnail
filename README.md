# Universal Media Thumbnail for Glide

This repository hosts an **Experimental Code Column** for [Glide](https://www.glideapps.com). It automatically generates a thumbnail image from a wide variety of video and image URLs.

It is designed to be a "set it and forget it" solution that handles different platforms and file types intelligently.

## Features

* **YouTube:** Supports standard URLs, Shorts, Embeds, and `youtu.be` links.
* **Vimeo:** Automatically fetches thumbnails via the OEmbed API.
* **Loom:** Automatically fetches thumbnails via the OEmbed API.
* **Google Drive:** Generates high-quality thumbnails for Drive videos and images (requires "Anyone with the link" access).
* **Hosted Files:** Generates screenshots for direct video files (`.mp4`, `.mov`, `.webm`) using the browser's DOM (requires CORS support on the host server).
* **Direct Images:** If the URL is already an image (`.jpg`, `.png`, etc.), it passes it through unchanged.

## Installation

1.  In your Glide Data Editor, add a new column.
2.  Select **Experimental Code**.
3.  Paste the following URL into the column configuration:

    ```text
    https://rpetitto.github.io/mediathumbnail/
    ```

    **Important:** You must include the trailing slash `/`.

## Usage

Simply map the **Video URL** parameter to a column in your Glide table containing the links you want to process. The column will output a URL string pointing to the thumbnail image.

## File Structure

This project uses the web-based Experimental Code structure required by Glide:

* `glide.json`: The manifest definition for Glide.
* `index.html`: The entry point for the column's iframe.
* `driver.js`: Handles communication between Glide and the custom logic.
* `function.js`: The core logic that parses URLs and generates thumbnails.

---

## Changelog

### v1.3.0 - 2025-12-29
* **Added:** Google Drive support. Now detects `drive.google.com` and `docs.google.com` links and retrieves the high-res thumbnail via the Drive API.

### v1.2.0 - 2025-12-29
* **Fix:** Refactored project structure to the 4-file setup (`index.html`, `driver.js`, `function.js`, `glide.json`).
* **Fix:** Resolved infinite loading spinner issue caused by previous headless module approach.
* **Update:** Switched logic to use `window.function` format for compatibility with the Glide web driver.

### v1.1.0 - 2025-12-29
* **Added:** Vimeo support using the public OEmbed API.
* **
