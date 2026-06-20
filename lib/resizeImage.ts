// Krymper en bild i webbläsaren innan uppladdning. En ingredienslista behöver
// inte full upplösning för att läsas — detta håller oss under Vercels och
// Anthropics storleksgränser och gör analysen snabbare och billigare.
// Faller tillbaka till originalfilen om något inte stöds (t.ex. HEIC som inte
// kan avkodas).
export async function resizeImage(
  file: File,
  maxEdge = 1568,
  quality = 0.82,
): Promise<Blob> {
  try {
    if (typeof createImageBitmap !== "function") return file;
    const bitmap = await createImageBitmap(file);
    const longEdge = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, maxEdge / longEdge);
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}
