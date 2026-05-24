import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

async function renderPageToImageBytes(pdfBytes, pageIndex) {
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(pdfBytes) })
    const pdfDoc = await loadingTask.promise
    const page = await pdfDoc.getPage(pageIndex + 1)

    const scale = 1.5
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height

    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport }).promise

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            blob.arrayBuffer().then((buf) => resolve({
                bytes: new Uint8Array(buf),
                width: viewport.width,
                height: viewport.height,
            }))
        }, 'image/jpeg', 0.92)
    })
}

export async function microsizePdf(sourcePdf) {
    // get raw bytes from sourcePdf for PDF.js
    const sourcePdfBytes = await sourcePdf.save()
    const totalPages = sourcePdf.getPageCount()

    const outWidth = 595
    const outHeight = 842
    const cols = 3
    const rows = 3
    const perSheet = cols * rows
    const cellW = outWidth / cols
    const cellH = outHeight / rows
    const totalSheets = Math.ceil(totalPages / perSheet)

    const outputPdf = await PDFDocument.create()

    for (let sheet = 0; sheet < totalSheets; sheet++) {
        const outPage = outputPdf.addPage([outWidth, outHeight])

        for (let slot = 0; slot < perSheet; slot++) {
            const srcIndex = sheet * perSheet + slot
            if (srcIndex >= totalPages) break

            const col = slot % cols
            const row = Math.floor(slot / cols)

            const x = col * cellW
            const y = outHeight - (row + 1) * cellH

            // render page to JPEG via canvas
            const { bytes, width: srcW, height: srcH } = await renderPageToImageBytes(sourcePdfBytes, srcIndex)

            // embed JPEG into output PDF
            const jpgImage = await outputPdf.embedJpg(bytes)

            const padding = 3
            const scaleX = (cellW - padding * 2) / srcW
            const scaleY = (cellH - padding * 2) / srcH
            const scale = Math.min(scaleX, scaleY)

            const drawW = srcW * scale
            const drawH = srcH * scale

            const offsetX = x + (cellW - drawW) / 2
            const offsetY = y + (cellH - drawH) / 2

            outPage.drawImage(jpgImage, {
                x: offsetX,
                y: offsetY,
                width: drawW,
                height: drawH,
            })
        }
    }

    return outputPdf.save()
}