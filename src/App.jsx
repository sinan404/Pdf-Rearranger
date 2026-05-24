import { useState } from 'react'
import EditorHero from './components/EditorHero'
import Header from './components/Header'
import { GravityStarsBackground } from './components/GravityStars'
import OptionSelector from './components/OptionSelector'
import { parsePdf } from './pdf/parser'
import { buildReorderedPdf } from './pdf/builder'
import { generatePageSequence } from './engine/algorithm'
import { PDFDocument } from 'pdf-lib'
import { microsizePdf } from './pdf/microsize'
import PreviewGrid from './components/PreviewGrid'


function App() {
  const [phase, setPhase] = useState('idle')
  const [file, setFile] = useState(null)
  const [outputUrl, setOutputUrl] = useState(null)
  const [outputBytes, setOutputBytes] = useState(null)
  const [pageSequence, setPageSequence] = useState([])
  const [originalPageCount, setOriginalPageCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  function handleFileSelect(selectedFile) {
    setFile(selectedFile)
    setPhase('confirm')  
  }

 
async function handleConfirm({ rearrange, microsize }) {
  setPhase('processing')
  try {
    const buffer = await file.arrayBuffer()
    const { pdfDoc, pageCount } = await parsePdf(buffer)

    let outputPdfBytes
      if (rearrange && microsize) {
        const sequence = generatePageSequence(pageCount)
        const rearrangedBytes = await buildReorderedPdf(pdfDoc, sequence)
        const rearrangedPdf = await PDFDocument.load(rearrangedBytes, {
          ignoreEncryption: true,
          updateMetadata: false,
        })
        console.log('Rearranged page count:', rearrangedPdf.getPageCount())
        const testPage = rearrangedPdf.getPage(0)
        console.log('First page size:', testPage.getSize())

        outputPdfBytes = await microsizePdf(rearrangedPdf)
        setPageSequence(sequence)
      }

      else if (rearrange) {
      const sequence = generatePageSequence(pageCount)
      outputPdfBytes = await buildReorderedPdf(pdfDoc, sequence)
      setPageSequence(sequence)
    } else if (microsize) {
      outputPdfBytes = await microsizePdf(pdfDoc)
      setPageSequence([])
    }

    const blob = new Blob([outputPdfBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)

    setOriginalPageCount(pageCount)
    setOutputBytes(outputPdfBytes)
    setOutputUrl(url)
    setPhase('done')

  } catch (err) {
    setErrorMsg(err.message)
    setPhase('error')
  }
}

  function handleReset() {
    if (outputUrl) URL.revokeObjectURL(outputUrl)
    setFile(null)
    setOutputUrl(null)
    setOutputBytes(null)
    setPageSequence([])
    setOriginalPageCount(0)
    setErrorMsg('')
    setPhase('idle')
  }

  function handleDownload() {
    const a = document.createElement('a')
    a.href = outputUrl
    a.download = file.name.replace(/\.pdf$/i, '') + '_reordered.pdf'
    a.click()
  }

  return (
    <div
      className="relative min-h-screen pt-[29px]"
      style={{ backgroundColor: '#000000', color: '#F0F2F7' }}
    >
      <div className="fixed inset-0 z-0">
        <GravityStarsBackground
          starsCount={80}
          starsOpacity={0.6}
          glowIntensity={12}
          mouseGravity="attract"
        />
      </div>

      <Header
        onUploadClick={() => document.getElementById('header-upload').click()}
        onHomeClick={handleReset}
      />  

      <input
        id="header-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
      />

      <main className="relative z-10 flex min-h-[calc(100vh-99px)] flex-col items-center justify-center px-4">

        {phase === 'idle' && (
          <EditorHero onFileSelect={handleFileSelect} />
        )}

        {phase === 'confirm' && (
          <OptionSelector
            fileName={file?.name}
            onConfirm={handleConfirm}
          />
        )}

        {phase === 'processing' && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin" />
            <p className="text-lg font-medium text-white">Reordering pages…</p>
            <p className="text-sm" style={{ color: '#9BA3B8' }}>{file?.name}</p>
          </div>
        )}
    
        {phase === 'done' && (
  <div className="flex flex-col items-center gap-6 text-center w-full max-w-2xl">
    <p className="text-2xl font-semibold text-white">✅ Done!</p>
    <p style={{ color: '#9BA3B8' }}>
      {originalPageCount} pages → {pageSequence.length} pages output
    </p>

    <PreviewGrid pdfUrl={outputUrl} pageSequence={pageSequence} />

    <div className="flex gap-4">
      <button
        onClick={handleDownload}
        className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
      >
        Download PDF
      </button>
      <button
        onClick={() => window.open(outputUrl)}
        className="border border-white/30 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors"
      >
        Print
      </button>
    </div>
  </div>
)}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xl font-semibold text-red-400">❌ Error</p>
            <p style={{ color: '#9BA3B8' }}>{errorMsg}</p>
            <button
              onClick={handleReset}
              className="border border-white/30 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

      </main>
    </div>
  )
}

export default App