import { PDFDocument } from 'pdf-lib'

export async function buildReorderedPdf(sourcePdf, sequence) {
  const outputPdf = await PDFDocument.create()

  const firstPage = sourcePdf.getPage(0)
  const { width, height } = firstPage.getSize()

  for (const pageNum of sequence) {
    if (pageNum === 0) {
      outputPdf.addPage([width, height])
    } else {
      const [copiedPage] = await outputPdf.copyPages(sourcePdf, [pageNum - 1])
      outputPdf.addPage(copiedPage)
    }
  }

  return outputPdf.save()
}