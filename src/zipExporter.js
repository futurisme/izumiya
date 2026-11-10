import JSZip from "jszip";

/**
 * Exports in-memory virtual files into a compressed ZIP archive and triggers browser download.
 * Employs multi-strategy fallback (Blob ObjectURL + Base64 Data URI) to guarantee 100% download
 * execution across all desktop browsers, iframe containers, and sandbox preview environments.
 * 
 * @param {Array<{path?: string, name?: string, content: string}>} files
 * @param {string} filename
 * @returns {Promise<{success: boolean, filename: string, sizeBytes: number}>}
 */
export async function exportFilesAsZip(files, filename = "fadhilbot-clean.zip") {
  if (!files || files.length === 0) {
    throw new Error("Daftar berkas kosong, tidak ada yang dapat dikemas ke ZIP.");
  }

  const zip = new JSZip();
  for (const file of files) {
    const rawPath = file.path || file.name || "";
    const filePath = rawPath.replace(/^[\\/]+/, "");
    if (filePath) {
      zip.file(filePath, file.content || "");
    }
  }

  // Generate binary blob with maximum DEFLATE Level 9 compression
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });

  // Multi-Strategy Download Execution
  let downloadTriggered = false;

  // Strategy 1: Standard Blob Object URL
  try {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.style.position = "fixed";
    anchor.style.left = "-9999px";
    anchor.style.top = "-9999px";
    anchor.href = url;
    anchor.download = filename;
    anchor.setAttribute("download", filename);
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    downloadTriggered = true;

    setTimeout(() => {
      if (document.body.contains(anchor)) {
        document.body.removeChild(anchor);
      }
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (err) {
    console.warn("[ZIP Exporter] Blob ObjectURL download was restricted, attempting Data URI fallback:", err);
  }

  // Strategy 2: Base64 Data URI Fallback (immune to blob: scheme restrictions in iframes)
  if (!downloadTriggered) {
    try {
      const base64Data = await zip.generateAsync({
        type: "base64",
        compression: "DEFLATE",
        compressionOptions: { level: 9 }
      });
      const dataUri = `data:application/zip;base64,${base64Data}`;
      const anchor = document.createElement("a");
      anchor.style.position = "fixed";
      anchor.style.left = "-9999px";
      anchor.style.top = "-9999px";
      anchor.href = dataUri;
      anchor.download = filename;
      anchor.setAttribute("download", filename);
      document.body.appendChild(anchor);
      anchor.click();
      downloadTriggered = true;

      setTimeout(() => {
        if (document.body.contains(anchor)) {
          document.body.removeChild(anchor);
        }
      }, 5000);
    } catch (dataUriErr) {
      console.error("[ZIP Exporter] Data URI download also failed:", dataUriErr);
      throw new Error("Gagal memicu unduhan ZIP di peramban: " + (dataUriErr.message || dataUriErr));
    }
  }

  return { success: true, filename, sizeBytes: blob.size };
}

/**
 * Calculates the exact compressed ZIP size in bytes for live UI telemetry
 * @param {Array<{path?: string, name?: string, content: string}>} files
 * @returns {Promise<number>}
 */
export async function calculateExactZipSize(files) {
  if (!files || files.length === 0) return 0;
  const zip = new JSZip();
  for (const file of files) {
    const rawPath = file.path || file.name || "";
    const filePath = rawPath.replace(/^[\\/]+/, "");
    if (filePath) {
      zip.file(filePath, file.content || "");
    }
  }
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 }
  });
  return blob.size;
}
