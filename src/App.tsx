import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Download,
  FileText,
  Grid3X3,
  LockKeyhole,
  Printer,
  RotateCcw,
  ShieldCheck,
  Upload,
  X,
  Zap,
} from "lucide-react";
import type { PDFDocument } from "pdf-lib";

type Options = {
  rearrange: boolean;
  microsize: boolean;
};

type Result = {
  url: string;
  name: string;
  originalPages: number;
  outputPages: number;
  sequence: number[];
};

const A4 = { width: 595, height: 842 };

function generatePageSequence(pageCount: number) {
  const odds = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (page) => page % 2 !== 0,
  );
  const evens = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (page) => page % 2 === 0,
  );
  const sequence: number[] = [];

  while (odds.length > 0 || evens.length > 0) {
    const oddSet = odds.splice(0, 9);
    while (oddSet.length < 9) oddSet.push(0);
    sequence.push(...oddSet);

    for (let blockIndex = 0; blockIndex < 3; blockIndex += 1) {
      const block = evens.splice(0, 3);
      while (block.length < 3) block.push(0);
      sequence.push(...block.reverse());
    }
  }

  return sequence;
}

async function addFullPages(
  output: PDFDocument,
  source: PDFDocument,
  sequence: number[],
) {
  const firstPage = source.getPage(0);
  const { width, height } = firstPage.getSize();

  for (const pageNumber of sequence) {
    if (pageNumber === 0) {
      output.addPage([width, height]);
    } else {
      const [page] = await output.copyPages(source, [pageNumber - 1]);
      output.addPage(page);
    }
  }
}

async function addMicroSheets(
  output: PDFDocument,
  source: PDFDocument,
  sequence: number[],
) {
  const embedded = new Map<number, Awaited<ReturnType<PDFDocument["embedPage"]>>>();
  const uniquePages = [...new Set(sequence.filter(Boolean))];

  await Promise.all(
    uniquePages.map(async (pageNumber) => {
      embedded.set(pageNumber, await output.embedPage(source.getPage(pageNumber - 1)));
    }),
  );

  const cellWidth = A4.width / 3;
  const cellHeight = A4.height / 3;
  const padding = 4;

  for (let start = 0; start < sequence.length; start += 9) {
    const sheet = output.addPage([A4.width, A4.height]);
    sequence.slice(start, start + 9).forEach((pageNumber, slot) => {
      if (pageNumber === 0) return;
      const page = embedded.get(pageNumber);
      if (!page) return;

      const scale = Math.min(
        (cellWidth - padding * 2) / page.width,
        (cellHeight - padding * 2) / page.height,
      );
      const width = page.width * scale;
      const height = page.height * scale;
      const column = slot % 3;
      const row = Math.floor(slot / 3);

      sheet.drawPage(page, {
        x: column * cellWidth + (cellWidth - width) / 2,
        y: A4.height - (row + 1) * cellHeight + (cellHeight - height) / 2,
        width,
        height,
      });
    });
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1_000_000) return `${Math.round(bytes / 1_000)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

function Logo({
  onClick = () => window.scrollTo({ top: 0, behavior: "smooth" }),
  expanded,
}: {
  onClick?: () => void;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      className="group flex items-center gap-3 text-left"
      onClick={onClick}
      aria-label="Microbit home"
      aria-expanded={expanded}
      aria-controls={expanded === undefined ? undefined : "mobile-navigation"}
    >
      <img
        className="size-10 shrink-0 object-contain md:size-12"
        src="/microbit-logo.png"
        alt=""
      />
      <span className="text-base font-black uppercase leading-none tracking-tighter md:text-lg">
        Microbit
        <span className="block text-[0.55rem] font-medium tracking-[0.24em]">
          PDF Imposition
        </span>
      </span>
    </button>
  );
}

function Header({ onStart }: { onStart: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  const handleLogoClick = () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setMenuOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white">
      <div className="mx-auto flex h-20 max-w-screen-2xl items-center justify-between gap-3 px-4 md:gap-6 md:px-10">
        <Logo onClick={handleLogoClick} expanded={menuOpen} />
        <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-widest md:flex">
          <a className="nav-link" href="#method">
            Method
          </a>
          <a className="nav-link" href="#privacy">
            Privacy
          </a>
        </nav>
        <button
          type="button"
          className="button-primary h-11 shrink-0 px-3 md:px-5"
          onClick={onStart}
        >
          <span>Upload now</span>
          <ArrowDown size={17} strokeWidth={2.5} />
        </button>
      </div>

      {menuOpen && (
        <div
          className="mobile-nav-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMenuOpen(false);
          }}
        >
          <aside
            id="mobile-navigation"
            className="mobile-nav-panel"
            aria-label="Mobile navigation"
          >
            <div className="mobile-nav-heading">
              <div>
                <p>Microbit</p>
                <span>Navigation / 02 routes</span>
              </div>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMenuOpen(false)}
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
            <nav>
              <a href="#method" onClick={() => setMenuOpen(false)}>
                <span>01</span>
                Method
                <ArrowDown size={22} />
              </a>
              <a href="#privacy" onClick={() => setMenuOpen(false)}>
                <span>02</span>
                Privacy
                <ArrowDown size={22} />
              </a>
            </nav>
            <p className="mobile-nav-note">Private PDF tools / Local processing only</p>
          </aside>
        </div>
      )}
    </header>
  );
}

function UploadPanel({
  file,
  onFile,
  onClear,
}: {
  file: File | null;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const acceptFile = (candidate?: File) => {
    if (candidate) onFile(candidate);
  };

  return (
    <div
      className={`upload-panel swiss-grid-pattern ${dragging ? "is-dragging" : ""}`}
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        acceptFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => acceptFile(event.target.files?.[0])}
      />

      <div className="flex items-center justify-between border-b-2 border-black px-5 py-3 text-[0.65rem] font-bold uppercase tracking-[0.2em]">
        <span>Input / PDF only</span>
        <span>Local processing</span>
      </div>

      {file ? (
        <div className="flex min-h-80 flex-col justify-between p-7 md:min-h-96 md:p-10">
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-16 place-items-center border-2 border-black bg-signal text-white">
              <FileText size={30} strokeWidth={1.8} />
            </span>
            <button
              type="button"
              className="icon-button"
              onClick={onClear}
              aria-label="Remove selected PDF"
            >
              <X size={22} />
            </button>
          </div>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-signal">
              Ready to configure
            </p>
            <p className="max-w-md break-words text-2xl font-black uppercase leading-tight tracking-tight md:text-3xl">
              {file.name}
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest">
              {formatBytes(file.size)} / Application PDF
            </p>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="group flex min-h-80 w-full flex-col items-start justify-between p-7 text-left md:min-h-96 md:p-10"
          onClick={() => inputRef.current?.click()}
        >
          <span className="upload-icon">
            <Upload size={30} strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-xs font-bold uppercase tracking-[0.2em] text-signal">
              Drop zone 01
            </span>
            <span className="mt-3 block max-w-lg text-3xl font-black uppercase leading-[0.95] tracking-tighter md:text-5xl">
              Drop your PDF or browse
            </span>
            <span className="mt-5 block text-sm font-medium">
              Nothing leaves your browser.
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

function OptionRow({
  checked,
  onChange,
  number,
  title,
  detail,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  number: string;
  title: string;
  detail: string;
}) {
  return (
    <label className={`option-row ${checked ? "is-selected" : ""}`}>
      <input
        className="sr-only"
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="text-xs font-bold tracking-widest">{number}</span>
      <span className="flex-1">
        <span className="block text-lg font-black uppercase tracking-tight">{title}</span>
        <span className="mt-1 block text-xs font-medium">{detail}</span>
      </span>
      <span className="grid size-8 place-items-center border-2 border-current">
        {checked && <Check size={18} strokeWidth={3} />}
      </span>
    </label>
  );
}

function SheetDiagram({ pages }: { pages: number[] }) {
  return (
    <div className="sheet-diagram" aria-label="3 by 3 page arrangement preview">
      {Array.from({ length: 9 }).map((_, index) => (
        <span key={index}>{pages[index] || "—"}</span>
      ))}
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<Options>({
    rearrange: true,
    microsize: true,
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [resultPopupOpen, setResultPopupOpen] = useState(false);
  const workRef = useRef<HTMLElement>(null);

  useEffect(() => {
    return () => {
      if (result) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const reset = () => {
    if (result) URL.revokeObjectURL(result.url);
    setFile(null);
    setResult(null);
    setResultPopupOpen(false);
    setError("");
    setProcessing(false);
  };

  const selectFile = (selected: File) => {
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      setError("Unsupported format. Select a valid PDF document.");
      return;
    }
    if (result) URL.revokeObjectURL(result.url);
    setFile(selected);
    setResult(null);
    setError("");
  };

  const processPdf = async () => {
    if (!file || (!options.rearrange && !options.microsize)) return;
    setProcessing(true);
    setError("");

    try {
      const { PDFDocument } = await import("pdf-lib");
      const input = await file.arrayBuffer();
      const source = await PDFDocument.load(input);
      const pageCount = source.getPageCount();
      if (pageCount === 0) throw new Error("This PDF has no pages to process.");

      const sequence = options.rearrange
        ? generatePageSequence(pageCount)
        : Array.from({ length: pageCount }, (_, index) => index + 1);
      const output = await PDFDocument.create();

      if (options.microsize) {
        await addMicroSheets(output, source, sequence);
      } else {
        await addFullPages(output, source, sequence);
      }

      const bytes = await output.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const suffix = [
        options.rearrange ? "rearranged" : "",
        options.microsize ? "micro" : "",
      ]
        .filter(Boolean)
        .join("_");

      setResult({
        url,
        name: `${file.name.replace(/\.pdf$/i, "")}_${suffix}.pdf`,
        originalPages: pageCount,
        outputPages: output.getPageCount(),
        sequence,
      });
      setResultPopupOpen(true);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "";
      setError(
        /encrypt/i.test(message)
          ? "Password-protected PDFs are not supported yet."
          : message || "This PDF appears to be damaged and cannot be read.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const start = () => workRef.current?.scrollIntoView({ behavior: "smooth" });
  const headerInputRef = useRef<HTMLInputElement>(null);
  const uploadNow = () => {
    start();
    headerInputRef.current?.click();
  };
  const nothingSelected = !options.rearrange && !options.microsize;

  return (
    <div className="min-h-screen bg-white text-black">
      <input
        ref={headerInputRef}
        className="sr-only"
        type="file"
        accept="application/pdf,.pdf"
        onChange={(event) => {
          const picked = event.target.files?.[0];
          if (picked) selectFile(picked);
          event.target.value = "";
        }}
      />
      <Header onStart={uploadNow} />

      <main>
        <section className="hero-shell">
          <div className="hero-copy swiss-dots">
            <p className="section-label">01 / PDF Tool</p>
            <h1>
              Print
              <br />
              <span>Smarter.</span>
              <br />
              Waste Less.
            </h1>
            <div className="mt-10 grid gap-6 border-t-2 border-black pt-6 md:grid-cols-2">
              <p className="max-w-sm text-base font-medium leading-relaxed">
                Reorder duplex pages and compress nine pages onto one A4 sheet.
                Precise, private, instant.
              </p>
              <button type="button" className="button-link" onClick={start}>
                Open the editor <ArrowDown size={18} />
              </button>
            </div>
          </div>
          <div className="hero-geometry" aria-hidden="true">
            <div className="geo-circle" />
            <div className="geo-bar" />
            <div className="geo-grid">
              {Array.from({ length: 9 }).map((_, index) => (
                <span key={index}>{String(index + 1).padStart(2, "0")}</span>
              ))}
            </div>
            <p>3 × 3 / A4</p>
          </div>
        </section>

        <section ref={workRef} className="work-section scroll-mt-20">
          <div className="section-heading">
            <p className="section-label">02 / System</p>
            <h2>Configure output.</h2>
            <p>
              Two operations. One local pipeline.
              <br />
              Choose either—or combine both.
            </p>
          </div>

          <div className="work-grid">
            <UploadPanel file={file} onFile={selectFile} onClear={reset} />

            <div className="config-panel swiss-diagonal">
              <div>
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em]">
                  Output operations
                </p>
                <div className="border-2 border-black">
                  <OptionRow
                    checked={options.rearrange}
                    onChange={(rearrange) => setOptions({ ...options, rearrange })}
                    number="01"
                    title="Duplex reorder"
                    detail="Odd/even stream algorithm"
                  />
                  <OptionRow
                    checked={options.microsize}
                    onChange={(microsize) => setOptions({ ...options, microsize })}
                    number="02"
                    title="Micro-size"
                    detail="Nine pages per A4 sheet"
                  />
                </div>
              </div>

              <div>
                {error && (
                  <div className="mb-4 border-2 border-signal bg-white p-4 text-sm font-bold" role="alert">
                    {error}
                  </div>
                )}
                <button
                  type="button"
                  className="button-process"
                  disabled={!file || nothingSelected || processing}
                  onClick={processPdf}
                >
                  <span>
                    {processing ? "Processing locally…" : file ? "Process PDF" : "Select a PDF first"}
                  </span>
                  {processing ? (
                    <span className="processing-mark" />
                  ) : (
                    <ArrowUpRight size={24} strokeWidth={2.5} />
                  )}
                </button>
                <p className="mt-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-widest">
                  <LockKeyhole size={14} /> No upload. No account. No trace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {result && (
          <section className="result-section" aria-live="polite">
            <div className="result-title">
              <p className="section-label section-label-light">03 / Output ready</p>
              <h2>Done.</h2>
              <p>Your press-ready document was generated entirely in this browser.</p>
            </div>
            <div className="result-data">
              <div className="stats-row">
                <div>
                  <span>Input</span>
                  <strong>{result.originalPages}</strong>
                  <small>Pages</small>
                </div>
                <div>
                  <span>Output</span>
                  <strong>{result.outputPages}</strong>
                  <small>A4 sheets</small>
                </div>
                <div>
                  <span>Transfer</span>
                  <strong>0</strong>
                  <small>Bytes uploaded</small>
                </div>
              </div>

              {options.microsize && (
                <div className="preview-row">
                  <SheetDiagram pages={result.sequence.slice(0, 9)} />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-signal">
                      Sheet preview / 01
                    </p>
                    <p className="mt-3 text-xl font-bold uppercase">
                      Pages are fitted proportionally to a 3 × 3 A4 grid.
                    </p>
                  </div>
                </div>
              )}

              <div className="action-grid">
                <a className="button-download" href={result.url} download={result.name}>
                  <Download size={21} /> Download PDF
                </a>
                <button
                  type="button"
                  className="button-secondary-dark"
                  onClick={() => window.open(result.url, "_blank", "noopener,noreferrer")}
                >
                  <Printer size={21} /> Print
                </button>
                <button type="button" className="button-secondary-dark" onClick={reset}>
                  <RotateCcw size={21} /> New file
                </button>
              </div>
            </div>
          </section>
        )}

        <section id="method" className="method-section">
          <div className="sticky-copy">
            <p className="section-label">04 / Method</p>
            <h2>Built for both sides.</h2>
            <p>
              A strict sequence makes front and back sheets align after printing,
              cutting, and assembly.
            </p>
          </div>
          <div className="method-list">
            {[
              {
                icon: FileText,
                number: "01",
                title: "Read",
                text: "Your source PDF is validated in browser memory.",
              },
              {
                icon: Zap,
                number: "02",
                title: "Reorder",
                text: "Odd pages flow forward. Even rows reverse for duplex alignment.",
              },
              {
                icon: Grid3X3,
                number: "03",
                title: "Impose",
                text: "Nine vector pages are proportionally placed on each A4 sheet.",
              },
              {
                icon: Download,
                number: "04",
                title: "Export",
                text: "A new press-ready document is generated for download or print.",
              },
            ].map((item) => (
              <article key={item.number}>
                <span>{item.number}</span>
                <item.icon size={29} strokeWidth={1.7} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="privacy" className="privacy-section swiss-grid-pattern">
          <div>
            <ShieldCheck size={54} strokeWidth={1.5} />
            <p className="section-label">05 / Privacy</p>
          </div>
          <h2>Your PDF never leaves your machine.</h2>
          <p>
            Processing happens locally with browser-native memory and client-side
            PDF tooling. Files are never sent to a server.
          </p>
        </section>
      </main>

      <footer>
        <Logo />
        <p>Private by design / Built for precise printing</p>
        <p>© {new Date().getFullYear()} Microbit</p>
      </footer>

      {result && resultPopupOpen && (
        <div
          className="result-popup-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setResultPopupOpen(false);
          }}
        >
          <div
            className="result-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-popup-title"
          >
            <div className="result-popup-header">
              <p className="section-label section-label-light">Output ready</p>
              <button
                type="button"
                className="result-popup-close"
                aria-label="Close download popup"
                onClick={() => setResultPopupOpen(false)}
              >
                <X size={24} strokeWidth={2.5} />
              </button>
            </div>
            <div className="result-popup-body">
              <Check size={42} strokeWidth={2.5} aria-hidden="true" />
              <h2 id="result-popup-title">PDF ready.</h2>
              <p>
                Your {result.outputPages}-sheet document was created locally and is ready
                to save.
              </p>
              <a className="button-download" href={result.url} download={result.name}>
                <Download size={21} /> Download PDF
              </a>
              <button
                type="button"
                className="button-secondary-dark"
                onClick={() => setResultPopupOpen(false)}
              >
                View output details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
