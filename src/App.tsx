import { useEffect, useRef } from 'react'

const HW = 24
const QH = 12
const FH = 11

function tilePts(cx: number, cy: number) {
  const top = `${cx},${cy} ${cx + HW},${cy + QH} ${cx},${cy + HW * 2} ${cx - HW},${cy + QH}`
  const left = `${cx - HW},${cy + QH} ${cx},${cy + HW * 2} ${cx},${cy + HW * 2 + FH} ${cx - HW},${cy + QH + FH}`
  const right = `${cx + HW},${cy + QH} ${cx},${cy + HW * 2} ${cx},${cy + HW * 2 + FH} ${cx + HW},${cy + QH + FH}`
  return { top, left, right }
}

function Tile({
  cx,
  cy,
  cTop = '#eef1f6',
  cLeft = '#ccd3dc',
  cRight = '#d8dfe8',
}: {
  cx: number
  cy: number
  cTop?: string
  cLeft?: string
  cRight?: string
}) {
  const p = tilePts(cx, cy)
  return (
    <g>
      <polygon points={p.left} fill={cLeft} stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points={p.right} fill={cRight} stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points={p.top} fill={cTop} stroke="white" strokeWidth="1.8" strokeLinejoin="round" />
    </g>
  )
}

function gs(col: number, row: number, ox: number, oy: number) {
  return { cx: ox + (col - row) * HW, cy: oy + (col + row) * QH }
}

function IsoBox({
  cx,
  cy,
  sw,
  fh,
  cTop,
  cLeft,
  cRight,
}: {
  cx: number
  cy: number
  sw: number
  fh: number
  cTop: string
  cLeft: string
  cRight: string
}) {
  const sd = sw / 2
  const top = `${cx},${cy} ${cx + sw},${cy + sd} ${cx},${cy + sw} ${cx - sw},${cy + sd}`
  const left = `${cx - sw},${cy + sd} ${cx},${cy + sw} ${cx},${cy + sw + fh} ${cx - sw},${cy + sd + fh}`
  const right = `${cx + sw},${cy + sd} ${cx},${cy + sw} ${cx},${cy + sw + fh} ${cx + sw},${cy + sd + fh}`
  return (
    <g>
      <polygon points={left} fill={cLeft} stroke="none" />
      <polygon points={right} fill={cRight} stroke="none" />
      <polygon points={top} fill={cTop} stroke="none" />
    </g>
  )
}

function ConstructionIllustration() {
  // Grid: 4 cols x 3 rows, origin at col=0 row=0
  const ox = 183
  const oy = 128
  const gridCells: [number, number][] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      gridCells.push([c, r])
    }
  }

  // Machine sits above tile (col=2, row=0) => cx=231, and we want its press arm
  // to bottom-align near oy=128. Machine is centered at cx~=219.
  const mcx = 219 // machine center x

  // Machine parts (bottom to top):
  // Pressing plate: cy=106, sw=16, fh=9
  // Column: cy=80, sw=4, fh=35
  // Machine body: cy=58, sw=18, fh=22

  // Blue cube accent: between pressing plate and tile row 0
  const blueCx = mcx - 2
  const blueCy = 116

  // Floating tiles (upper right, scatter)
  const floatTiles = [
    { cx: 298, cy: 72 },
    { cx: 318, cy: 58 },
  ]

  return (
    <svg viewBox="0 0 400 270" width="400" height="270" style={{ overflow: 'visible' }}>
      {/* Grid tiles, drawn back-to-front (row 0 first so row 2 overlaps front) */}
      {[0, 1, 2].map((r) =>
        [0, 1, 2, 3].map((c) => {
          const { cx, cy } = gs(c, r, ox, oy)
          return <Tile key={`${c}-${r}`} cx={cx} cy={cy} />
        })
      )}

      {/* Machine body (topmost box) */}
      <IsoBox
        cx={mcx}
        cy={58}
        sw={18}
        fh={22}
        cTop="#243352"
        cLeft="#1a2540"
        cRight="#2c3e60"
      />

      {/* Arm connector / column */}
      <IsoBox
        cx={mcx}
        cy={80}
        sw={5}
        fh={35}
        cTop="#1e2e4a"
        cLeft="#16233a"
        cRight="#243352"
      />

      {/* Pressing plate */}
      <IsoBox
        cx={mcx}
        cy={115}
        sw={16}
        fh={9}
        cTop="#2a3d5e"
        cLeft="#1c2d47"
        cRight="#31486e"
      />

      {/* Blue accent cube (tile being placed) */}
      <IsoBox
        cx={blueCx}
        cy={blueCy}
        sw={10}
        fh={10}
        cTop="#4a6cf7"
        cLeft="#2e50d4"
        cRight="#3b5fe0"
      />

      {/* Floating tiles upper right */}
      {floatTiles.map((t, i) => (
        <Tile
          key={`float-${i}`}
          cx={t.cx}
          cy={t.cy}
          cTop="#eef1f6"
          cLeft="#c8d0da"
          cRight="#d4dce5"
        />
      ))}

      {/* Small floating tile piece (top right, partially cut) */}
      <Tile cx={338} cy={44} cTop="#f0f3f7" cLeft="#cad2dc" cRight="#d6dde6" />
    </svg>
  )
}

export default function App() {
  const illustRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const y = window.scrollY
        if (illustRef.current) {
          illustRef.current.style.transform = `translateY(${-y * 0.38}px)`
        }
        if (heroRef.current) {
          heroRef.current.style.opacity = `${Math.max(0, 1 - y / 420)}`
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: '#edf0f5', minHeight: '220vh' }}>
      {/* Sticky hero */}
      <div
        ref={heroRef}
        className="sticky top-0 h-screen flex flex-col items-center justify-center"
        style={{ willChange: 'opacity' }}
      >
        {/* Illustration with parallax */}
        <div
          ref={illustRef}
          style={{ willChange: 'transform' }}
          className="flex items-center justify-center"
        >
          <ConstructionIllustration />
        </div>

        {/* Text */}
        <div className="text-center mt-2" style={{ maxWidth: 480 }}>
          <h1
            style={{
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              fontWeight: 600,
              fontSize: '1.125rem',
              color: '#2d3748',
              margin: 0,
              marginBottom: 10,
              letterSpacing: '-0.01em',
            }}
          >
            Page Under Construction...
          </h1>
          <p
            style={{
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              fontSize: '0.8125rem',
              color: '#718096',
              lineHeight: 1.6,
              margin: 0,
              padding: '0 1.5rem',
            }}
          >
            The development of new functions is stepping up, and it will be soon available.
            <br />
            Please be patient.
          </p>
        </div>
      </div>

      {/* Scroll reveal section */}
      <div
        className="flex flex-col items-center justify-center"
        style={{ minHeight: '100vh', paddingTop: '10vh' }}
      >
        <div
          className="text-center"
          style={{
            maxWidth: 360,
            opacity: 0,
            animation: 'fadeUp 0.7s ease forwards',
            animationDelay: '0.1s',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              margin: '0 auto 24px',
              background: '#e2e8f0',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="#4a6cf7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 600,
              fontSize: '1rem',
              color: '#2d3748',
              margin: '0 0 8px',
            }}
          >
            We're building something great
          </h2>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: '0.8125rem',
              color: '#718096',
              lineHeight: 1.65,
              margin: '0 0 28px',
            }}
          >
            New features are being added every week. Check back soon for updates.
          </p>
          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'center',
            }}
          >
            {[65, 80, 45, 90, 55].map((pct, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: '#e8ecf2',
                    position: 'relative',
                    overflow: 'hidden',
                    marginBottom: 4,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${pct}%`,
                      background: `rgba(74, 108, 247, ${0.15 + pct / 300})`,
                      borderRadius: '0 0 8px 8px',
                      transition: 'height 1s ease',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '0.625rem',
                    color: '#a0aec0',
                    fontWeight: 500,
                  }}
                >
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
