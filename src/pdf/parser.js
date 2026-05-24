import { PDFDocument } from 'pdf-lib'

export async function parsePdf(buffer) {
  let pdfDoc
  try {
    pdfDoc = await PDFDocument.load(buffer)
  } catch (e) {
    if (e.message && e.message.includes('encrypt')) {
      throw new Error('Password-protected PDFs are not supported yet.')
    }
    throw new Error('This PDF appears to be damaged and cannot be read.')
  }

  const pageCount = pdfDoc.getPageCount()
  if (pageCount === 0) throw new Error('This PDF has no pages to rearrange.')

  return { pdfDoc, pageCount }
}