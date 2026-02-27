// ============================================================================
// Issue Reporter — Screenshot Utilities
// ============================================================================
// html2canvas wrapper, crop, export, and base64 handling.
// ============================================================================

export async function capturePageAsCanvas(): Promise<HTMLCanvasElement> {
  const { default: html2canvas } = await import('html2canvas')
  const canvas = await html2canvas(document.body, {
    useCORS: true,
    allowTaint: false,
    scale: window.devicePixelRatio,
    logging: false,
    backgroundColor: null,
  })
  return canvas
}

export function cropCanvas(
  sourceCanvas: HTMLCanvasElement,
  rect: { x: number; y: number; width: number; height: number },
): HTMLCanvasElement {
  const dpr = window.devicePixelRatio
  const cropped = document.createElement('canvas')
  cropped.width = rect.width * dpr
  cropped.height = rect.height * dpr

  const ctx = cropped.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')

  ctx.drawImage(
    sourceCanvas,
    rect.x * dpr,
    rect.y * dpr,
    rect.width * dpr,
    rect.height * dpr,
    0,
    0,
    cropped.width,
    cropped.height,
  )

  return cropped
}

export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
